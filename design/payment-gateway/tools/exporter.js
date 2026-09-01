// Walks a rendered board and emits real vector SVG: <rect> for every painted
// box, <text> per LINE with the measured baseline, and any inline <svg> copied
// through under a transform. Same shape as the website hand-off SVGs.
window.__exportSVG = function (root, W, H) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const R0 = root.getBoundingClientRect(), OX = R0.left, OY = R0.top;
  const out = [];
  const opaque = c => c && c !== 'transparent' && !/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(c);
  const cv = document.createElement('canvas').getContext('2d');
  // double quotes in a font stack would close the attribute; hex reads cleaner in Figma
  const fam = f => {
    const first = f.split(',')[0].replace(/["']/g, '').trim();
    return /mono/i.test(f) ? 'monospace' : first;
  };
  const hex = c => {
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) return { fill: c, op: 1 };
    const p = m[1].split(',').map(Number);
    const h = '#' + p.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    return { fill: h, op: p.length > 3 ? p[3] : 1 };
  };
  const paint = (c, attr) => {
    const { fill, op } = hex(c);
    return ` ${attr}="${fill}"` + (op < 1 ? ` ${attr}-opacity="${px(op)}"` : '');
  };

  const px = v => Math.round(v * 1000) / 1000;

  function radius(cs) {
    const r = parseFloat(cs.borderTopLeftRadius) || 0;
    return r ? ` rx="${px(r)}"` : '';
  }

  function box(el, cs, r) {
    const x = px(r.left - OX), y = px(r.top - OY), w = px(r.width), h = px(r.height);
    if (w <= 0 || h <= 0) return;
    if (opaque(cs.backgroundColor))
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}"${radius(cs)}${paint(cs.backgroundColor, 'fill')}/>`);
    // borders, per side, so a 1px hairline or a single top rule both survive
    for (const [side, X, Y, Wd, Ht] of [
      ['Top', x, y, w, parseFloat(cs.borderTopWidth)],
      ['Bottom', x, y + h - parseFloat(cs.borderBottomWidth), w, parseFloat(cs.borderBottomWidth)],
      ['Left', x, y, parseFloat(cs.borderLeftWidth), h],
      ['Right', x + w - parseFloat(cs.borderRightWidth), y, parseFloat(cs.borderRightWidth), h]]) {
      const bw = (side === 'Top' || side === 'Bottom') ? Ht : Wd;
      if (bw > 0 && cs['border' + side + 'Style'] !== 'none' && opaque(cs['border' + side + 'Color'])) {
        const ww = (side === 'Top' || side === 'Bottom') ? Wd : bw;
        const hh = (side === 'Top' || side === 'Bottom') ? bw : Ht;
        out.push(`<rect x="${px(X)}" y="${px(Y)}" width="${px(ww)}" height="${px(hh)}"${paint(cs['border' + side + 'Color'], 'fill')}/>`);
      }
    }
  }

  function inlineSvg(el, r) {
    // Geometry can live under a transform, but TEXT must not: Figma imports a
    // scaled text node with a baked matrix and it stops behaving like a normal
    // text layer. So the shapes go in a group and every <text> is re-emitted at
    // absolute coordinates with its font size scaled through.
    const vb = (el.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const [vx, vy, vw] = vb.length === 4 ? vb : [0, 0, r.width];
    const k = r.width / vw;

    const shapes = el.cloneNode(true);
    shapes.querySelectorAll('text').forEach(n => n.remove());
    if (shapes.innerHTML.trim())
      out.push(`<g transform="translate(${px(r.left - OX)} ${px(r.top - OY)}) scale(${px(k)}) translate(${px(-vx)} ${px(-vy)})">${shapes.innerHTML}</g>`);
    const texts = [...el.querySelectorAll('text')];
    const rootCTM = el.ownerSVGElement ? null : el.getScreenCTM();
    for (const t of texts) {
      const m = t.getScreenCTM();
      const tx = parseFloat(t.getAttribute('x') || 0), ty = parseFloat(t.getAttribute('y') || 0);
      const ax = m.a * tx + m.c * ty + m.e, ay = m.b * tx + m.d * ty + m.f;
      const s = Math.hypot(m.a, m.b);
      const fs = parseFloat(t.getAttribute('font-size') || 16) * s;
      const lsRaw = parseFloat(t.getAttribute('letter-spacing') || 0) * s;
      const anchor = t.getAttribute('text-anchor');
      out.push(`<text x="${px(ax - OX)}" y="${px(ay - OY)}"`
        + ` font-family="${esc(fam(t.getAttribute('font-family') || 'Schibsted Grotesk'))}"`
        + ` font-size="${px(fs)}" font-weight="${t.getAttribute('font-weight') || 400}"`
        + ` fill="${t.getAttribute('fill') || '#000000'}"`
        + (anchor ? ` text-anchor="${anchor}"` : '')
        + (lsRaw ? ` letter-spacing="${px(lsRaw)}"` : '')
        + ` xml:space="preserve">${esc(t.textContent)}</text>`);
    }

  }

  function lines(node, cs) {
    // one <text> per visual line: step the range forward and cut where top changes
    let s = node.nodeValue;
    if (cs.textTransform === 'uppercase') s = s.toUpperCase();
    if (!s.trim()) return;
    const rng = document.createRange();
    const runs = [];
    let start = 0, prevTop = null, prevRect = null;
    for (let i = 0; i <= node.nodeValue.length; i++) {
      if (i === node.nodeValue.length) { if (i > start) runs.push([start, i, prevRect]); break; }
      rng.setStart(node, i); rng.setEnd(node, i + 1);
      const rr = rng.getBoundingClientRect();
      if (rr.width === 0 && rr.height === 0) continue;
      if (prevTop !== null && Math.abs(rr.top - prevTop) > 1) { runs.push([start, i, prevRect]); start = i; }
      prevTop = rr.top; prevRect = rr;
    }
    cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = cv.measureText('Hxy');
    const asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
    const fs = parseFloat(cs.fontSize);
    const ls = parseFloat(cs.letterSpacing) || 0;
    for (const [a, b] of runs) {
      // Measure the INK only, but keep a trailing space in the emitted string.
      // Trimming both ends welds a run onto the inline <code> that follows it
      // ("stores.tsloads"); measuring the untrimmed run shifts x by a space.
      let raw = node.nodeValue.slice(a, b);
      const lead = raw.length - raw.replace(/^\s+/, '').length;
      const trail = raw.length - raw.replace(/\s+$/, '').length;
      if (lead + trail >= raw.length) continue;
      rng.setStart(node, a + lead); rng.setEnd(node, b - trail);
      const r = rng.getBoundingClientRect();
      if (r.width === 0) continue;
      let t = raw.slice(lead, raw.length - trail) + (trail ? ' ' : '');
      if (cs.textTransform === 'uppercase') t = t.toUpperCase();
      const base = r.top + (r.height - (asc + desc)) / 2 + asc;
      out.push(`<text x="${px(r.left - OX)}" y="${px(base - OY)}" font-family="${esc(fam(cs.fontFamily))}"`
        + ` font-size="${px(fs)}" font-weight="${cs.fontWeight}"${paint(cs.color, 'fill')}`
        + (ls ? ` letter-spacing="${px(ls)}"` : '') + ` xml:space="preserve">${esc(t)}</text>`);
    }
  }

  (function walk(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (el.tagName.toLowerCase() === 'svg') { inlineSvg(el, r); return; }
    box(el, cs, r);
    for (const n of el.childNodes) {
      if (n.nodeType === 3) lines(n, cs);
      else if (n.nodeType === 1) walk(n);
    }
  })(root);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + out.join('') + '</svg>';
};
