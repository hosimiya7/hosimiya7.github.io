import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = process.env.MEMORIA_SHARP_PATH ? require(process.env.MEMORIA_SHARP_PATH) : require('sharp');
const here = path.dirname(fileURLToPath(import.meta.url));
const color = { night:'#0C1524', paper:'#FFF8E8', amber:'#F29441', ember:'#D95D39', gold:'#F2C12E' };

// The canopy and lower hand together form the shelter. Keep the canopy in
// every export; it is a semantic part of the mark, not optional decoration.
const canopy = 'M45 166 C35 142 45 115 61 90 C79 61 103 39 128 19 C154 40 177 62 194 90 C211 116 218 143 211 162';
const flame = 'M129 59 C115 79 90 108 90 132 C90 156 107 171 129 171 C151 171 168 156 168 132 C168 108 143 79 129 59Z';
const middle = 'M129 105 C119 119 104 136 104 149 C104 163 115 171 129 171 C143 171 154 163 154 149 C154 136 139 119 129 105Z';
const core = 'M129 139 C124 146 117 154 117 160 C117 167 122 171 129 171 C136 171 141 167 141 160 C141 154 134 146 129 139Z';
const cutout = 'M129 117 C122 128 114 139 114 148 C114 157 120 163 129 163 C138 163 144 157 144 148 C144 139 136 128 129 117Z';
const hand = 'M45 166 C61 157 78 161 99 171 L121 181 C136 187 150 188 164 181 C169 179 174 182 172 187 C168 196 155 201 140 201 C125 201 113 197 103 194 C99 193 97 196 102 200 C123 214 151 215 174 204 C192 194 201 180 209 164 C212 158 219 161 217 167 C207 199 181 224 151 231 C115 240 80 227 53 204 L37 190 C28 182 33 172 45 166Z';

function svg({mono=false, light=false, compact=false, icon=false}={}) {
  const ink = light ? color.night : color.paper;
  const width = compact ? 8 : 5.5;
  const contents = `<g fill="none" stroke="${ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"><path d="${canopy}"/></g>
  ${mono ? `<path d="${flame} ${cutout}" fill="${ink}" fill-rule="evenodd"/>` : `<path d="${flame}" fill="${color.amber}"/><path d="${middle}" fill="${color.ember}"/><path d="${core}" fill="${color.gold}"/>`}
  <path d="${hand}" fill="none" stroke="${ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${icon?1024:256}" height="${icon?1024:256}" viewBox="0 0 256 256" fill="none">
  <title>Memoria — 灯りを守る家</title>
  ${icon?`<rect width="256" height="256" fill="${color.night}"/><g transform="translate(14.08 16) scale(.89)">`:''}
  ${contents}
  ${icon?'</g>':''}
</svg>\n`;
}
const assets = {
  'memoria-shelter.svg':svg(),
  'memoria-shelter-on-light.svg':svg({light:true}),
  'memoria-shelter-mono.svg':svg({mono:true,light:true}),
  'memoria-shelter-reversed.svg':svg({mono:true}),
  'memoria-shelter-small.svg':svg({compact:true}),
  'memoria-shelter-small-mono.svg':svg({compact:true,mono:true,light:true}),
  'memoria-shelter-small-reversed.svg':svg({compact:true,mono:true}),
  'memoria-shelter-app-icon.svg':svg({icon:true})
};
for (const [name,source] of Object.entries(assets)) await fs.writeFile(path.join(here,name),source);
for (const size of [32,48,64,128,256,512,1024]) await sharp(Buffer.from(svg({icon:true,compact:size<=64}))).resize(size,size).png().toFile(path.join(here,`memoria-shelter-icon-${size}.png`));
await sharp(Buffer.from(assets['memoria-shelter.svg'])).resize(1024,1024).png().toFile(path.join(here,'memoria-shelter-transparent-1024.png'));

const original = await fs.readFile(path.join(here,'reference-original.svg'));
const oldB = await fs.readFile(path.join(here,'reference-previous-b.svg'));
const cols = [
  {x:0,label:'ORIGINAL',note:'Shelter, flame and hand',source:original},
  {x:400,label:'PREVIOUS B',note:'Heavy frame / crowded interior',source:oldB},
  {x:800,label:'C / SHELTER',note:'Restored space and proportion',source:Buffer.from(assets['memoria-shelter.svg'])}
];
const background = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="670"><rect width="1200" height="670" fill="${color.night}"/><g font-family="Segoe UI,sans-serif">${cols.map(({x,label,note})=>`<text x="${x+36}" y="42" font-size="15" letter-spacing="2" fill="${color.paper}">${label}</text><text x="${x+36}" y="70" font-size="12" fill="#abb4c0">${note}</text><text x="${x+45}" y="459" font-size="12" fill="#abb4c0">64 px</text><text x="${x+140}" y="459" font-size="12" fill="#abb4c0">48 px</text><text x="${x+235}" y="459" font-size="12" fill="#abb4c0">32 px</text>`).join('')}</g><g stroke="#fff8e820"><path d="M400 25V645M800 25V645"/></g><g font-family="Segoe UI,sans-serif" font-size="12" fill="#abb4c0"><text x="836" y="523">ONE COLOR / LIGHT + DARK</text></g><rect x="980" y="550" width="168" height="76" rx="2" fill="${color.paper}"/></svg>`;
const items=[];
for (const {x,source} of cols) {
  const large=await sharp(source).resize({width:260,height:260,fit:'inside'}).png().toBuffer({resolveWithObject:true});
  items.push({input:large.data,left:x+Math.round((400-large.info.width)/2),top:108});
  for (const [size,offset] of [[64,43],[48,139],[32,235]]) {
    const input=x===800?Buffer.from(assets['memoria-shelter-small.svg']):source;
    items.push({input:await sharp(input).resize(size,size,{fit:'contain',background:'#00000000'}).png().toBuffer(),left:x+offset,top:431-size});
  }
}
for(const [name,x] of [['memoria-shelter-small-reversed.svg',839],['memoria-shelter-small-mono.svg',992]]) {
  items.push({input:await sharp(Buffer.from(assets[name])).resize(64,64).png().toBuffer(),left:x,top:556});
  items.push({input:await sharp(Buffer.from(assets[name])).resize(32,32).png().toBuffer(),left:x+91,top:586});
}
await sharp(Buffer.from(background)).composite(items).png().toFile(path.join(here,'comparison-shelter.png'));
console.log(`Exported shelter revision to ${here}`);
