'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
type Item={id:string;label:string;kind:'CONCEPT'|'DOMAIN'|'SOURCE'|'GLYPH';href:string;meta:string};
export default function CodexSearch({items}:{items:Item[]}){
 const [q,setQ]=useState('');const norm=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');const needle=norm(q.trim());
 const results=useMemo(()=>needle?items.filter(x=>norm(x.id+' '+x.label+' '+x.meta).includes(needle)).slice(0,24):[],[items,needle]);
 return <div className="codex-search"><label><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} aria-label="Buscar no Codex" placeholder="Buscar conceito, domínio, fonte ou glifo…"/></label>{needle&&<div className="codex-search-results" role="listbox">{results.length?results.map(x=><Link key={x.kind+':'+x.id} href={x.href}><b>{x.kind}</b><span>{x.label}</span><small>{x.id} · {x.meta}</small></Link>):<p>Nenhum registro materializado corresponde à busca.</p>}</div>}</div>
}
