from pathlib import Path
import json, hashlib, sys

ALIASES={"Chokmah":("Chokhmah","chokhmah"),"Chokhmah":("Chokhmah","chokhmah"),"Binah":("Binah","binah")}
BLOCKS=[("jachin","doctrine",137),("jachin","kavanah",72),("jachin","ordalia",26),
        ("boaz","doctrine",137),("boaz","kavanah",72),("boaz","ordalia",26),
        ("equilibrium","doctrine",137),("equilibrium","kavanah",72),("equilibrium","ordalia",26)]

def norm(s): return s.replace("\r\n","\n").replace("\r","\n").strip()
def wc(s): return len(norm(s).split())
def sha256(s): return hashlib.sha256(norm(s).encode()).hexdigest()
def git_blob(data): return hashlib.sha1(f"blob {len(data)}\0".encode()+data).hexdigest()
def dump(p,o):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def generate(pack_path,out):
    pack=json.loads(Path(pack_path).read_text(encoding="utf-8"))
    registry=[]
    for x in pack["days"]:
        d=x["day"]; display,slug=ALIASES[x["sephira"]]
        dd=Path(out)/"docs/experience"/slug/f"day-{d:03d}"; dd.mkdir(parents=True,exist_ok=True)
        src=dd/f"day-{d:03d}.source.v3.json"
        source_text=json.dumps(x,ensure_ascii=False,indent=2)+"\n"; src.write_text(source_text,encoding="utf-8")
        blob=git_blob(src.read_bytes()); source_sha256=hashlib.sha256(src.read_bytes()).hexdigest()
        qi=f"HNK-{display.upper()}-D{d:03d}-RC3"; ci=f"HNK-{display.upper()}-D{d:03d}-COMP-RC3"

        by={p["id"].lower():p for p in x["pillars"]}; blocks=[]; ids=[]
        for pid,key,target in BLOCKS:
            skey="ordeal" if key=="ordalia" else key
            text=by[pid][skey]["text"]; bid=f"{pid}-{key}"; n=wc(text)
            if n!=target: raise ValueError(f"{d}:{bid}:{n}!={target}")
            blocks.append({"id":bid,"kind":"COUNTED","target_words":target,"word_count":n,"sha256":sha256(text),"text":norm(text)})
            ids.append(bid)
        manifest={"id":f"HNK-{display.upper()}-D{d:03d}-CANON-BLOCKS-V1","kind":"hnk.canon_block_manifest","version":"1.0.0",
          "source":{"repository":"tehknesolutions/codex-hnk","path":f"docs/experience/{slug}/day-{d:03d}/day-{d:03d}.source.v3.json","blob_sha":blob,"editorial_version":"reconstructed-v3","day":d,"target_words":705},
          "normalization":{"line_endings":"LF","trim_outer_whitespace":True,"preserve_internal_whitespace":True,"word_count":"split_on_unicode_whitespace"},
          "counted_core":{"block_ids":ids,"word_count":sum(b["word_count"] for b in blocks)},"blocks":blocks}
        dump(dd/f"day-{d:03d}.canon-blocks.json",manifest)

        phases=[
          {"id":"threshold","type":"NARRATIVE","source":{"kind":"PLATFORM_MICROCOPY"},"required_for_completion":False},
          {"id":"orientation","type":"INSTRUCTION","source":{"kind":"PLATFORM_MICROCOPY"},"content_intent":["Observe before interpreting.","No extraordinary phenomenon is required.","The user may pause or stop at any time.","Reconstructed provenance remains visible."],"required_for_completion":False},
          {"id":"sephirah_reveal","type":"TERM_REVEAL","source":{"kind":"PLATFORM_MICROCOPY"},"terms":[display,x["world"]],"required_for_completion":False}]
        if x["kind"]=="PORTAL_DAY":
            phases.append({"id":"portal_notice","type":"NARRATIVE","source":{"kind":"PLATFORM_EXPERIENCE"},"content_intent":["Reconstructed portal experience.","Portal symbolism is not an empirical claim of metaphysical transit."],"required_for_completion":False})
        for pid in ["jachin","boaz","equilibrium"]:
            phases += [
              {"id":f"{pid}_reading","type":"READ","source":{"kind":"CANON","block_ids":[f"{pid}-doctrine",f"{pid}-kavanah",f"{pid}-ordalia"]},"required_for_completion":True},
              {"id":f"{pid}_practice","type":"FOCUS","source":{"kind":"CANON","block_ids":[f"{pid}-kavanah"]},"interaction":{"duration_seconds":None,"components":["SOURCE_GUIDED_PRACTICE","ATTENTION_RETURN"],"pause":True,"stop":True},"safety":{"return_gate":True,"stop_always_visible":True},"required_for_completion":True}]
            if pid in ("boaz","equilibrium"):
                phases.append({"id":f"{pid}_journal","type":"STRUCTURED_JOURNAL","source":{"kind":"CANON","block_ids":[f"{pid}-ordalia"]},"privacy":{"structured_metrics_destination":"PRACTICE_EVIDENCE","free_text_destination":"VAULT_ONLY"},"required_for_completion":True})
            phases.append({"id":f"{pid}_return","type":"RETURN","source":{"kind":"GUIDE_SAFETY"},"interaction":{"orientation_confirmation_required":True},"required_for_completion":True})
        phases.append({"id":"completion","type":"COMPLETION","source":{"kind":"SYSTEM"},"completion_contract_id":ci,"canonical_xp":x.get("xp_reward",0),"required_for_completion":True})
        if d<109: phases.append({"id":"next_day","type":"UNLOCK","source":{"kind":"SYSTEM"},"unlock":{"event":"NEXT_DAY_UNLOCKED","day":d+1},"required_for_completion":False})

        quest={"id":qi,"kind":"hnk.quest_definition","version":"3.0.0-rc.generated","status":"GENERATED_ADAPTER_BASELINE__CANON_RESOLVER_READY__BACKEND_COMPLETION_BLOCKED",
          "day":d,"title":x["title"],"canonical":{"repository":"tehknesolutions/codex-hnk","path":manifest["source"]["path"],"source_sha":blob,"source_sha256":source_sha256,
          "editorial_version":"reconstructed-v3","classification":"RECONSTRUCTED_FROM_RECOVERED_SOURCES","original_rc1_equivalence_claim":False,"sephira":display,"world":x["world"],
          "angel":x.get("cycle",{}).get("angel"),"initiatory_grade":2 if display=="Chokhmah" else 3,"initiatory_title":"Iniciado" if display=="Chokhmah" else "Teurgo","xp":x.get("xp_reward",0),
          "tracks":[f"{display.upper()}-CORE","SOURCE-GUIDED-PRACTICE","PROVENANCE-AWARE"]},"epistemic_protocol":{"id":"HNK-EP-1.1","ui_annotation_enabled":True,"source_editorial_qa":"GLOBAL_QA_V3_CANON_RESOLVER_COMPAT_PASS"},
          "runtime":{"entry_state":"AVAILABLE","completion_state":"COMPLETE","resumable":True,"offline_first":True,"interrupt_states":["PAUSED","INTERRUPTED","SAFETY_STOP","RESUMABLE"]},
          "phases":phases,"assets":{"required":[],"production_policy":"APPROVED_OR_PUBLISHED_ONLY","pilot_policy":"NO_ASSET_INVENTION"},
          "release_blockers":[{"id":"BACKEND-GENERIC-PROGRESSION","scope":"completion response","resolution":"CompleteDayResponseV2 server implementation required."},{"id":"BACKEND-CONTRACT-REGISTRY","scope":"complete_codex_day_v2","resolution":"Register generated completion/evidence contract server-side."}],"schema_contract":"HNK_QUEST_DEFINITION_V1"}
        renderer={"id":f"HNK-{display.upper()}-D{d:03d}-RENDERER-RC2","quest_definition_id":qi,"renderer_contract":"HNK_RENDERER_LAYER_V1","default_surface":"mobile-first",
          "phase_renderers":{"NARRATIVE":"NarrativeScene","INSTRUCTION":"InstructionScene","TERM_REVEAL":"TermRevealScene","READ":"CanonReadingScene","FOCUS":"FocusPracticeScene","RETURN":"ReturnGateScene","STRUCTURED_JOURNAL":"SoulMirrorScene","COMPLETION":"CompletionBoundaryScene","UNLOCK":"UnlockScene"},
          "policies":{"completion":{"client_may_award_xp":False,"client_may_mark_complete_directly":False,"requires_server_confirmation":True},"canon":{"resolver_required":True,"manifest":f"day-{d:03d}.canon-blocks.json"},"accessibility":{"reduced_motion_required":True,"stop_control_required_for_practice":True},"privacy":{"free_text_default":"VAULT_ONLY","analytics_free_text":False}}}
        evidence={"$schema":"https://json-schema.org/draft/2020-12/schema","$id":f"https://hnk.local/schemas/day-{d:03d}.evidence.schema.json","title":f"HNK Day {d:03d} Evidence RC3","type":"object","additionalProperties":False,
          "required":["protocol_version","source_sha","session_id","jachin","boaz","equilibrium","voluntary_completion_confirmed"],"properties":{"protocol_version":{"const":qi},"source_sha":{"const":blob},"session_id":{"type":"string","minLength":1},"mode":{"enum":["first_completion","revisit"]},
          "jachin":{"type":"object","additionalProperties":False,"required":["completed","return_confirmed"],"properties":{"completed":{"const":True},"return_confirmed":{"const":True},"vault_entry_ref":{"type":["string","null"]}}},
          "boaz":{"type":"object","additionalProperties":False,"required":["completed","return_confirmed"],"properties":{"completed":{"const":True},"return_confirmed":{"const":True},"vault_entry_ref":{"type":["string","null"]}}},
          "equilibrium":{"type":"object","additionalProperties":False,"required":["completed","return_confirmed"],"properties":{"completed":{"const":True},"return_confirmed":{"const":True},"vault_entry_ref":{"type":["string","null"]}}},
          "voluntary_completion_confirmed":{"const":True},"safety_stop_occurred":{"type":"boolean"}}}
        completion={"$schema":"https://json-schema.org/draft/2020-12/schema","$id":f"https://hnk.local/schemas/day-{d:03d}.completion.schema.json","title":f"HNK Day {d:03d} Completion Contract RC3","type":"object","additionalProperties":False,
          "required":["completion_contract_id","quest_definition_id","day","session_id","evidence","voluntary_completion_confirmed"],"properties":{"completion_contract_id":{"const":ci},"quest_definition_id":{"const":qi},"day":{"const":d},"session_id":{"type":"string","minLength":1},"evidence":{"$ref":f"day-{d:03d}.evidence.schema.json"},"voluntary_completion_confirmed":{"const":True},"client_completion_id":{"type":["string","null"]},"client_completed_at":{"type":["string","null"],"format":"date-time"}}}
        service={"id":f"HNK-{display.upper()}-D{d:03d}-COMPLETION-SERVICE-RC2","quest_definition_id":qi,"completion_contract_id":ci,"canonical_source_sha":blob,"canonical_source_sha256":source_sha256,
          "transport":{"kind":"supabase_rpc","rpc":"complete_codex_day_v2","server_authoritative":True},"request":{"required":["day","session_id","completion_contract_id","quest_definition_id","canonical_source_sha","client_completion_id"],"optional":["local_record_hash","client_completed_at"],"forbidden_authority_fields":["xp_awarded","xp_total","initiatory_grade","progression_events","sephirah_state"]},
          "rules":{"canonical_xp":x.get("xp_reward",0),"replay_expected_xp":0,"next_day":d+1 if d<109 else None},"runtime_status":"SPEC_READY__BACKEND_COMPLETION_BLOCKED"}
        for name,obj in [(f"day-{d:03d}.quest.json",quest),(f"day-{d:03d}.renderer-profile.json",renderer),(f"day-{d:03d}.evidence.schema.json",evidence),(f"day-{d:03d}.completion.schema.json",completion),(f"day-{d:03d}.completion.service.json",service)]:
            dump(dd/name,obj)
        registry.append({"day":d,"sephira":display,"slug":slug,"questDefinitionId":qi,"completionContractId":ci,"canonicalSourceSha":blob,"canonicalSourceSha256":source_sha256,"canonicalXp":x.get("xp_reward",0)})
    dump(Path(out)/"adapter-registry.v2.json",registry)
    print(f"GENERATED={len(registry)}")

if __name__=="__main__":
    if len(sys.argv)!=3: raise SystemExit("usage: generator PACK OUT")
    generate(sys.argv[1],sys.argv[2])
