import re

with open('clipmerge/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

for m in re.finditer(r'(id=[\'"]view\w+[\'"]|<main\b[^>]*>|</main>)', content):
    line = content[:m.start()].count('\n') + 1
    print(f"Line {line}: {m.group(0)}")
