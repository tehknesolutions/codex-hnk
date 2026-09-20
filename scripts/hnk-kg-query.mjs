#!/usr/bin/env node
import {findNodes,neighbors,traverse,provenanceFor,stats} from "./hnk-kg-engine.mjs";
const [cmd,arg,...rest]=process.argv.slice(2);
const json=x=>console.log(JSON.stringify(x,null,2));
if(cmd==="stats") json(stats());
else if(cmd==="find") json(findNodes(arg||""));
else if(cmd==="neighbors") json(neighbors(arg,{status:rest[0]}));
else if(cmd==="traverse") json(traverse(arg,{depth:Number(rest[0]||2),status:rest[1]}));
else if(cmd==="provenance") json(provenanceFor(arg));
else {
 console.error("Usage: hnk-kg-query <stats|find|neighbors|traverse|provenance> [arg] [options]");
 process.exit(1);
}
