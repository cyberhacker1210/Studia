import os

# === CONFIGURATION ===
MAX_LINES_PER_FILE = 2500# On coupe tous les 3000 lignes
TARGET_DIRECTORIES = ["backend", "frontend"]

# Dossiers à ignorer (Mise à jour plus stricte)
IGNORE_DIRS = {
    "node_modules", ".next", ".nuxt", "build", "dist", "coverage", ".turbo",
    "venv", "env", ".venv", "__pycache__", "site-packages",
    ".git", ".idea", ".vscode", "migrations", "migrations_ts"  # Souvent très lourd
}

IGNORE_FILES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock",
    "extract_studia.py", "code_studia_complet.txt"
}

IGNORE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".svg", ".ico", ".gif", ".webp",
    ".exe", ".dll", ".pyc", ".sqlite3", ".db", ".zip", ".gz",
    ".map", ".css.map", ".js.map"  # Fichiers de mapping inutiles
}


def is_text_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            f.read(512)
        return True
    except:
        return False


def main():
    root_dir = os.getcwd()
    part_num = 1
    line_count = 0

    # Ouverture du premier fichier
    current_file = open(f"studia_partie_{part_num}.txt", "w", encoding="utf-8")
    current_file.write(f"# PARTIE {part_num}\n\n")

    for target_dir in TARGET_DIRECTORIES:
        full_target_path = os.path.join(root_dir, target_dir)
        if not os.path.exists(full_target_path): continue

        for dirpath, dirnames, filenames in os.walk(full_target_path):
            dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]

            for filename in filenames:
                ext = os.path.splitext(filename)[1].lower()
                if filename in IGNORE_FILES or ext in IGNORE_EXTENSIONS: continue

                file_path = os.path.join(dirpath, filename)
                relative_path = os.path.relpath(file_path, root_dir)

                if is_text_file(file_path):
                    # Lire le contenu
                    try:
                        with open(file_path, "r", encoding="utf-8") as infile:
                            content = infile.read()

                            # Calculer la taille pour savoir si on change de fichier
                            content_lines = content.count('\n') + 5

                            # Si on dépasse la limite, on change de fichier de sortie
                            if line_count + content_lines > MAX_LINES_PER_FILE:
                                current_file.close()
                                part_num += 1
                                line_count = 0
                                current_file = open(f"studia_partie_{part_num}.txt", "w", encoding="utf-8")
                                current_file.write(f"# PARTIE {part_num} (Suite)\n\n")
                                print(f"Création de la partie {part_num}...")

                            # Écriture
                            current_file.write(f"\n{'=' * 50}\nFICHIER : {relative_path}\n{'=' * 50}\n")
                            current_file.write(content + "\n")
                            line_count += content_lines

                    except Exception as e:
                        pass

    current_file.close()
    print(f"\n✅ TERMINÉ ! Tu as {part_num} fichiers (studia_partie_1.txt, etc.).")
    print("Envoie-les moi un par un dans l'ordre.")


if __name__ == "__main__":
    main()