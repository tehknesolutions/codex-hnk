import {NextResponse} from 'next/server';
import semantic from '../../../../../data/library/knowledge-graph.semantic-links.v2.json';
export function GET(){return NextResponse.json({schema_version:'HNK-LAB-CONVERGENCE-V1',authority:'READ_ONLY_PROJECTION',edges:semantic.edges,summary:{reviewed_edges:semantic.edges.length},rules:['SEMANTIC_CONNECTIVITY_NOT_TRUTH','NO_INFERRED_MISSING_LINKS','ZERO_MEANS_NO_MATERIALIZED_LINK_NOT_NO_RELATION']})}
