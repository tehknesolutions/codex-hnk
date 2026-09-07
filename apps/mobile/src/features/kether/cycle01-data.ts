export type VehuiahContentDay = 2 | 3 | 4 | 5;

export interface VehuiahDaySnapshot {
  day: VehuiahContentDay;
  title: string;
  dramaticRole: string;
  xp: 100;
  sephira: 'Kether';
  world: 'Atziluth';
  angel: 'Vehuiah';
  sourceSha: string;
  sourceCommitSha: string;
  source: 'supabase' | 'offline-bundle';
  jachinKavanah: string;
  jachinOrdalia: string;
  boazKavanah: string;
  boazOrdalia: string;
  middleKavanah: string;
  middleOrdalia: string;
}

const BASE = {
  xp: 100 as const,
  sephira: 'Kether' as const,
  world: 'Atziluth' as const,
  angel: 'Vehuiah' as const,
  sourceCommitSha: '968e8dc2050e7d2a076fc4e892e727e0772594a5',
  source: 'offline-bundle' as const,
};

const OFFLINE: Record<VehuiahContentDay, VehuiahDaySnapshot> = {
  2: {
    ...BASE,
    day: 2,
    title: 'Imobilidade Corporal',
    dramaticRole: 'EU CONSIGO PERMANECER.',
    sourceSha: '71019573414493ee9e5521f4d27ed744748c0d2b',
    jachinKavanah:
      'Sente-se confortavelmente em uma cadeira, mantendo agora a coluna ereta e as palmas das mãos voltadas para cima sobre os joelhos. Respire de forma ritmada por cinco minutos, visualizando um sol de ouro brilhando no topo de sua cabeça [12]. Deixe que as ondas de calor dessa luz dourada desçam lentamente por seus ombros, relaxando cada fibra muscular até que seu corpo físico repouse inabalável em um estado de leveza espiritual completa [12] conscientemente.',
    jachinOrdalia:
      'Inicie agora o aplicativo HNK e acione o áudio binaural em frequência Solfeggio de 528Hz para sintonizar as correntes vibracionais de expansão bioenergética na sua aura.',
    boazKavanah:
      'Adote a postura do asana de imobilidade absoluta por quinze minutos contínuos e imóveis. Congele os seus membros e ignore qualquer impulso de coçar ou mover que o cérebro reptiliano enviar para testar sua mente [12]. Mantenha os olhos focados em um único ponto fixo à sua frente, respirando de forma quase imperceptível. Domine a carne fraca e observe o silêncio que se instala à medida que o ruído biológico cessa completamente agora.',
    boazOrdalia:
      'Registre no seu diário de bordo digital como a sua mente reagiu aos primeiros cinco minutos de imobilidade física absoluta e as terríveis coceiras que superou.',
    middleKavanah:
      'No estado de imobilidade pós-asana, inspire a luz branca e divina de Kether acumulando-a no seu lobo frontal esquerdo por três minutos [12]. Comande mentalmente que essa energia sutil se espalhe por todo o seu sistema nervoso central, rejuvenescendo todas as suas células corporais [12]. Visualize uma malha dourada e geométrica selando o seu corpo sutil contra quaisquer larvas astrais and ruídos externos, estabilizando a sua bioenergia na terra física agora mesmo com serenidade.',
    middleOrdalia:
      'Valide a conclusão do Asana do Louco no aplicativo HNK para atualizar os seus atributos de Disciplina e ganhar exatamente cem pontos de experiência canônicos reais.',
  },
  3: {
    ...BASE,
    day: 3,
    title: 'Despolarização do Ego',
    dramaticRole: 'PENSAMENTO NÃO É AUTOMATICAMENTE IDENTIDADE.',
    sourceSha: '3cb60ed208c24ee885cbe95d974c7468419120aa',
    jachinKavanah:
      'Sente-se em silêncio absoluto e observe o fluxo contínuo de seus pensamentos sem se identificar com nenhum deles. Veja cada ideia surgir, flutuar e desaparecer na escuridão da sua mente como se fossem nuvens passageiras no céu [12]. Mantenha essa observação desapegada por dez minutos, respirando de forma suave e expandindo o seu foco sutil até experimentar a quietude pura da sua consciência divina e o repouso da alma. Selo. Luz. Vida conscientemente.',
    jachinOrdalia:
      'Identifique e escreva no seu diário de bordo digital três crenças limitantes do cotidiano que você está pronto para questionar e abandonar hoje mesmo. Selo. Luz.',
    boazKavanah:
      'Entre em auto-hipnose rápida utilizando o relaxamento pálpebral do método Dave Elman. Em estado de transe leve, localize em sua mente a parte interna que cria as desculpas de preguiça ou cansaço para evitar as meditações [12]. Faça uma pergunta direta a essa parte: qual é a intenção positiva de tentar me proteger do progresso espiritual? Aguarde a resposta mental e observe os sentimentos físicos que surgirem no peito. Selo. Luz. Vida conscientemente.',
    boazOrdalia:
      'Banir um vício de pensamento específico hoje, recusando-se a repetir qualquer queixa ou reclamação sobre as suas dificuldades por vinte e quatro horas consecutivas. Selo conscientemente.',
    middleKavanah:
      'No estado pós-transe, visualize um sol dourado brilhando intensamente no centro do seu peito, unindo a força de Jachin e a forma de Boaz em equilíbrio [12]. Sinta a luz expandir-se a cada respiração, preenchendo o seu corpo com vitalidade pura e divina [12]. Declare mentalmente a sua total soberania espiritual sobre as ilusões do ego, ancorando a paz inefável no seu templo biológico e físico hoje mesmo. Selo. Luz. Vida. Gnose com serenidade.',
    middleOrdalia:
      'Confirme a conclusão da despolarização do ego no aplicativo HNK para elevar a sua Sintonia Espiritual e garantir exatamente cem pontos de experiência canônicos reais. Selo.',
  },
  4: {
    ...BASE,
    day: 4,
    title: 'Placebo Intencional / Reconfiguração',
    dramaticRole: 'POSSO EXPERIMENTAR OUTRA REPRESENTAÇÃO SEM CONFUNDI-LA COM FATO.',
    sourceSha: '376964a263f3d4f07542fcf55ca3bf2c18c5fd94',
    jachinKavanah:
      'Feche os olhos e sintonize o seu transe leve. Imagine-se vestindo um manto sutil de pura luz branca e dourada no topo de sua cabeça, descendo até os seus pés [12]. Sinta a textura suave e o calor magnético desse manto protetor atuando diretamente em sua pele. Sustente essa visualização por dez minutos, permitindo que a sua bioenergia se estabilize na frequência pura de Kether por completo hoje. Selo. Luz. Vida. Gnose conscientemente.',
    jachinOrdalia:
      'Abra o aplicativo HNK e escaneie o código do dia para ativar as batidas binaurais de gnose Theta e recarregar os pontos de Ki. Selo. Luz.',
    boazKavanah:
      'Durante dez minutos, sente-se na postura do asana de imobilidade e monitore a esteira de pensamentos. Sempre que uma imagem ou frase de dúvida, reclamação ou cansaço surgir na tela da sua mente, repita mentalmente o comando: cancelado [12]. Imagine a palavra se dissolvendo no vazio absoluto da sua consciência divina, restaurando a quietude e o silêncio que purificam as suas funções nervosas corporais. Selo. Luz. Vida. Gnose. Zoe. Amém. YHVH. Fehu conscientemente.',
    boazOrdalia:
      'Escreva no seu diário de bordo digital qual foi o principal gatilho emocional de vitimismo que você conseguiu identificar e silenciar no dia de hoje. Selo.',
    middleKavanah:
      'Entre em transe através do relaxamento dos olhos do método Dave Elman [12]. No ápice do silêncio mental, realize a técnica do Padrão Swish: visualize uma imagem pequena e escura do seu ego derrotado e empurre-a rapidamente com a mente, substituindo-a por uma imagem gigante, brilhante e dourada do seu ser divino [12]. Sinta a bioquímica corporal mudar instantaneamente sob a força quântica da luz. Selo. Luz. Vida. Gnose. Zoe. Amém. YHVH com serenidade.',
    middleOrdalia:
      'Valide o exercício de placebo intencional no aplicativo HNK para atualizar as estatísticas de Maestria Hipnótica na ficha de RPG do seu magista. Selo. Luz. Vida.',
  },
  5: {
    ...BASE,
    day: 5,
    title: 'Banimento Inicial por Intenção',
    dramaticRole: 'EU DELIMITO E ENCERRO.',
    sourceSha: 'eb9f078bdc7654135f83fbcdf0aa7d5d38412cff',
    jachinKavanah:
      'Pratique a respiração porosa expansiva por dez minutos completos. Ao inspirar, sinta a luz dourada de Kether entrar pelos poros de sua pele, acumulando-se em seu coração. Ao expirar, visualize essa energia branca expandir-se como uma bolha brilhante ao redor de seu corpo físico, empurrando para longe quaisquer sombras, tensões, medos e ruídos que tentarem invadir o seu próprio templo sagrado e divino hoje. Selo. Luz. Vida. Gnose. Zoe. Amém com serenidade.',
    jachinOrdalia:
      'Aponte a câmera do aplicativo HNK para o altar físico do dia, ativando o scanner interativo de QR Code para iniciar o ritual de sintonização. Selo.',
    boazKavanah:
      'Fique de pé, voltado para o Leste. Respire profundamente e, com a mão dominante em forma de espada, faça gestos firmes de corte no ar ao seu redor, expulsando as energias ruins. Ao final de cada corte, expire de forma rápida e forte pelo nariz, visualizando os laços escuros se rompendo e se dissolvendo no fogo sagrado de Kether de modo instantâneo, total e libertador para sempre. Selo. Luz. Vida. Gnose. Zoe.',
    boazOrdalia:
      'Escreva em seu diário de bordo digital as amarras e vícios emocionais que você baniu de seu campo energético e que não aceitará mais hoje. Selo.',
    middleKavanah:
      'Sentando-se em postura meditativa, trace mentalmente o símbolo mestre Dai Koo Myo brilhando no centro de seu peito em ouro radiante [12]. Sinta a pulsação do Reiki harmonizar todos os seus chakras superiores e canais bioenergéticos por cinco minutos. Visualize-se envolto em uma esfera de luz azul-celeste indestrutível, selando toda a sua energia vital e o seu duplo espiritual sutil na terra de forma perfeita hoje. Selo. Luz. Vida. Gnose com plena serenidade.',
    middleOrdalia:
      'Confirme a conclusão do Banimento Inicial no aplicativo HNK para atualizar as estatísticas de Bioenergia e garantir exatamente cem pontos de experiência canônicos reais. Selo. Luz.',
  },
};

type SupabaseRow = {
  day?: unknown;
  chapter?: unknown;
  sephira?: unknown;
  world?: unknown;
  angel?: unknown;
  level?: unknown;
  xp?: unknown;
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

function parseLive(day: VehuiahContentDay, row: SupabaseRow): VehuiahDaySnapshot | null {
  if (
    row.day !== day ||
    row.chapter !== 1 ||
    row.sephira !== 'Kether' ||
    row.world !== 'Atziluth' ||
    row.angel !== 'Vehuiah' ||
    row.level !== 1 ||
    row.xp !== 100 ||
    typeof row.source_sha !== 'string' ||
    typeof row.content !== 'object' ||
    row.content === null
  ) return null;

  const content = row.content as Record<string, unknown>;
  const markdown = content.raw_markdown;
  const sourceCommitSha = content.source_commit_sha;
  if (typeof markdown !== 'string' || typeof sourceCommitSha !== 'string') return null;

  const ids = [
    'jachin-kavanah',
    'jachin-ordalia',
    'boaz-kavanah',
    'boaz-ordalia',
    'middle-kavanah',
    'middle-ordalia',
  ] as const;
  const blocks = Object.fromEntries(ids.map((id) => [id, extractBlock(markdown, id)]));
  if (Object.values(blocks).some((value) => !value)) return null;

  return {
    ...OFFLINE[day],
    source: 'supabase',
    sourceSha: row.source_sha,
    sourceCommitSha,
    jachinKavanah: blocks['jachin-kavanah']!,
    jachinOrdalia: blocks['jachin-ordalia']!,
    boazKavanah: blocks['boaz-kavanah']!,
    boazOrdalia: blocks['boaz-ordalia']!,
    middleKavanah: blocks['middle-kavanah']!,
    middleOrdalia: blocks['middle-ordalia']!,
  };
}

export async function loadVehuiahDay(
  day: VehuiahContentDay,
  accessToken?: string,
): Promise<VehuiahDaySnapshot> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey || !accessToken) return OFFLINE[day];

  try {
    const response = await fetch(
      `${url}/rest/v1/codex_days?day=eq.${day}&select=day,chapter,sephira,world,angel,level,xp,source_sha,content&limit=1`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );
    if (!response.ok) return OFFLINE[day];
    const rows: unknown = await response.json();
    if (!Array.isArray(rows) || rows.length !== 1) return OFFLINE[day];
    return parseLive(day, rows[0] as SupabaseRow) ?? OFFLINE[day];
  } catch {
    return OFFLINE[day];
  }
}
