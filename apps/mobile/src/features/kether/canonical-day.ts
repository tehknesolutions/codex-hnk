import type { HnkSupabaseClient } from '@hnk/supabase-client';

export interface CanonicalDaySnapshot {
  day: number;
  chapter: number;
  sephira: string;
  world: string;
  angel: string | null;
  level: number;
  xp: number;
  title: string;
  sourceSha: string;
  sourceCommitSha: string | null;
  sourcePath: string;
  rawMarkdown: string;
  blocks: Readonly<Record<string, string>>;
}

type Row = {
  day: number;
  chapter: number;
  sephira: string;
  world: string;
  angel: string | null;
  level: number;
  xp: number;
  title: string;
  source_sha: string;
  source_path: string;
  content: unknown;
};

function extractBlock(markdown: string, blockId: string): string | null {
  const start = `<!-- HNK:COUNT START ${blockId}`;
  const startIndex = markdown.indexOf(start);
  if (startIndex < 0) return null;
  const startEnd = markdown.indexOf('-->', startIndex);
  if (startEnd < 0) return null;
  const endIndex = markdown.indexOf('<!-- HNK:COUNT END -->', startEnd);
  if (endIndex < 0) return null;
  return markdown.slice(startEnd + 3, endIndex).trim();
}

const STANDARD_BLOCK_IDS = [
  'jachin-doctrine',
  'jachin-kavanah',
  'jachin-ordalia',
  'boaz-doctrine',
  'boaz-kavanah',
  'boaz-ordalia',
  'middle-doctrine',
  'middle-kavanah',
  'middle-ordalia',
] as const;

export async function loadCanonicalDay(
  client: HnkSupabaseClient,
  day: number,
): Promise<CanonicalDaySnapshot> {
  if (!Number.isInteger(day) || day < 1 || day > 365) throw new Error('invalid_day');

  const { data, error } = await client
    .from('codex_days')
    .select('day,chapter,sephira,world,angel,level,xp,title,source_sha,source_path,content')
    .eq('day', day)
    .eq('status', 'canon')
    .single();

  if (error) throw error;
  const row = data as Row;
  if (typeof row.content !== 'object' || row.content === null || Array.isArray(row.content)) {
    throw new Error('canonical_content_missing');
  }

  const content = row.content as Record<string, unknown>;
  const rawMarkdown = content.raw_markdown;
  const sourceCommitSha = content.source_commit_sha;
  if (typeof rawMarkdown !== 'string') throw new Error('canonical_markdown_missing');

  const blocks: Record<string, string> = {};
  for (const id of STANDARD_BLOCK_IDS) {
    const value = extractBlock(rawMarkdown, id);
    if (value) blocks[id] = value;
  }

  return {
    day: row.day,
    chapter: row.chapter,
    sephira: row.sephira,
    world: row.world,
    angel: row.angel,
    level: row.level,
    xp: row.xp,
    title: row.title,
    sourceSha: row.source_sha,
    sourceCommitSha: typeof sourceCommitSha === 'string' ? sourceCommitSha : null,
    sourcePath: row.source_path,
    rawMarkdown,
    blocks,
  };
}
