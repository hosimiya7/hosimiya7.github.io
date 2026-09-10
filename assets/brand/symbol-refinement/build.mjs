import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// The only external dependency is sharp. Supply its installed directory when
// it is not present in this project's normal Node module resolution path.
const require = createRequire(import.meta.url);
const sharp = process.env.MEMORIA_SHARP_PATH ? require(process.env.MEMORIA_SHARP_PATH) : require('sharp');
const here = path.dirname(fileURLToPath(import.meta.url));
const palette = { night: '#0C1524', paper: '#FFF8E8', amber: '#F29441', ember: '#D95D39', gold: '#F2C12E' };

// All drawings share one 256-unit square. The palm, thumb and raised fingers
// form one closed contour, without the original fine white outline.
const shapes = {
  flame: 'M130 26 C111 52 80 91 80 124 C80 154 101 176 130 176 C159 176 180 154 180 124 C180 91 149 52 130 26Z',
  middle: 'M130 91 C118 108 98 129 98 146 C98 164 112 176 130 176 C148 176 162 164 162 146 C162 129 142 108 130 91Z',
  core: 'M130 129 C124 138 114 149 114 158 C114 169 121 176 130 176 C139 176 146 169 146 158 C146 149 136 138 130 129Z',
  monoCore: 'M130 110 C121 124 111 136 111 147 C111 159 119 167 130 167 C141 167 149 159 149 147 C149 136 139 124 130 110Z',
  hand: 'M37 168 C57 160 74 163 96 174 L124 186 C138 191 151 192 164 187 L176 182 C184 179 190 184 187 191 C183 202 169 209 152 211 C133 213 115 208 103 203 C97 201 94 204 100 208 C121 222 149 224 174 215 C196 207 208 190 221 168 C226 160 235 164 232 173 C218 213 185 240 146 242 C107 244 73 224 46 202 L29 188 C23 181 28 172 37 168Z',
  outline: 'M41 167 C23 144 29 119 46 93 C65 65 92 41 128 15 C164 42 190 65 207 94 C223 121 228 146 217 166'
};

function svg({ mono = false, light = false, outline = false, icon = false } = {}) {
  const ink = light ? palette.night : palette.paper;
  const drawing = [
    outline ? `<path d="${shapes.outline}" fill="none" stroke="${ink}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` : '',
    mono ? `<path d="${shapes.flame} ${shapes.monoCore}" fill="${ink}" fill-rule="evenodd"/>` : `<path d="${shapes.flame}" fill="${palette.amber}"/>\n  <path d="${shapes.middle}" fill="${palette.ember}"/>\n  <path d="${shapes.core}" fill="${palette.gold}"/>`,
    `<path d="${shapes.hand}" fill="${ink}"/>`
  ].filter(Boolean).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${icon ? 1024 : 256}" height="${icon ? 1024 : 256}" viewBox="0 0 256 256" fill="none">\n  <title>Memoria — 灯りを手で包む</title>\n  ${icon ? `<rect width="256" height="256" fill="${palette.night}"/>\n  <g transform="translate(22 12) scale(.82)">` : ''}\n  ${drawing}\n  ${icon ? '</g>' : ''}\n</svg>\n`;
}

const assets = {
  'memoria-symbol.svg': svg(),
  'memoria-symbol-on-light.svg': svg({ light: true }),
  'memoria-symbol-mono.svg': svg({ mono: true, light: true }),
  'memoria-symbol-reversed.svg': svg({ mono: true }),
  'memoria-symbol-outline.svg': svg({ outline: true }),
  'memoria-symbol-outline-mono.svg': svg({ outline: true, mono: true }),
  'memoria-app-icon.svg': svg({ icon: true })
};
for (const [name, data] of Object.entries(assets)) await fs.writeFile(path.join(here, name), data);
for (const size of [32, 48, 64, 128, 256, 512, 1024]) {
  await sharp(Buffer.from(assets['memoria-app-icon.svg'])).resize(size, size).png().toFile(path.join(here, `memoria-app-icon-${size}.png`));
}
await sharp(Buffer.from(assets['memoria-symbol.svg'])).resize(1024, 1024).png().toFile(path.join(here, 'memoria-symbol-transparent-1024.png'));

const original = await fs.readFile(path.join(here, 'original-reference.svg'));
const layouts = [
  { x: 0, label: 'ORIGINAL', subtitle: 'Provided artwork', image: original },
  { x: 400, label: 'A / OPEN', subtitle: 'Simplified hand · no outer line', image: assets['memoria-symbol.svg'] },
  { x: 800, label: 'B / OUTLINE', subtitle: 'Same hand · stronger outer line', image: assets['memoria-symbol-outline.svg'] }
];
const canvas = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750"><rect width="1200" height="750" fill="${palette.night}"/>
<g font-family="Segoe UI, sans-serif" fill="${palette.paper}">${layouts.map(({x,label,subtitle}) => `<text x="${x+40}" y="44" font-size="15" letter-spacing="2">${label}</text><text x="${x+40}" y="70" font-size="13" fill="#abb4c0">${subtitle}</text>`).join('')}</g>
<g stroke="#fff8e822"><path d="M400 26V724M800 26V724"/></g>
<g font-family="Segoe UI, sans-serif" font-size="12" fill="#abb4c0">${layouts.map(({x})=>`<text x="${x+42}" y="422">SMALL EXPORTS</text><text x="${x+48}" y="548">64 px</text><text x="${x+154}" y="548">48 px</text><text x="${x+247}" y="548">32 px</text>`).join('')}</g>
<g font-family="Segoe UI, sans-serif" font-size="12" fill="#abb4c0"><text x="442" y="597">ONE COLOR / 64 + 32 px</text><text x="842" y="597">ONE COLOR / 64 + 32 px</text></g>
</svg>`;
const composites = [];
for (const { x, image } of layouts) {
  const buffer = typeof image === 'string' ? Buffer.from(image) : image;
  const rendered = await sharp(buffer).resize({height:260, width:260, fit:'inside'}).png().toBuffer({resolveWithObject:true});
  composites.push({ input: rendered.data, left:x + Math.round((400-rendered.info.width)/2), top:112 });
  for (const [size, offset] of [[64,44],[48,150],[32,244]]) {
    const small = await sharp(buffer).resize({width:size, height:size, fit:'contain', background:'#00000000'}).png().toBuffer();
    composites.push({input:small, left:x+offset, top:510-size});
  }
}
for (const [name,x] of [['memoria-symbol-reversed.svg',444],['memoria-symbol-outline-mono.svg',844]]) {
  for (const [size,dx] of [[64,0],[32,112]]) composites.push({input:await sharp(Buffer.from(assets[name])).resize(size,size).png().toBuffer(),left:x+dx,top:696-size});
}
await sharp(Buffer.from(canvas)).composite(composites).png().toFile(path.join(here,'comparison.png'));

const swatches = [
  { x:0, bg:palette.paper, fg:palette.night, name:'memoria-symbol-on-light.svg', label:'COLOR / LIGHT BACKGROUND' },
  { x:320, bg:palette.paper, fg:palette.night, name:'memoria-symbol-mono.svg', label:'ONE COLOR / DARK INK' },
  { x:640, bg:palette.night, fg:palette.paper, name:'memoria-symbol-reversed.svg', label:'ONE COLOR / LIGHT INK' }
];
const proof = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="350">${swatches.map(({x,bg,fg,label})=>`<rect x="${x}" width="320" height="350" fill="${bg}"/><text x="${x+24}" y="30" font-family="Segoe UI,sans-serif" font-size="12" fill="${fg}">${label}</text><text x="${x+38}" y="317" font-family="Segoe UI,sans-serif" font-size="12" fill="${fg}">128 px</text><text x="${x+193}" y="317" font-family="Segoe UI,sans-serif" font-size="12" fill="${fg}">64 / 32 px</text>`).join('')}</svg>`;
const proofImages = [];
for (const {x,name} of swatches) {
  for (const [size,left,top] of [[128,24,120],[64,196,116],[32,212,220]]) {
    proofImages.push({ input: await sharp(Buffer.from(assets[name])).resize(size,size).png().toBuffer(), left:x+left, top });
  }
}
await sharp(Buffer.from(proof)).composite(proofImages).png().toFile(path.join(here,'light-and-mono.png'));
console.log(`Generated ${Object.keys(assets).length} SVG assets, seven icon sizes, transparent PNG, and comparison.png in ${here}`);
