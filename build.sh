set -e
npx esbuild src/standalone.jsx --bundle --minify --format=iife --alias:@=./src --loader:.js=jsx --define:process.env.NODE_ENV='"production"' --outfile=out.js 2>&1 | tail -3
npx tailwindcss -i src/index.css -o out.css --minify 2>&1 | tail -1
python3 - <<'PY'
css=open('out.css',encoding='utf8').read();js=open('out.js',encoding='utf8').read().replace('</script','<\\/script')
h='<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Штаб закупок</title><style>'+css+'</style></head><body><div id="root"></div><script>'+js+'</script></body></html>'
open('docs/index.html','w',encoding='utf8').write(h)
PY
