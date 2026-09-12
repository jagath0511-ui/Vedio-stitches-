from html.parser import HTMLParser

class TagChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
        self.void_tags = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def handle_starttag(self, tag, attrs):
        if tag.lower() not in self.void_tags:
            line, col = self.getpos()
            self.stack.append((tag.lower(), line))

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in self.void_tags:
            return
        if not self.stack:
            line, col = self.getpos()
            self.errors.append(f"Unexpected closing tag </{tag}> at line {line}")
            return
        last_tag, last_line = self.stack.pop()
        if last_tag != tag:
            line, col = self.getpos()
            self.errors.append(f"Mismatched tag: expected </{last_tag}> (opened at line {last_line}), but found </{tag}> at line {line}")

with open('clipmerge/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

checker = TagChecker()
checker.feed(html)

print(f"Total unclosed tags in stack: {len(checker.stack)}")
for tag, line in checker.stack[-20:]:
    print(f"  Unclosed <{tag}> opened at line {line}")

print(f"Total mismatch errors: {len(checker.errors)}")
for err in checker.errors[:10]:
    print(f"  {err}")
