import {NextResponse} from 'next/server';
import {labDomains,labPillars,labLevels,semanticEdgeCount} from '../../knowledge';
export function GET(){return NextResponse.json({schema_version:'HNK-LAB-OVERVIEW-V1',authority:'READ_ONLY_PROJECTION',pillars:labPillars,levels:labLevels,domains:labDomains,summary:{pillars:labPillars.length,domains:labDomains.length,reviewed_semantic_edges:semanticEdgeCount},semantics:{unknown:'UNKNOWN_IS_NOT_ZERO',zero:'ZERO_MEANS_NO_MATERIALIZED_LINK_NOT_NO_RELATION'}})}
