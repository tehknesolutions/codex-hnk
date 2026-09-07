-- Kether sync baseline.
-- Canon freeze projection verified 36/36 against this commit.
select *
from hnk_private.sync_codex_range(
  1,
  36,
  '968e8dc2050e7d2a076fc4e892e727e0772594a5'
);
