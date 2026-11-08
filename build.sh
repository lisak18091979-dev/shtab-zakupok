set -euo pipefail
npx esbuild src/standalone.jsx --bundle --minify --format=iife --alias:@=./src --loader:.js=jsx --define:process.env.NODE_ENV='"production"' --outfile=out.js 2>&1 | tail -3
npx tailwindcss -i src/index.css -o out.css --minify 2>&1 | tail -1
python3 - <<'PY'
import base64,re,pathlib
faces=pathlib.Path('src/fonts/fonts.css').read_text(encoding='utf8')
def embed(match):
    data=(pathlib.Path('src/fonts')/match.group(1)).read_bytes()
    return 'url(data:font/woff2;base64,'+base64.b64encode(data).decode()+')'
faces=re.sub(r'url\(([^)]+)\)',embed,faces)
css=faces+open('out.css',encoding='utf8').read();js=open('out.js',encoding='utf8').read().replace('</script','<\\/script')
h='<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Штаб закупок</title><style>'+css+'</style></head><body><div id="root"></div><script>'+js+'</script></body></html>'
open('docs/index.html','w',encoding='utf8').write(h)
PY
