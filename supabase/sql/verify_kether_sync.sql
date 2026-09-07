with expected as (
  select generate_series(1, 36)::smallint as day
), missing as (
  select e.day
  from expected e
  left join public.codex_days c using(day)
  where c.day is null
)
select
  (select count(*) from public.codex_days where day between 1 and 36) as rows_1_36,
  (select count(distinct day) from public.codex_days where day between 1 and 36) as distinct_days,
  (select min(day) from public.codex_days where day between 1 and 36) as min_day,
  (select max(day) from public.codex_days where day between 1 and 36) as max_day,
  (select count(*) from missing) as missing_days,
  (select count(*) from public.codex_days where day between 1 and 36 and status <> 'canon') as non_canon,
  (select count(*) from public.codex_days where day between 1 and 36 and (source_sha is null or length(source_sha) <> 40)) as bad_sha,
  (select count(*) from public.codex_days where day between 1 and 36 and coalesce(content->>'raw_markdown','') = '') as missing_markdown,
  (select count(*) from public.codex_days where day between 1 and 36 and chapter <> 1) as wrong_chapter,
  (select count(*) from public.codex_days where day between 1 and 36 and sephira <> 'Kether') as wrong_sephira;
