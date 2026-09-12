with open('clipmerge/main.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    for bad in ['btnOpenImageEnhancer', 'postMergePosterStatus', 'btnGoToSaveTab']:
        if bad in line:
            print(f"Line {i}: {line.strip()}")
