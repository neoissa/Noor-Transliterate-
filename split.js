const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace style block and inject manifest link
const styleReplacement = `<link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#10b981">`;
html = html.replace(/<style>[\s\S]*?<\/style>/, styleReplacement);

// Replace script block and split to app.js
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>[\s\S]*?<\/body>/);
if (scriptMatch) {
    fs.writeFileSync('app.js', scriptMatch[1].trim() + '\n');
    const scriptReplacement = `<script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
            .catch(err => console.log('SW registration failed: ', err));
        });
      }
    </script>
    <script src="app.js"></script>
</body>`;
    html = html.replace(scriptMatch[0], scriptReplacement);
}

fs.writeFileSync('index.html', html);
