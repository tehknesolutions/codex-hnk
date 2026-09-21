import {NextResponse} from 'next/server';
import matrix from '../../../../../../packages/hnk-glyphs/reference/HNK40_REFERENCE_MATRIX_V1.json';
import recovery from '../../../../../../data/lab/hnk-glyph-registry.gap.v1.json';
export function GET(){return NextResponse.json({schema:'HNK-LAB-GLYPHS-V1',authority:'READ_ONLY_SOURCE_DERIVED_PROJECTION',matrix,recovery,rules:['NO_CANON_PROMOTION','NO_REFERENCE_EQUIVALENCE_INFERENCE','CANDIDATE_PUA_IS_TRANSPORT_ONLY','HNK40_IS_NOT_HENUVOKODAN']});}
