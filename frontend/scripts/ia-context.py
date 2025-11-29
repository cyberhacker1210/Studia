import os

# --- CONFIGURATION ---
# Taille max par message (15000 est une valeur sûre pour ChatGPT/Claude)
TAILLE_MAX_PAR_MESSAGE = 15000

DOSSIERS_FRONTEND = [
    'src', 'app', 'pages', 'components', 'hooks', 'context',
    'store', 'utils', 'lib', 'styles', 'public'
]

FICHIERS_CONFIG = [
    'package.json', 'tsconfig.json', 'next.config.js',
    'tailwind.config.js', '.env.local'
]

EXTENSIONS_ACCEPTEES = {
    '.js', '.jsx', '.ts', '.tsx', '.vue', '.css', '.scss', '.json'
}

IGNORE = {
    'node_modules', '.git', '.next', 'dist', 'build',
    'package-lock.json', 'yarn.lock'
}


def generer_arborescence(root_path):
    """Génère juste la structure des dossiers pour l'IA"""
    tree = ["CONTEXTE : ARBORESCENCE DU PROJET (Code à suivre dans les prochains messages)", "=" * 50]
    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if d not in IGNORE]
        level = root.replace(root_path, '').count(os.sep)
        indent = ' ' * 4 * (level)
        tree.append(f"{indent}📂 {os.path.basename(root)}/")
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            if f not in IGNORE:
                tree.append(f"{subindent}📄 {f}")
    return "\n".join(tree)


def main():
    root_path = os.getcwd()
    print(f"🚀 Analyse et découpage du projet dans : {root_path}")

    # 1. Générer le Sommaire
    sommaire = generer_arborescence(root_path)
    with open("CHAT_0_STRUCTURE.txt", "w", encoding="utf-8") as f:
        f.write(sommaire)
    print("✅ 'CHAT_0_STRUCTURE.txt' créé (Donnez ça en premier à l'IA).")

    # 2. Récupérer et découper le contenu
    files_content = []

    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if d not in IGNORE]

        # Filtrage dossier front
        rel_dir = os.path.relpath(root, root_path)
        is_front = any(d in rel_dir.split(os.sep) for d in DOSSIERS_FRONTEND)
        is_root = rel_dir == '.'

        if not (is_front or is_root):
            continue

        for file in files:
            if file in IGNORE: continue

            _, ext = os.path.splitext(file)
            is_config = is_root and file in FICHIERS_CONFIG
            is_code = is_front and ext in EXTENSIONS_ACCEPTEES

            if is_config or is_code:
                path = os.path.join(root, file)
                relpath = os.path.relpath(path, root_path)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # On ignore les fichiers trop gros (minifiés)
                        if len(content) > 50000: continue

                        formatted = f"\n{'=' * 40}\nFICHIER : {relpath}\n{'=' * 40}\n{content}\n"
                        files_content.append(formatted)
                except:
                    pass

    # 3. Écriture en morceaux (Chunks)
    part_num = 1
    current_chunk = ""

    for file_text in files_content:
        # Si ajouter ce fichier dépasse la limite, on sauvegarde et on passe au suivant
        if len(current_chunk) + len(file_text) > TAILLE_MAX_PAR_MESSAGE:
            filename = f"CHAT_PARTIE_{part_num}.txt"
            header = f"PARTIE {part_num} (Suite du code...)\n"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(header + current_chunk)
            print(f"📦 {filename} créé ({len(current_chunk)} caractères)")

            part_num += 1
            current_chunk = ""  # Reset

        current_chunk += file_text

    # Sauvegarder le reste
    if current_chunk:
        filename = f"CHAT_PARTIE_{part_num}.txt"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(f"PARTIE {part_num} (FIN)\n" + current_chunk)
        print(f"📦 {filename} créé ({len(current_chunk)} caractères)")

    print("\n🏁 TERMINÉ ! Mode d'emploi :")
    print("1. Envoyez 'CHAT_0_STRUCTURE.txt' pour que l'IA comprenne l'architecture.")
    print("2. Envoyez 'CHAT_PARTIE_1.txt', puis le 2, etc.")


if __name__ == "__main__":
    main()