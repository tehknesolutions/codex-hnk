from pathlib import Path
import json, hashlib, sys

SEPHIRAH_ALIASES={
  "Chokmah":("Chokhmah","chokhmah"),
  "Chokhmah":("Chokhmah","chokhmah"),
  "Binah":("Binah","binah"),
}

def dump(path,obj):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def source_sha(source):
    text=json.dumps(source,ensure_ascii=False,indent=2)+"\n"
    return hashlib.sha256(text.encode()).hexdigest(),text

def normalized_sephirah(raw):
    if raw not in SEPHIRAH_ALIASES:
        raise ValueError(f"unsupported sephirah:{raw}")
    return SEPHIRAH_ALIASES[raw]

def qid(d,display): return f"HNK-{display.upper()}-D{d:03d}-RC2"
def cid(d,display): return f"HNK-{display.upper()}-D{d:03d}-COMP-RC2"

def generic_phases(x,quest_id,completion_id,display):
    d=x["day"]; portal=x["kind"]=="PORTAL_DAY"
    angel=x.get("cycle",{}).get("angel")
    reveal=[display,x["world"]]
    if angel: reveal.append(angel)
    if x.get("oracles"):
        reveal += [x["oracles"].get("tarot"),x["oracles"].get("rune"),x["oracles"].get("iching")]
    reveal=[v for v in reveal if v]
    phases=[
      {"id":"threshold","type":"NARRATIVE","source":{"kind":"PLATFORM_MICROCOPY"},"presentation":{"motion":"BREATHING","density":"MINIMAL"},"required_for_completion":False},
      {"id":"orientation","type":"INSTRUCTION","source":{"kind":"PLATFORM_MICROCOPY"},"content_intent":["Observe before interpreting.","No extraordinary phenomenon is required.","The user may pause or stop at any time.","Reconstructed provenance remains visible."],"required_for_completion":False},
      {"id":"sephirah_reveal","type":"TERM_REVEAL","source":{"kind":"PLATFORM_MICROCOPY"},"terms":reveal,"required_for_completion":False},
    ]
    if portal:
        phases.append({"id":"portal_notice","type":"NARRATIVE","source":{"kind":"PLATFORM_EXPERIENCE"},"content_intent":["This is a reconstructed portal experience.","Portal symbolism is not an empirical claim of metaphysical transit."],"required_for_completion":False})
    for pid in ["jachin","boaz","equilibrium"]:
        phases += [
          {"id":f"{pid}_reading","type":"READ","source":{"kind":"CANON","block_ids":[f"{pid}-doctrine",f"{pid}-kavanah",f"{pid}-ordalia"]},"epistemic_overlays":[{"domain":"E3","scope":"subjective experience"},{"domain":"E4","scope":"HNK symbolic/traditional framing"}],"required_for_completion":True},
          {"id":f"{pid}_practice","type":"FOCUS","source":{"kind":"CANON","block_ids":[f"{pid}-kavanah"]},"interaction":{"duration_seconds":None,"components":["SOURCE_GUIDED_PRACTICE","ATTENTION_RETURN"],"pause":True,"stop":True},"safety":{"return_gate":True,"stop_always_visible":True},"required_for_completion":True},
        ]
        if pid in ("boaz","equilibrium"):
            phases.append({"id":f"{pid}_journal","type":"STRUCTURED_JOURNAL","source":{"kind":"CANON","block_ids":[f"{pid}-ordalia"]},"privacy":{"structured_metrics_destination":"PRACTICE_EVIDENCE","free_text_destination":"VAULT_ONLY"},"required_for_completion":True})
        phases.append({"id":f"{pid}_return","type":"RETURN","source":{"kind":"GUIDE_SAFETY"},"interaction":{"orientation_confirmation_required":True},"required_for_completion":True})
    phases.append({"id":"completion","type":"COMPLETION","source":{"kind":"SYSTEM"},"completion_contract_id":completion_id,"canonical_xp":x.get("xp_reward",0),"required_for_completion":True})
    if d<109:
        phases.append({"id":"next_day","type":"UNLOCK","source":{"kind":"SYSTEM"},"unlock":{"event":"NEXT_DAY_UNLOCKED","day":d+1},"required_for_completion":False})
    return phases

def generate(pack_path,out_root):
    pack=json.loads(Path(pack_path).read_text(encoding="utf-8"))
    registry=[];manifest=[]
    for x in pack["days"]:
        d=x["day"]; display,slug=normalized_sephirah(x["sephira"])
        qi=qid(d,display); ci=cid(d,display)
        sha,text=source_sha(x)
        daydir=Path(out_root)/"docs/experience"/slug/f"day-{d:03d}"
        daydir.mkdir(parents=True,exist_ok=True)
        src_rel=f"docs/experience/{slug}/day-{d:03d}/day-{d:03d}.source.v2.json"
        (daydir/f"day-{d:03d}.source.v2.json").write_text(text,encoding="utf-8")
        quest={
          "id":qi,"kind":"hnk.quest_definition","version":"2.0.0-rc.generated",
          "status":"GENERATED_ADAPTER_BASELINE__BACKEND_COMPLETION_BLOCKED",
          "day":d,"title":x["title"],
          "canonical":{"repository":"tehknesolutions/codex-hnk","path":src_rel,"source_sha":sha,"source_hash_algorithm":"sha256",
                       "editorial_version":"reconstructed-v2","classification":"RECONSTRUCTED_FROM_RECOVERED_SOURCES",
                       "original_rc1_equivalence_claim":False,"sephira":display,"world":x["world"],
                       "angel":x.get("cycle",{}).get("angel"),"initiatory_grade":2 if display=="Chokhmah" else 3,
                       "initiatory_title":"Iniciado" if display=="Chokhmah" else "Teurgo","xp":x.get("xp_reward",0),
                       "tracks":[f"{display.upper()}-CORE","SOURCE-GUIDED-PRACTICE","PROVENANCE-AWARE"]},
          "epistemic_protocol":{"id":"HNK-EP-1.1","ui_annotation_enabled":True,"source_editorial_qa":"GLOBAL_QA_V2_PASS"},
          "runtime":{"entry_state":"AVAILABLE","completion_state":"COMPLETE","resumable":True,"offline_first":True,
                     "interrupt_states":["PAUSED","INTERRUPTED","SAFETY_STOP","RESUMABLE"]},
          "phases":generic_phases(x,qi,ci,display),
          "assets":{"required":[],"production_policy":"APPROVED_OR_PUBLISHED_ONLY","pilot_policy":"NO_ASSET_INVENTION"},
          "release_blockers":[
            {"id":"BACKEND-GENERIC-PROGRESSION","scope":"completion response","resolution":"CompleteDayResponseV2 server implementation required."},
            {"id":"BACKEND-CONTRACT-REGISTRY","scope":"complete_codex_day_v2","resolution":"Register generated completion/evidence contract server-side."}
          ],
          "schema_contract":"HNK_QUEST_DEFINITION_V1"
        }
        renderer={
          "id":f"HNK-{display.upper()}-D{d:03d}-RENDERER-RC1","quest_definition_id":qi,
          "renderer_contract":"HNK_RENDERER_LAYER_V1","default_surface":"mobile-first",
          "phase_renderers":{"NARRATIVE":"NarrativeScene","INSTRUCTION":"InstructionScene","TERM_REVEAL":"TermRevealScene","READ":"CanonReadingScene","FOCUS":"FocusPracticeScene","RETURN":"ReturnGateScene","STRUCTURED_JOURNAL":"SoulMirrorScene","COMPLETION":"CompletionBoundaryScene","UNLOCK":"UnlockScene"},
          "policies":{"completion":{"client_may_award_xp":False,"client_may_mark_complete_directly":False,"requires_server_confirmation":True},
                      "accessibility":{"reduced_motion_required":True,"stop_control_required_for_practice":True},
                      "privacy":{"free_text_default":"VAULT_ONLY","analytics_free_text":False}}
        }
        evidence={
          "$schema":"https://json-schema.org/draft/2020-12/schema","$id":f"https://hnk.local/schemas/day-{d:03d}.evidence.schema.json",
          "title":f"HNK Day {d:03d} Evidence RC2","type":"object","additionalProperties":False,
          "required":["protocol_version","source_sha","session_id","jachin","boaz","equilibrium","voluntary_completion_confirmed"],
          "properties":{"protocol_version":{"const":qi},"source_sha":{"const":sha},"session_id":{"type":"string","minLength":1},"mode":{"enum":["first_completion","revisit"]},
             "jachin":{"type":"object","additionalProperties":False,"required":["completed","return_confirmed"],"properties":{"completed":{"const":True},"vault_entry_ref":{"type":["string","null"]},"return_confirmed":{"const":True}}},
             "boaz":{"type":"object","additionalProperties":False,"required":["completed","return_confirmed"],"properties":{"completed":{"const":True},"vault_entry_ref":{"type":["string","null"]},"return_confirmed":{"const":True}}},
             "equilibrium":{"type":"object","additionalProperties":False,"required":["completed","return_confirmed"],"properties":{"completed":{"const":True},"vault_entry_ref":{"type":["string","null"]},"return_confirmed":{"const":True}}},
             "voluntary_completion_confirmed":{"const":True},"safety_stop_occurred":{"type":"boolean"}}
        }
        completion={
          "$schema":"https://json-schema.org/draft/2020-12/schema","$id":f"https://hnk.local/schemas/day-{d:03d}.completion.schema.json",
          "title":f"HNK Day {d:03d} Completion Contract RC2","type":"object","additionalProperties":False,
          "required":["completion_contract_id","quest_definition_id","day","session_id","evidence","voluntary_completion_confirmed"],
          "properties":{"completion_contract_id":{"const":ci},"quest_definition_id":{"const":qi},"day":{"const":d},
                        "session_id":{"type":"string","minLength":1},"evidence":{"$ref":f"day-{d:03d}.evidence.schema.json"},
                        "voluntary_completion_confirmed":{"const":True},"client_completion_id":{"type":["string","null"]},
                        "client_completed_at":{"type":["string","null"],"format":"date-time"}}
        }
        service={
          "id":f"HNK-{display.upper()}-D{d:03d}-COMPLETION-SERVICE-RC1","quest_definition_id":qi,
          "completion_contract_id":ci,"canonical_source_sha":sha,"canonical_source_hash_algorithm":"sha256",
          "transport":{"kind":"supabase_rpc","rpc":"complete_codex_day_v2","server_authoritative":True},
          "request":{"required":["day","session_id","completion_contract_id","quest_definition_id","canonical_source_sha","client_completion_id"],
                     "optional":["local_record_hash","client_completed_at"],"forbidden_authority_fields":["xp_awarded","xp_total","initiatory_grade","progression_events","sephirah_state"]},
          "rules":{"canonical_xp":x.get("xp_reward",0),"replay_expected_xp":0,"next_day":d+1 if d<109 else None},
          "runtime_status":"SPEC_READY__BACKEND_COMPLETION_BLOCKED"
        }
        dump(daydir/f"day-{d:03d}.quest.json",quest)
        dump(daydir/f"day-{d:03d}.renderer-profile.json",renderer)
        dump(daydir/f"day-{d:03d}.evidence.schema.json",evidence)
        dump(daydir/f"day-{d:03d}.completion.schema.json",completion)
        dump(daydir/f"day-{d:03d}.completion.service.json",service)
        registry.append({"day":d,"sephira":display,"slug":slug,"questDefinitionId":qi,"completionContractId":ci,"canonicalSourceSha":sha,"canonicalXp":x.get("xp_reward",0)})
        manifest.append({"day":d,"sephira":display,"slug":slug,"source_sha256":sha,"path":str(daydir.relative_to(out_root)).replace("\\","/")})
    dump(Path(out_root)/"adapter-registry.json",registry)
    dump(Path(out_root)/"adapter-manifest.json",manifest)
    print(f"GENERATED={len(registry)}")

if __name__=="__main__":
    if len(sys.argv)!=3: raise SystemExit("usage: generator PACK OUT")
    generate(sys.argv[1],sys.argv[2])
