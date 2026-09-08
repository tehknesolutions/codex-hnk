-- Applied Supabase migration: 20260908214808_add_immutable_atziluth_source_sync
-- Immutable Atziluth sync with an explicit allowlist of canonical sources.
-- Historical canon remains in Tehkne-Solutions/hnk-codex-365; successor canon
-- is versioned in tehknesolutions/codex-hnk under content/canon/atziluth/.

create or replace function hnk_private.atziluth_source_path(
  p_day integer,
  p_source_kind text
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_source_kind = 'historical' then
    if p_day between 1 and 36 then
      return format('canon/capitulo-01-kether/dia-%s.md', lpad(p_day::text, 3, '0'));
    elsif p_day between 37 and 73 then
      return format('canon/capitulo-02-chokmah/dia-%s.md', lpad(p_day::text, 3, '0'));
    elsif p_day between 74 and 109 then
      return format('canon/capitulo-03-binah/dia-%s.md', lpad(p_day::text, 3, '0'));
    end if;
  elsif p_source_kind = 'successor' then
    if p_day between 1 and 36 then
      return format('content/canon/atziluth/kether/dia-%s.md', lpad(p_day::text, 3, '0'));
    elsif p_day between 37 and 73 then
      return format('content/canon/atziluth/chokmah/dia-%s.md', lpad(p_day::text, 3, '0'));
    elsif p_day between 74 and 109 then
      return format('content/canon/atziluth/binah/dia-%s.md', lpad(p_day::text, 3, '0'));
    end if;
  else
    raise exception 'invalid_source_kind';
  end if;

  raise exception 'atziluth_day_out_of_range';
end;
$$;

revoke all on function hnk_private.atziluth_source_path(integer, text)
from public, anon, authenticated;

create or replace function hnk_private.sync_atziluth_codex_range(
  p_start_day integer,
  p_end_day integer,
  p_source_commit_sha text,
  p_source_kind text
)
returns table(imported_day smallint, blob_sha text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  i integer;
  v_repo text;
  v_url text;
  v_source_path text;
  v_http_status integer;
  v_content text;
  v_frontmatter text;
  v_day smallint;
  v_chapter smallint;
  v_sephira text;
  v_world text;
  v_angel text;
  v_level smallint;
  v_xp integer;
  v_source_status text;
  v_editorial_version text;
  v_epistemic_protocol text;
  v_heading text;
  v_tracks text[];
  v_blob_sha text;
  v_import_id uuid := gen_random_uuid();
begin
  if p_start_day < 1 or p_end_day > 109 or p_start_day > p_end_day then
    raise exception 'Invalid Atziluth Codex day range: %..%', p_start_day, p_end_day;
  end if;

  if p_source_commit_sha is null or p_source_commit_sha !~ '^[0-9a-f]{40}$' then
    raise exception 'invalid_source_commit_sha';
  end if;

  if p_source_kind = 'historical' then
    v_repo := 'Tehkne-Solutions/hnk-codex-365';
  elsif p_source_kind = 'successor' then
    v_repo := 'tehknesolutions/codex-hnk';
  else
    raise exception 'invalid_source_kind';
  end if;

  insert into public.codex_import_runs(id, source_sha, days_imported, status)
  values (v_import_id, p_source_commit_sha, 0, 'started');

  for i in p_start_day..p_end_day loop
    v_source_path := hnk_private.atziluth_source_path(i, p_source_kind);
    v_url := 'https://raw.githubusercontent.com/' || v_repo || '/' || p_source_commit_sha || '/' || v_source_path;

    select h.status, h.content
      into v_http_status, v_content
      from extensions.http_get(v_url) h;

    if v_http_status <> 200 or v_content is null then
      raise exception 'Failed to fetch day % from % commit %: HTTP %', i, p_source_kind, p_source_commit_sha, v_http_status;
    end if;

    v_frontmatter := split_part(v_content, '---', 2);
    v_day := ((regexp_match(v_frontmatter, E'(?m)^day:[[:space:]]*([0-9]+)[[:space:]]*$'))[1])::smallint;
    v_chapter := ((regexp_match(v_frontmatter, E'(?m)^chapter:[[:space:]]*([0-9]+)[[:space:]]*$'))[1])::smallint;
    v_sephira := btrim((regexp_match(v_frontmatter, E'(?m)^sephira:[[:space:]]*(.+)[[:space:]]*$'))[1]);
    v_world := btrim((regexp_match(v_frontmatter, E'(?m)^world:[[:space:]]*(.+)[[:space:]]*$'))[1]);
    v_angel := btrim((regexp_match(v_frontmatter, E'(?m)^angel:[[:space:]]*(.+)[[:space:]]*$'))[1]);
    v_level := ((regexp_match(v_frontmatter, E'(?m)^level:[[:space:]]*([0-9]+)[[:space:]]*$'))[1])::smallint;
    v_xp := ((regexp_match(v_frontmatter, E'(?m)^xp:[[:space:]]*([0-9]+)[[:space:]]*$'))[1])::integer;
    v_source_status := coalesce(btrim((regexp_match(v_frontmatter, E'(?m)^status:[[:space:]]*(.+)[[:space:]]*$'))[1]), 'canon');
    v_editorial_version := coalesce(btrim((regexp_match(v_frontmatter, E'(?m)^editorial_version:[[:space:]]*"?([^"\\n]+)"?[[:space:]]*$'))[1]), 'not-declared');
    v_epistemic_protocol := coalesce(btrim((regexp_match(v_frontmatter, E'(?m)^epistemic_protocol:[[:space:]]*(.+)[[:space:]]*$'))[1]), 'not-declared');
    v_heading := btrim((regexp_match(v_content, E'(?m)^# ([^\\n]+)$'))[1]);
    v_tracks := array(
      select (m)[1]
      from regexp_matches(v_frontmatter, E'(?m)^  - ([A-Z0-9-]+)[[:space:]]*$', 'g') as m
    );

    if v_day is distinct from i then
      raise exception 'Canonical day mismatch: requested %, frontmatter says %', i, v_day;
    end if;

    if v_chapter is null or v_sephira is null or v_world is null or v_level is null or v_xp is null or v_heading is null then
      raise exception 'Missing required canonical metadata on day %', i;
    end if;

    if v_world <> 'Atziluth' then
      raise exception 'Atziluth world mismatch on day %: %', i, v_world;
    end if;

    if (i between 1 and 36 and (v_chapter <> 1 or v_sephira <> 'Kether'))
       or (i between 37 and 73 and (v_chapter <> 2 or v_sephira <> 'Chokmah'))
       or (i between 74 and 109 and (v_chapter <> 3 or v_sephira <> 'Binah')) then
      raise exception 'Atziluth chapter/sephira mismatch on day %: chapter %, sephira %', i, v_chapter, v_sephira;
    end if;

    if v_source_status <> 'canon' then
      raise exception 'Source day % is not canon: status %', i, v_source_status;
    end if;

    v_blob_sha := encode(
      extensions.digest(
        pg_catalog.convert_to('blob ' || pg_catalog.octet_length(v_content)::text, 'UTF8')
        || pg_catalog.decode('00', 'hex')
        || pg_catalog.convert_to(v_content, 'UTF8'),
        'sha1'
      ),
      'hex'
    );

    insert into public.codex_days(
      day, chapter, sephira, world, angel, level, xp, title, slug,
      editorial_version, epistemic_protocol, source_path, source_sha,
      status, tracks, content, synced_at
    ) values (
      v_day, v_chapter, v_sephira, v_world, v_angel, v_level, v_xp, v_heading,
      format('dia-%s', lpad(v_day::text, 3, '0')),
      v_editorial_version, v_epistemic_protocol, v_source_path, v_blob_sha,
      v_source_status, coalesce(v_tracks, '{}'::text[]),
      jsonb_build_object(
        'raw_markdown', v_content,
        'frontmatter', v_frontmatter,
        'heading', v_heading,
        'source_url', v_url,
        'source_repository', v_repo,
        'source_kind', p_source_kind,
        'source_commit_sha', p_source_commit_sha
      ),
      now()
    )
    on conflict (day) do update set
      chapter = excluded.chapter,
      sephira = excluded.sephira,
      world = excluded.world,
      angel = excluded.angel,
      level = excluded.level,
      xp = excluded.xp,
      title = excluded.title,
      slug = excluded.slug,
      editorial_version = excluded.editorial_version,
      epistemic_protocol = excluded.epistemic_protocol,
      source_path = excluded.source_path,
      source_sha = excluded.source_sha,
      status = excluded.status,
      tracks = excluded.tracks,
      content = excluded.content,
      synced_at = excluded.synced_at;

    update public.codex_import_runs
      set days_imported = days_imported + 1
      where id = v_import_id;

    imported_day := v_day;
    blob_sha := v_blob_sha;
    return next;
  end loop;

  update public.codex_import_runs
    set status = 'success', finished_at = now()
    where id = v_import_id;
end;
$$;

revoke all on function hnk_private.sync_atziluth_codex_range(integer, integer, text, text)
from public, anon, authenticated;

create or replace function hnk_private.sync_codex_range(
  p_start_day integer,
  p_end_day integer,
  p_source_commit_sha text
)
returns table(imported_day smallint, blob_sha text)
language sql
security invoker
set search_path = ''
as $$
  select *
  from hnk_private.sync_atziluth_codex_range(
    p_start_day,
    p_end_day,
    p_source_commit_sha,
    'historical'
  );
$$;

revoke all on function hnk_private.sync_codex_range(integer, integer, text)
from public, anon, authenticated;

create or replace function hnk_private.sync_codex_successor_range(
  p_start_day integer,
  p_end_day integer,
  p_source_commit_sha text
)
returns table(imported_day smallint, blob_sha text)
language sql
security invoker
set search_path = ''
as $$
  select *
  from hnk_private.sync_atziluth_codex_range(
    p_start_day,
    p_end_day,
    p_source_commit_sha,
    'successor'
  );
$$;

revoke all on function hnk_private.sync_codex_successor_range(integer, integer, text)
from public, anon, authenticated;
