import fs from 'node:fs';
const src='docs/research/chromatic-genesis/evidence/zarenu-semantic-shortlist.v0.1.json';
const out='docs/research/chromatic-genesis/evidence/zarenu-human-gate.exact.svg';
const data=JSON.parse(fs.readFileSync(src,'utf8'));
const W=1800,H=760,cx=[330,900,1470],cy=390,R=[70,105,140,175,210,245];
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const parse=a=>{const m=a.match(/L(\d+):S(\d+)/);return [+m[1],+m[2]]};
const pt=(a,k)=>{const [l,s]=parse(a),ang=((s-1)/72)*Math.PI*2-Math.PI/2,r=R[l-1];return [cx[k]+r*Math.cos(ang),cy+r*Math.sin(ang)]};
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#050709"/><style>text{font-family:Arial,sans-serif;fill:#e8edf2}.muted{fill:#87919b}.title{font-size:32px;letter-spacing:8px}.small{font-size:14px}.rank{font-size:22px}.grid{stroke:#27313a;fill:none}.path{stroke:#f2f4f6;stroke-width:4;fill:none}.node{fill:#050709;stroke:#fff;stroke-width:3}</style><text x="900" y="55" text-anchor="middle" class="title">ZARENU · EXACT MF HUMAN GATE</text><text x="900" y="85" text-anchor="middle" class="muted">HNK40 exact collision: 0 · 432 eligible · score 0.9653846154 · HNK:CANDIDATE</text>`;
for(let k=0;k<3;k++){
 const c=data.top3[k]; svg+=`<text x="${cx[k]}" y="125" text-anchor="middle" class="rank">CANDIDATO ${k+1}</text>`;
 for(let l=1;l<=6;l++) svg+=`<circle cx="${cx[k]}" cy="${cy}" r="${R[l-1]}" class="grid"/>`;
 for(let s=1;s<=72;s+=6){const a=((s-1)/72)*Math.PI*2-Math.PI/2;svg+=`<line x1="${cx[k]+R[0]*Math.cos(a)}" y1="${cy+R[0]*Math.sin(a)}" x2="${cx[k]+R[5]*Math.cos(a)}" y2="${cy+R[5]*Math.sin(a)}" class="grid"/>`}
 const points=c.path.addresses.map(a=>pt(a,k)); svg+=`<polyline points="${points.map(p=>p.join(',')).join(' ')}" class="path"/>`;
 points.forEach((p,i)=>{svg+=`<circle cx="${p[0]}" cy="${p[1]}" r="9" class="node"/><text x="${p[0]+12}" y="${p[1]-10}" class="small">${esc(c.path.addresses[i].replace('MF:',''))}</text>`});
 svg+=`<text x="${cx[k]}" y="680" text-anchor="middle" class="small">${esc(c.path.addresses.map(a=>a.replace('MF:','')).join(' → '))}</text><text x="${cx[k]}" y="710" text-anchor="middle" class="muted small">P 1 · M 0.46154 · R 1 · O 1 · U 1 · C 1</text>`;
}
svg+=`<text x="900" y="745" text-anchor="middle" class="muted small">Geometria derivada diretamente de Layer (L) + Sector (S). Sem ornamentação generativa. Human Gate TW-DVF.</text></svg>`;
fs.writeFileSync(out,svg);console.log(out);
