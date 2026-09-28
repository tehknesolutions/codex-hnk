import { day001BoazAxis, day001Convergence, day001OriginCosmos, day001ReflectionField, day001TreeField } from "../../../../packages/visual-contract/src/day001";

export function Day001VisualContractLayer() {
  return (
    <section className="day001-contract-layer" aria-label="Day 001 visual contract">
      <div className="day001-contract-grid">
        <article className="day001-contract-card">
          <span className="kicker">ORIGIN COSMOS · {day001OriginCosmos.version}</span>
          <div className="origin-cosmos" aria-hidden="true">
            <i className="origin-cosmos__axis" />
            {day001OriginCosmos.geometry.ringDiameters.map((diameter, index) => (
              <i key={diameter} className="origin-cosmos__ring" style={{ width: diameter, height: diameter }} data-ring={index + 1} />
            ))}
            <b className="origin-cosmos__point" style={{ width: day001OriginCosmos.geometry.pointDiameter, height: day001OriginCosmos.geometry.pointDiameter }} />
          </div>
          <strong>Ponto · três anéis · eixo</strong>
          <p>Geometria derivada do contrato visual do Day 001. Não é um sigilo canônico.</p>
        </article>

        <article className="day001-contract-card">
          <span className="kicker">BOAZ AXIS · {day001BoazAxis.version}</span>
          <div className="boaz-axis" aria-hidden="true">
            <i />
            {day001BoazAxis.geometry.node.tops.map((top) => <b key={top} style={{ top }} />)}
          </div>
          <strong>Eixo · três nós</strong>
          <p>Restrição visual representada como geometria de interface.</p>
        </article>

        <article className="day001-contract-card">
          <span className="kicker">CONVERGENCE · {day001Convergence.version}</span>
          <div className="convergence" aria-hidden="true">
            <i className="convergence__left" />
            <i className="convergence__right" />
            <b />
          </div>
          <strong>Dois vetores · um centro</strong>
          <p>O caminho médio é tratado como composição, não como evidência externa.</p>
        </article>

        <article className="day001-contract-card day001-contract-card--tree">
          <span className="kicker">TREE FIELD · {day001TreeField.version}</span>
          <div className="tree-field" aria-hidden="true">
            <i />
            {day001TreeField.geometry.nodes.map(([x, y], index) => (
              <b key={index} data-kether={index === day001TreeField.geometry.ketherNodeIndex} style={{ left: x, top: y }} />
            ))}
          </div>
          <div><strong>Árvore · primeiro spark</strong><p>O nó iluminado deve continuar derivado do estado autorizado pelo runtime.</p></div>
        </article>

        <article className="day001-contract-card day001-contract-card--reflection">
          <span className="kicker">REFLECTION FIELD · {day001ReflectionField.version}</span>
          <strong>SOUL MIRROR · VAULT ONLY</strong>
          <p>O campo reflexivo permanece privado; a prosa não é transformada em dado público.</p>
        </article>
      </div>
    </section>
  );
}
