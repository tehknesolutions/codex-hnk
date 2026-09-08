export type Day001Source = 'supabase' | 'offline-bundle';

// Editorial display title for the canonical Jachin doctrine passage.
// The canonical body itself remains unchanged below and in the synchronized dataset.
export const DAY001_JACHIN_DOCTRINE_TITLE = 'O abismo silencioso de Kether';

export type Day001Snapshot = {
  day: 1;
  chapter: 1;
  sephira: 'Kether';
  world: 'Atziluth';
  angel: 'Vehuiah';
  level: 1;
  xp: 150;
  tracks: readonly ['TEURG-101', 'COMP-101', 'BIO-101'];
  tarot: 'O Louco';
  rune: 'Fehu';
  iching: 'Hexagrama 1 — O Criativo';
  experienceTitle: 'O Salto Cósmico';
  sourceSha: string;
  sourceCommitSha: string;
  source: Day001Source;
  jachinDoctrine: string;
  jachinKavanah: string;
  boazDoctrine: string;
  boazKavanah: string;
  boazOrdalia: string;
  middleDoctrine: string;
  middleKavanah: string;
};

const OFFLINE_DAY_001: Day001Snapshot = {
  day: 1,
  chapter: 1,
  sephira: 'Kether',
  world: 'Atziluth',
  angel: 'Vehuiah',
  level: 1,
  xp: 150,
  tracks: ['TEURG-101', 'COMP-101', 'BIO-101'],
  tarot: 'O Louco',
  rune: 'Fehu',
  iching: 'Hexagrama 1 — O Criativo',
  experienceTitle: 'O Salto Cósmico',
  sourceSha: 'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
  sourceCommitSha: 'eeb1be4ff704e2bd4cd598e4d5bc2bc449a26c83',
  source: 'offline-bundle',
  jachinDoctrine:
    'No primeiro dia da sua travessia, você depara-se com o abismo silencioso de Kether, a Coroa inacessível onde a existência repousa antes de qualquer forma. Aqui não há pensamentos, conceitos ou imagens; existe apenas a pulsação pura da Vida Zoe, o sopro divino incriado que sustenta a realidade inteira. O Louco ergue o seu bastão à beira do precipício, convidando-o a dar o salto de fé em direção ao absoluto esvaziamento da mente lógica. Para que a luz perpétua possa preencher o seu templo, a sua Psuche deve render-se de forma voluntária ao silêncio. Esqueça tudo o que aprendeu; apague as definições mundanas e as amarras intelectuais que limitam a sua percepção espiritual. Hoje, sintonizamos o símbolo mestre Dai Koo Myo, abrindo todos os canais sutis para receber a torrente ilimitada do Espírito Santo na terra sagrada.',
  jachinKavanah:
    'Sente-se em postura ereta, respirando de forma profunda e pausada. Feche os olhos e visualize o símbolo Dai Koo Myo brilhando em ouro incandescente no topo da sua cabeça. Sinta a luz fluir para baixo, inundando o seu cérebro e silenciando o fluxo de palavras. Mantenha o foco fixo nesse ponto de luz por dez minutos, permitindo que a sua consciência se expanda até fundir-se com o vazio primordial divino e eterno.',
  boazDoctrine:
    'A descida da força exige um vaso purificado e estruturado sob as leis do Rigor. No pilar de Boaz, compreendemos que a mente racional é o guardião cioso que impede o livre fluxo da verdade interior. O Fator Crítico ergue barreiras lógicas para proteger o ego decaído, mantendo-o preso aos condicionamentos mundanos da carne. Para desarmar essa fortaleza sem gerar conflito biológico, aplicamos o método de auto-hipnose de Dave Elman, provocando a fadiga pálpebral e o relaxamento muscular profundo. Esta restrição voluntária desliga a tagarelice da Psuche e prepara o terreno biológico para o descanso onírico consciente. O silêncio físico é o selo que protege a sua bioenergia das larvas e dispersões do cotidiano. Guarde a sua mente com severidade, eliminando todas as distrações, dúvidas, medos e ruídos desnecessários que tentarem invadir o seu próprio templo sagrado.',
  boazKavanah:
    'Deite-se confortavelmente em um quarto totalmente escuro e silencioso. Force o relaxamento completo dos músculos ao redor dos seus olhos, certificando-se de que é impossível abrir as pálpebras de forma voluntária. Transfira essa sensação de paralisia muscular para o resto do corpo, descendo em transe profundo por cinco minutos. Ao final, determine mentalmente que todos os seus sonhos desta noite serão recordados com nitidez absoluta no seu próprio diário de bordo pessoal.',
  boazOrdalia:
    'Escreva agora no seu diário de bordo digital as três principais distrações do seu ambiente físico que você irá banir e afastar a partir de hoje.',
  middleDoctrine:
    'No pilar central de Tiphereth, os extremos se encontram para selar a aliança eterna entre a força e a forma. A energia do Arcano do Louco fertiliza a terra árida com a riqueza espiritual de Fehu, o fogo do Hexagrama 1 que inicia o ciclo da criação cósmica. Para fundir a expansão de Jachin com o rigor de Boaz, recorremos à glossolália espiritual como um atalho neurológico de alta performance. Ao emitir sons desprovidos de sentido lógico, você desliga o hemisfério esquerdo e permite que a Vida Zoe jorre sem filtros intelectuais sobre o seu sistema nervoso. O equilíbrio reside na união da disciplina corporal com a liberdade do espírito. O Mestre e o discípulo se tornam um só no centro geométrico do seu próprio templo de oração e do poder supremo da sua consciência divina ativa.',
  middleKavanah:
    'Respire ritmadamente em quatro tempos. Em estado de transe leve, comece a vocalizar sons rápidos, rítmicos e sem lógica racional por três minutos contínuos. Não tente controlar a pronúncia; deixe que a sua laringe vibre livremente, expressando a energia sutil do seu subconsciente. Sinta o calor bioenergético subir pela sua coluna vertebral, acendendo um sol dourado e brilhante no centro geométrico do seu próprio peito no plano sutil totalmente divino e maravilhoso.',
};

type SupabaseDayRow = {
  day?: unknown;
  chapter?: unknown;
  sephira?: unknown;
  world?: unknown;
  angel?: unknown;
  level?: unknown;
  xp?: unknown;
  tracks?: unknown;
  source_sha?: unknown;
  content?: unknown;
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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function fromSupabaseRow(row: SupabaseDayRow): Day001Snapshot | null {
  if (
    row.day !== 1 ||
    row.chapter !== 1 ||
    row.sephira !== 'Kether' ||
    row.world !== 'Atziluth' ||
    row.angel !== 'Vehuiah' ||
    row.level !== 1 ||
    row.xp !== 150 ||
    !isStringArray(row.tracks) ||
    typeof row.source_sha !== 'string' ||
    typeof row.content !== 'object' ||
    row.content === null
  ) {
    return null;
  }

  const content = row.content as Record<string, unknown>;
  const rawMarkdown = content.raw_markdown;
  const sourceCommitSha = content.source_commit_sha;
  if (typeof rawMarkdown !== 'string' || typeof sourceCommitSha !== 'string') return null;

  const jachinDoctrine = extractBlock(rawMarkdown, 'jachin-doctrine');
  const jachinKavanah = extractBlock(rawMarkdown, 'jachin-kavanah');
  const boazDoctrine = extractBlock(rawMarkdown, 'boaz-doctrine');
  const boazKavanah = extractBlock(rawMarkdown, 'boaz-kavanah');
  const boazOrdalia = extractBlock(rawMarkdown, 'boaz-ordalia');
  const middleDoctrine = extractBlock(rawMarkdown, 'middle-doctrine');
  const middleKavanah = extractBlock(rawMarkdown, 'middle-kavanah');
  if (!jachinDoctrine || !jachinKavanah || !boazDoctrine || !boazKavanah || !boazOrdalia || !middleDoctrine || !middleKavanah) return null;

  return {
    ...OFFLINE_DAY_001,
    source: 'supabase',
    sourceSha: row.source_sha,
    sourceCommitSha,
    jachinDoctrine,
    jachinKavanah,
    boazDoctrine,
    boazKavanah,
    boazOrdalia,
    middleDoctrine,
    middleKavanah,
  };
}

export async function loadDay001Snapshot(accessToken?: string): Promise<Day001Snapshot> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey || !accessToken) return OFFLINE_DAY_001;

  try {
    const response = await fetch(
      `${url}/rest/v1/codex_days?day=eq.1&select=day,chapter,sephira,world,angel,level,xp,tracks,source_sha,content&limit=1`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) return OFFLINE_DAY_001;
    const rows: unknown = await response.json();
    if (!Array.isArray(rows) || rows.length !== 1) return OFFLINE_DAY_001;

    return fromSupabaseRow(rows[0] as SupabaseDayRow) ?? OFFLINE_DAY_001;
  } catch {
    return OFFLINE_DAY_001;
  }
}
