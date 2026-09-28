const UNIQUE=new Set(['DIRECT','DERIVED_UNIQUE']);
const NONE=new Set(['NO_E5_PROJECTION','PENDING_RULE']);

export function exportAcquisitionDataset(hybridArtifact){
  if(!hybridArtifact || !Array.isArray(hybridArtifact.records)) throw new Error('Invalid hybrid artifact');
  const records=hybridArtifact.records.map(record=>{
    const glyphId=record.legacyIdentity.glyphId;
    const candidateProjectionIds=record.projectionSet.map(p=>p.projectionId);
    const base={
      glyphId,
      resolutionStatus:record.resolutionStatus,
      derivationRule:hybridArtifact.derivationRule,
      sourceRef:record.legacyIdentity.sourceRef,
      candidateProjectionIds
    };
    if(UNIQUE.has(record.resolutionStatus)){
      if(candidateProjectionIds.length!==1) throw new Error(`${glyphId}: unique state requires one projection`);
      return {...base,targetProjectionId:candidateProjectionIds[0],acquisitionMode:'STRUCTURAL_TARGET'};
    }
    if(record.resolutionStatus==='DERIVED_AMBIGUOUS'){
      if(candidateProjectionIds.length<2) throw new Error(`${glyphId}: ambiguous state requires multiple projections`);
      return {...base,targetProjectionId:null,acquisitionMode:'CANDIDATE_SET'};
    }
    if(NONE.has(record.resolutionStatus)){
      if(candidateProjectionIds.length) throw new Error(`${glyphId}: no-target state cannot carry projections`);
      return {...base,targetProjectionId:null,acquisitionMode:'NO_TARGET'};
    }
    throw new Error(`${glyphId}: unsupported resolution status ${record.resolutionStatus}`);
  });
  return {
    schemaVersion:'1.0.0',
    source:{schemaVersion:hybridArtifact.schemaVersion,derivationRule:hybridArtifact.derivationRule},
    records
  };
}
