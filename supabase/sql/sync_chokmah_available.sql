-- Chokmah sync — current canonical boundary only.
-- Source Lock V1 confirms that this commit contains Days 037–039 as written canon.
select *
from hnk_private.sync_codex_range(
  37,
  39,
  '4a5a88cc014308d3d2e27b581dd26be70b9d7cf4'
);
