import Link from "next/link";
import { hnkTreeLevels, hnkTreeNodes } from "../../../../packages/visual-contract/src/tree";

const portalMeta = {
  keter: { glyph: "I", sourceIds: ["VS-02", "VS-04"], description: "A coroa, origem e primeira entrada da jornada." },
  chokhmah: { glyph: "II", sourceIds: ["VS-02", "VS-06"], description: "O conhecimento em movimento e expansão." },
  binah: { glyph: "III", sourceIds: ["VS-02", "VS-07"], description: "A compreensão tomando forma no códice." },
} as const;

const levelsById = new Map(hnkTreeLevels.map((level) => [level.id, level]));

export function PortalHome() {
  return (
    <section className="portal-home" aria-labelledby="portal-home-title">
      <div className="portal-home__header"><div><p className="kicker">TRÍADE I · PORTAL HOME</p><h2 id="portal-home-title">A Árvore começa aqui.</h2></div><p className="portal-home__intro">Três estruturas da primeira tríade. Portais executáveis abrem a Jornada; estruturas futuras permanecem visíveis sem fabricar câmaras.</p></div>
      <div className="portal-home__stage" aria-label="Três portais da Tríade I"><div className="portal-home__axis" aria-hidden="true" /><div className="portal-home__core" aria-hidden="true"><span>H</span><span>N</span><span>K</span></div>
        <div className="portal-home__grid">
          {hnkTreeNodes.map((node) => {
            const level = levelsById.get(node.levelId);
            const meta = portalMeta[node.levelId];
            const content = <><div className="portal-card__orb" aria-hidden="true"><span>{meta.glyph}</span></div><div className="portal-card__body"><span className="portal-card__range">{level?.dayRange}</span><h3>{node.label}</h3><small>{node.state.toUpperCase()}</small><p>{meta.description}</p></div><span className="portal-card__arrow" aria-hidden="true">{node.href ? "↗" : "—"}</span><span className="sr-only">Fontes visuais: {meta.sourceIds.join(", ")}</span></>;
            return node.href ? <Link className="portal-card" data-state={node.state} href={node.href} key={node.id} aria-label={`Abrir ${node.label}, dias ${level?.dayRange}`}>{content}</Link> : <div className="portal-card" data-state="dormant" aria-disabled="true" key={node.id}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}