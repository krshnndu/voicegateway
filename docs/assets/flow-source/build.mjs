import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { compile, splitLines, DARK_THEME } from 'reladraw';
import { openSync } from 'fontkit';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import rough from 'roughjs/bundled/rough.cjs.js';

// Reladraw owns every position and edge route. Rough.js adds only the ink style.
const font = openSync(fileURLToPath(new URL('./Kalam-Regular.ttf', import.meta.url)));
const fontSize = 20;
const lineHeight = size => size * 1.42;
const width = (text, size) => font.layout(text).advanceWidth * size / font.unitsPerEm;
const measurer = {
  fontFamily: 'Kalam',
  lineHeight,
  measure(text, size) {
    const lines = splitLines(text);
    return { lines, width: Math.max(0, ...lines.map(line => width(line, size))), height: lines.length * lineHeight(size) };
  },
};
const theme = {
  ...DARK_THEME, background: '#141414', text: '#f5f5f7',
  mutedText: '#aaaab0', boxFill: '#202023', boxStroke: '#68686e', edge: '#aaaab0',
  primary: { color: '#2997ff', subtle: '#142c43', on: '#141414' },
  secondary: { color: '#30d158', subtle: '#173720', on: '#141414' },
};
const source = await readFile(new URL('../voicegateway-flow.reladraw', import.meta.url), 'utf8');
const svg = compile(source, { fontSize, measurer, theme });
const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
const root = doc.documentElement;
const ns = root.namespaceURI;
const element = (name, attributes) => {
  const node = doc.createElementNS(ns, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
};

const generator = rough.generator();
let seed = 1;
for (const path of Array.from(root.getElementsByTagName('path'))) {
  const stroke = path.getAttribute('stroke');
  if (!stroke || stroke === 'none' || path.hasAttribute('marker-start') || path.hasAttribute('marker-end')) continue;
  const drawable = generator.path(path.getAttribute('d'), {
    stroke, fill: path.getAttribute('fill') || undefined, fillStyle: 'solid',
    strokeWidth: 1.4, roughness: 0.65, bowing: 0.65, seed: seed++,
  });
  const group = element('g', {});
  for (const generated of generator.toPaths(drawable)) {
    const rendered = element('path', generated);
    for (const name of ['marker-start', 'marker-end', 'stroke-dasharray']) {
      if (path.hasAttribute(name)) rendered.setAttribute(name, path.getAttribute(name));
    }
    group.appendChild(rendered);
  }
  path.parentNode.replaceChild(group, path);
}

// Outline every label, so GitHub needs no external font and cannot substitute it.
for (const text of Array.from(root.getElementsByTagName('text'))) {
  if (text.getElementsByTagName('tspan').length) throw new Error('Add explicit tspan support before using inline mixed-color labels.');
  const label = text.textContent;
  let inherited = text;
  while (inherited && !inherited.hasAttribute?.('font-size')) inherited = inherited.parentNode;
  const size = Number.parseFloat(inherited?.getAttribute('font-size') || String(fontSize));
  const run = font.layout(label);
  let x = Number(text.getAttribute('x'));
  const y = Number(text.getAttribute('y'));
  const scale = size / font.unitsPerEm;
  const anchor = text.getAttribute('text-anchor');
  if (anchor === 'middle') x -= run.advanceWidth * scale / 2;
  if (anchor === 'end') x -= run.advanceWidth * scale;
  const group = element('g', { fill: text.getAttribute('fill'), 'aria-label': label });
  const title = element('title', {});
  title.textContent = label;
  group.appendChild(title);
  let cursor = 0;
  for (let i = 0; i < run.glyphs.length; i++) {
    const position = run.positions[i];
    const path = element('path', {
      d: run.glyphs[i].path.toSVG(),
      transform: `translate(${x + (cursor + position.xOffset) * scale} ${y - position.yOffset * scale}) scale(${scale} ${-scale})`,
    });
    group.appendChild(path);
    cursor += position.xAdvance;
  }
  text.parentNode.replaceChild(group, text);
}
root.removeAttribute('font-family');
root.removeAttribute('font-size');
root.setAttribute('role', 'img');
root.setAttribute('aria-labelledby', 'flow-title flow-description');
const title = element('title', { id: 'flow-title' });
title.textContent = 'One call. One timeline.';
const description = element('desc', { id: 'flow-description' });
description.textContent = 'A call crosses SIP, the media server, the agent and its STT, LLM and TTS models. VoiceGateway collects their telemetry into a call timeline with transcript, latency, usage and events. VoiceGateway observes the call and stays outside the audio path. Conceptual V1 flow.';
root.insertBefore(description, root.firstChild);
root.insertBefore(title, root.firstChild);
await writeFile(new URL('../voicegateway-flow.svg', import.meta.url), new XMLSerializer().serializeToString(doc) + '\n');
console.log(`Built voicegateway-flow.svg (${root.getAttribute('width')} × ${root.getAttribute('height')})`);
