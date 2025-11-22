import os

# Dossiers à analyser
TARGET_DIRS = ['backend', 'frontend', 'src']

# Fichiers/dossiers à ignorer
IGNORE = {
    'node_modules', '.git', '__pycache__', 'venv', 'env',
    'dist', 'build', '.next', 'coverage', 'package-lock.json',
    'yarn.lock', '.env', 'public', 'assets', 'static'
}

# Extensions à prioriser (fichiers de code principaux)
PRIORITY_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.vue'
}

# Fichiers de config à inclure
CONFIG_FILES = {
    'package.json', 'requirements.txt', 'config.py', 'settings.py',
    'app.py', 'main.py', 'index.js', 'App.jsx', 'App.tsx'
}

MAX_FILES = 20


def should_ignore(path, name):
    return name in IGNORE or name.startswith('.')


def get_relevant_files(startpath):
    """Récupère les fichiers pertinents"""
    files_list = []

    for root, dirs, files in os.walk(startpath):
        # Filtrer les dossiers à ignorer
        dirs[:] = [d for d in dirs if not should_ignore(root, d)]

        for file in files:
            if should_ignore(root, file):
                continue

            filepath = os.path.join(root, file)
            _, ext = os.path.splitext(file)
            relative_path = os.path.relpath(filepath, startpath)

            # Prioriser certains fichiers
            priority = 0
            if file in CONFIG_FILES:
                priority = 3
            elif ext in PRIORITY_EXTENSIONS:
                priority = 2
            elif ext in {'.json', '.yml', '.yaml', '.md'}:
                priority = 1
            else:
                continue

            files_list.append((priority, relative_path, filepath))

    # Trier par priorité (décroissant) puis par nom
    files_list.sort(key=lambda x: (-x[0], x[1]))

    return files_list[:MAX_FILES]


def generate_export():
    """Génère l'export du workspace"""
    output = []
    output.append("=" * 80)
    output.append("EXPORT WORKSPACE - FICHIERS BACKEND/FRONTEND")
    output.append("=" * 80)
    output.append("")

    all_files = []

    # Chercher dans les dossiers cibles
    for target_dir in TARGET_DIRS:
        if os.path.exists(target_dir):
            print(f"📁 Analyse de {target_dir}/...")
            files = get_relevant_files(target_dir)
            all_files.extend(files)

    # Si pas de dossiers spécifiques, analyser le dossier courant
    if not all_files:
        print("📁 Analyse du dossier courant...")
        all_files = get_relevant_files('.')

    # Retirer les doublons et limiter
    seen = set()
    unique_files = []
    for priority, relpath, fullpath in all_files:
        if relpath not in seen:
            seen.add(relpath)
            unique_files.append((priority, relpath, fullpath))

    unique_files = unique_files[:MAX_FILES]

    # Arborescence
    output.append("📂 STRUCTURE DES FICHIERS SÉLECTIONNÉS:")
    output.append("-" * 80)
    for _, relpath, _ in unique_files:
        output.append(f"  {relpath}")
    output.append("")
    output.append(f"Total: {len(unique_files)} fichiers")
    output.append("")

    # Contenus
    output.append("=" * 80)
    output.append("📄 CONTENU DES FICHIERS")
    output.append("=" * 80)
    output.append("")

    for _, relpath, fullpath in unique_files:
        try:
            with open(fullpath, 'r', encoding='utf-8') as f:
                content = f.read()

            output.append("")
            output.append("/" * 80)
            output.append(f"FICHIER: {relpath}")
            output.append("/" * 80)
            output.append(content)
            output.append("")

        except Exception as e:
            output.append(f"\n[❌ Erreur lecture {relpath}: {str(e)}]\n")

    return '\n'.join(output)


def main():
    print("🚀 Début de l'export...")

    full_text = generate_export()

    # Sauvegarder
    output_file = 'workspace_code.txt'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(full_text)

    print(f"\n✅ Export terminé!")
    print(f"📝 Fichier créé: {output_file}")
    print(f"📊 Taille: {len(full_text):,} caractères")

    # Si trop gros, proposer de diviser
    if len(full_text) > 25000:
        nb_parts = (len(full_text) // 25000) + 1
        print(f"⚠️  Fichier volumineux ({nb_parts} parties pour le chat)")
        print(f"💡 Conseil: Copiez et envoyez en {nb_parts} messages séparés")


if __name__ == "__main__":
    main()