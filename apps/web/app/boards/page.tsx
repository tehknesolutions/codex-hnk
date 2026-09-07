import { listBoards } from '@hnk/assets';
import Link from 'next/link';

export default function BoardsIndexPage() {
  const boards = listBoards();

  return (
    <main style={{ minHeight: '100vh', padding: '48px 28px', background: '#050608', color: '#f8f5e8' }}>
      <div style={{ width: 'min(1080px, 100%)', margin: '0 auto' }}>
        <p style={{ color: '#c9ad69', letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 12 }}>
          HNK Board Factory
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(48px, 8vw, 92px)', margin: '12px 0 20px' }}>
          Boards estruturados
        </h1>
        <p style={{ maxWidth: 720, color: '#aaa89f', lineHeight: 1.7 }}>
          Catálogo de boards derivados do conteúdo canônico. Cada item possui contrato, documentação e renderer reutilizável.
        </p>

        <div style={{ display: 'grid', gap: 14, marginTop: 36 }}>
          {boards.map((board) => (
            <Link
              key={board.id}
              href={board.scopeId === 'kether' ? '/boards/kether' : '#'}
              style={{
                display: 'grid',
                gap: 8,
                padding: 24,
                border: '1px solid rgba(196,164,87,.25)',
                borderRadius: 20,
                color: 'inherit',
                textDecoration: 'none',
                background: '#0b0c10',
              }}
            >
              <span style={{ color: '#c9ad69', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                {board.family} · {board.lifecycle}
              </span>
              <strong style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 500 }}>{board.title}</strong>
              <span style={{ color: '#8f8d86' }}>{board.id}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
