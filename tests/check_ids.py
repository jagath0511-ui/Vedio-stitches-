import re

with open('clipmerge/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('clipmerge/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Find all document.getElementById('...') in main.js
ids = re.findall(r"document\.getElementById\(['\"]([^'\"]+)['\"]\)", js)
ids = sorted(list(set(ids)))

missing = []
for el_id in ids:
    pattern = rf'id=[\'"]{re.escape(el_id)}[\'"]'
    if not re.search(pattern, html):
        missing.append(el_id)

print(f"Total IDs checked: {len(ids)}")
print(f"Missing IDs in HTML: {missing}")

# Check if any missing IDs have addEventListener called without null check
for el_id in missing:
    # Look for patterns like `el_id.addEventListener` or variable assigned to it
    print(f"Searching usages of missing ID: {el_id}")
