import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace <style> block
style_replacement = '''<link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#10b981">'''
html = re.sub(r'<style>.*?</style>', style_replacement, html, count=1, flags=re.DOTALL)

# Extract <script> block (only the big one at the end)
script_match = re.search(r'<script>(.*?)</script>.*?</body>', html, flags=re.DOTALL)
if script_match:
    js_content = script_match.group(1).strip()
    with open("app.js", "w", encoding="utf-8") as f:
        f.write(js_content)
    
    script_replacement = '''<script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
            .catch(err => console.log('SW registration failed: ', err));
        });
      }
    </script>
    <script src="app.js"></script>
</body>'''
    html = html.replace(script_match.group(0), script_replacement)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
