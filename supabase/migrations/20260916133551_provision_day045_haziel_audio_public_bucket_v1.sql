-- Day 045 / Haziel public audio bucket.
-- Bucket provisioning only. Publication state remains locked until exact canonical
-- WAV objects are uploaded, downloaded, checksum-verified, and QA is completed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hnk-audio-public', 'hnk-audio-public', true, 262144, array['audio/wav']::text[])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();
