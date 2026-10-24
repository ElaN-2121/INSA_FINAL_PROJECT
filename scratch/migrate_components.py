import glob
import re

files = glob.glob('apps/*/src/**/*.jsx', recursive=True)

# Components mapping
comp_names = ['Badge', 'Loader', 'PasswordInput', 'Table', 'Modal', 'SearchInput']

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()

    # Find imported components from local components folder
    imported = []
    lines = content.split('\n')
    new_lines = []
    removed_any = False

    for line in lines:
        matched = False
        for c in comp_names:
            pattern = rf"^import\s+{c}\s+from\s+['\"][^'\"]*components/{c}/{c}(?:\.jsx)?['\"];?\s*$"
            if re.match(pattern, line.strip()):
                imported.append(c)
                matched = True
                removed_any = True
                break
        if not matched:
            new_lines.append(line)

    if removed_any and imported:
        # Check if file already imports from @ethiocred/ui
        content_after = '\n'.join(new_lines)
        ui_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]@ethiocred/ui['\"];?", content_after)
        if ui_match:
            existing = [x.strip() for x in ui_match.group(1).split(',') if x.strip()]
            combined = sorted(list(set(existing + imported)))
            new_import = f"import {{ {', '.join(combined)} }} from '@ethiocred/ui';"
            content_after = content_after.replace(ui_match.group(0), new_import)
        else:
            combined = sorted(list(set(imported)))
            new_import = f"import {{ {', '.join(combined)} }} from '@ethiocred/ui';"
            # Insert at the top of the file after the first import or at top
            first_import = re.search(r"^import\s+", content_after, re.MULTILINE)
            if first_import:
                idx = first_import.start()
                content_after = content_after[:idx] + new_import + '\n' + content_after[idx:]
            else:
                content_after = new_import + '\n' + content_after

        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content_after)
        print(f"Migrated {f}: added {imported}")

print("Migration script finished successfully.")
