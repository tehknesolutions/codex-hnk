-- Performance hardening after Day 003 RealWorldAction activation.
create index if not exists real_world_action_contract_registry_day_idx
  on hnk_private.real_world_action_contract_registry(day);

create index if not exists real_world_actions_day_idx
  on hnk_private.real_world_actions(day);
