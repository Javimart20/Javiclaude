"""Genera dist/index.html (todo en un solo archivo) y dist/<carpeta>.zip para subir a here.now.
Uso: python3 empaquetar.py carta-reyes-tania"""
import base64, json, re, os, sys, zipfile
d = sys.argv[1]; os.chdir(d); os.makedirs('dist', exist_ok=True)
def uri(p):
    mt = 'image/png' if p.endswith('.png') else 'image/jpeg'
    return f"data:{mt};base64," + base64.b64encode(open(p, 'rb').read()).decode()
def inline(src): return '<script>\n' + open(src).read().replace('</script', '<\\/script') + '\n</script>'
h = open('index.html').read()
h = re.sub(r'<link rel="stylesheet" href="styles\.css[^"]*">', lambda m: '<style>\n' + open('styles.css').read() + '\n</style>', h)
logo = uri('assets/logo.png')
h = h.replace('href="assets/logo.png"', f'href="{logo}"').replace('src="assets/logo.png"', f'src="{logo}"')
imgs = sorted(set(re.findall(r'"(assets/[^"]+\.jpg)"', open('data.js').read())))
swap = "<script>(function(){var M=" + json.dumps({p: uri(p) for p in imgs}) + ";window.CATALOGO.categorias.forEach(function(c){if(M[c.foto])c.foto=M[c.foto];c.items.forEach(function(i){if(M[i.foto])i.foto=M[i.foto];});});})();</script>"
for name in ['vendor/qrcode.js', 'data.js', 'app.js', 'navidad.js']:
    if not os.path.exists(name): continue
    h, n = re.subn(r'<script src="' + re.escape(name) + r'[^"]*"></script>', lambda m: inline(name) + ('\n' + swap if name == 'data.js' else ''), h)
    assert n == 1, name
assert 'src="assets' not in h and '.js?v' not in h and 'href="styles' not in h
open('dist/index.html', 'w').write(h)
files = ['index.html', 'styles.css', 'app.js', 'data.js', 'navidad.js'] + ['vendor/qrcode.js'] + ['assets/' + f for f in os.listdir('assets')]
with zipfile.ZipFile(f'dist/{os.path.basename(os.getcwd())}.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for f in files:
        if os.path.exists(f): z.write(f)
print(d, os.path.getsize('dist/index.html') // 1024, 'KB')
