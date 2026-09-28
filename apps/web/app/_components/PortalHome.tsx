import Link from "next/link";

const portals = [
  { id: "KETHER", index: "I", range: "001—036", state: "SELADA", href: "/day-001", sourceIds: ["VS-02", "VS-04"], description: "A coroa, origem e primeira entrada da jornada." },
  { id: "CHOKHMAH", index: "II", range: "037—073", state: "SELADA", href: "/day-037", sourceIds: ["VS-02", "VS-06"], description: "O conhecimento em movimento e expansão." },
  { id: "BINAH", index: "III", range: "074—109", state: "EM MANIFESTAÇÃO", href: "/day-074", sourceIds: ["VS-02", "VS-07"], description: "A compreensão tomando forma no códice." },
] as const;

export function PortalHome() {
  return (
    <section className="portal-home" aria-labelledby="portal-home-title">
      <div className="portal-home__header"><div><p className="kicker">TRÍADE I · PORTAL HOME</p><h2 id="portal-home-title">A Árvore começa aqui.</h2></div><p className="portal-home__intro">Três entradas para o primeiro corpo navegável do CODEX. Cada portal é uma superfície de jornada, não uma imagem achatada.</p></div>
      <div className="portal-home__stage" aria-label="Três portais da Tríade I"><div className="portal-home__axis" aria-hidden="true" /><div className="portal-home__core" aria-hidden="true"><span>H</span><span>N</span><span>K</span></div>
        <div className="portal-home__grid">
          {portals.map((portal) => (<Link className="portal-card" data-state={portal.state === "EM MANIFESTAÇÃO" ? "active" : "idle"} href={portal.href} key={portal.id} aria-label={"Abrir " + portal.id + ", dias " + portal.range}>
            <div className="portal-card__orb" aria-hidden="true"><span>{portal.index}</span></div>
            <div className="portal-card__body"><span className="portal-card__range">{portal.range}</span><h3>{portal.id}</h3><small>{portal.state}</small><p>{portal.description}</p></div>
            <span className="portal-card__arrow" aria-hidden="true">↗</span><span className="sr-only">Fontes visuais: {portal.sourceIds.join(", ")}</span>
          </Link>))}
        </div>
      </div>
    </section>
  );
}