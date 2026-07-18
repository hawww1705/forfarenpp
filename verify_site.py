import os
import re
import json
from html.parser import HTMLParser

class SiteParser(HTMLParser):
    def __init__(self, filepath):
        super().__init__()
        self.filepath = filepath
        self.h1_count = 0
        self.images_without_alt = []
        self.images_without_lazy = []
        self.json_ld_blocks = []
        self.links = []
        self.current_tag = None
        self.current_attrs = {}
        self._in_json_ld = False
        self._json_ld_content = ""

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        attr_dict = dict(attrs)
        self.current_attrs = attr_dict

        if tag == 'h1':
            self.h1_count += 1
            
        elif tag == 'img':
            src = attr_dict.get('src', 'unknown')
            classes = attr_dict.get('class', '')
            # Ignore lightbox placeholder image
            if 'lightbox-img' in classes or not src:
                return
            # Check for alt attribute
            if 'alt' not in attr_dict or not attr_dict['alt'].strip():
                self.images_without_alt.append(src)
            # Check for lazy loading (exclude hero/logo images by path or class)
            is_hero = 'hero' in src or 'logo' in src or 'hero' in classes
            if 'lazy' not in attr_dict.get('loading', '') and not is_hero:
                self.images_without_lazy.append(src)
                
        elif tag == 'script' and attr_dict.get('type') == 'application/ld+json':
            self._in_json_ld = True
            self._json_ld_content = ""
            
        elif tag == 'a':
            href = attr_dict.get('href')
            if href:
                self.links.append(href)

    def handle_data(self, data):
        if self._in_json_ld:
            self._json_ld_content += data

    def handle_endtag(self, tag):
        if tag == 'script' and self._in_json_ld:
            self.json_ld_blocks.append(self._json_ld_content)
            self._in_json_ld = False

def verify_file(filepath, project_root):
    relative_path = os.path.relpath(filepath, project_root)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    parser = SiteParser(filepath)
    parser.feed(content)

    issues = []
    
    # 1. H1 Count Validation
    if parser.h1_count != 1:
        issues.append(f"H1 Error: Expected exactly 1 <h1> tag, found {parser.h1_count}")

    # 2. Alt tags check
    if parser.images_without_alt:
        issues.append(f"Accessibility Warning: Images missing 'alt' attributes: {parser.images_without_alt}")

    # 3. Lazy loading warning (optional but good for core web vitals)
    if parser.images_without_lazy:
        issues.append(f"Performance Suggestion: Non-hero images missing loading='lazy': {parser.images_without_lazy}")

    # 4. JSON-LD Syntax validation
    for idx, json_str in enumerate(parser.json_ld_blocks):
        try:
            json.loads(json_str, strict=False)
        except json.JSONDecodeError as e:
            issues.append(f"JSON-LD Error in block #{idx + 1}: {str(e)} | content: {repr(json_str)}")

    # 5. Link verification
    for link in parser.links:
        # Ignore external links, anchors, and tel/mailto
        if link.startswith(('http://', 'https://', '#', 'mailto:', 'tel:')):
            continue
        
        # Calculate target path relative to the file location
        file_dir = os.path.dirname(filepath)
        # Strip anchor suffix if present e.g. services.html#construction-services
        clean_link = link.split('#')[0]
        if not clean_link:
            continue
            
        target_path = os.path.abspath(os.path.join(file_dir, clean_link))
        
        if not os.path.exists(target_path):
            issues.append(f"Link Integrity Error: Link target '{link}' (resolved: {target_path}) does not exist.")

    return issues

def run_verification():
    project_root = r"C:\Users\Hizkia Ariel Wijono\.gemini\antigravity\scratch\mada-global-if-interior"
    html_files = []
    
    # Traverse directories to search for HTML files
    for root, dirs, files in os.walk(project_root):
        # Exclude assets directories
        if 'assets' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    print("=========================================")
    print("RUNNING STATIC SITE VERIFICATION CHECKS")
    print("=========================================")
    print(f"Scanned {len(html_files)} HTML pages.\n")

    all_passed = True
    for file in html_files:
        rel_path = os.path.relpath(file, project_root)
        print(f"Checking: {rel_path} ...", end="")
        issues = verify_file(file, project_root)
        if issues:
            print(" FAILED")
            for issue in issues:
                print(f"  - {issue}")
            all_passed = False
        else:
            print(" PASSED")

    print("\n=========================================")
    if all_passed:
        print("RESULT: ALL STATIC VERIFICATIONS PASSED")
    else:
        print("RESULT: VERIFICATION FAILED (Review issues above)")
    print("=========================================")

if __name__ == "__main__":
    run_verification()
