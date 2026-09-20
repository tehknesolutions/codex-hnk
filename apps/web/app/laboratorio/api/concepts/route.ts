import {NextResponse} from 'next/server';
import {conceptRegistry} from '../../convergence';
export function GET(){return NextResponse.json({schema_version:'HNK-LAB-CONCEPT-REGISTRY-V1',authority:'READ_ONLY_DERIVED_PROJECTION',concepts:conceptRegistry,summary:{concepts:conceptRegistry.length},rules:['PROVENANCE_VISIBLE','UNKNOWN_IS_NOT_INFERRED','NO_CANON_PROMOTION']})}
