# Regenerating `system-flow.png`

The diagram is hand-authored SVG in `system-flow.html`. Edit that, then re-export.

```bash
cd docs && python3 -m http.server 8099
```

Open <http://localhost:8099/system-flow.html>, and in the browser console:

```js
const svg = document.getElementById('d');
const css = [...document.styleSheets[0].cssRules].map(r => r.cssText).join('\n');
const clone = svg.cloneNode(true);
const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
style.textContent = css;                    // a serialised SVG carries no <style>
clone.insertBefore(style, clone.firstChild);
clone.setAttribute('viewBox', '-56 -84 1612 1140');
clone.setAttribute('width', 1612);
clone.setAttribute('height', 1140);

const img = new Image();
img.src = 'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(new XMLSerializer().serializeToString(clone));
await img.decode();

const c = Object.assign(document.createElement('canvas'), { width: 3224, height: 2280 });
const ctx = c.getContext('2d');
ctx.fillStyle = '#E4E3DD';                  // §2.3 day surface, not transparent
ctx.fillRect(0, 0, c.width, c.height);
ctx.drawImage(img, 0, 0, c.width, c.height);
c.toDataURL('image/png');                   // right-click the result to save
```

Exported at 2× (3224 × 2280) so it stays sharp in a slide or a print-out.
