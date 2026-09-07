create or replace function hnk_private.sync_codex_range(
  p_start_day integer,
  p_end_day integer,
  p_source_commit_sha text
)
returns table(imported_day smallint, blob_sha text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  i integer;
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
  if p_start_day < 1 or p_end_day > 365 or p_start_day > p_end_day then
    raise exception 'Invalid Codex day range: %..%', p_start_day, p_end_day;
  end if;

  insert into public.codex_import_runs(id, source_sha, days_imported, status)
  values (v_import_id, p_source_commit_sha, 0, 'started');

  for i in p_start_day..p_end_day loop
    v_source_path := format('canon/capitulo-01-kether/dia-%s.md', lpad(i::text, 3, '0'));
    v_url := 'https://raw.githubusercontent.com/Tehkne-Solutions/hnk-codex-365/main/' || v_source_path;

    select h.status, h.content
      into v_http_status, v_content
      from extensions.http_get(v_url) h;

    if v_http_status <> 200 or v_content is null then
      raise exception 'Failed to fetch day % from canonical repo: HTTP %', i, v_http_status;
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
exception
  when others then
    update public.codex_import_runs
      set status = 'failed', error_message = sqlerrm, finished_at = now()
      where id = v_import_id;
    raise;
end;
$$;

revoke all on function hnk_private.sync_codex_range(integer, integer, text) from public, anon, authenticated;
