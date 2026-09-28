import { day001BoazAxis, day001Convergence, day001OriginCosmos, day001ReflectionField, day001TreeField } from "../../../../packages/visual-contract/src/day001";

export function Day001VisualContractLayer({ firstSpark = false }: { firstSpark?: boolean }) {
  return (
    <section className="day001-contract-layer" data-first-spark={firstSpark} aria-label="Day 001 visual contract">
      <div className="day001-contract-grid">
        <article className="day001-contract-card">
          <span className="kicker">ORIGIN COSMOS · {day001OriginCosmos.version}</span>
          <div className="origin-cosmos" style={{ height: day001OriginCosmos.geometry.height }} aria-hidden="true">
            <i className="origin-cosmos__axis" style={{ height: day001OriginCosmos.geometry.axisHeight }} />
            {day001OriginCosmos.geometry.ringDiameters.map((diameter, index) => (
              <i key={diameter} className="origin-cosmos__ring" style={{ width: diameter, height: diameter }} data-ring={index + 1} />
            ))}
            <b className="origin-cosmos__point" style={{ width: day001OriginCosmos.geometry.pointDiameter, height: day001OriginCosmos.geometry.pointDiameter }} />
          </div>
          <strong>Ponto · três anéis · eixo</strong>
          <p>{day001OriginCosmos.description}</p>
        </article>

        <article className="day001-contract-card">
          <span className="kicker">BOAZ AXIS · {day001BoazAxis.version}</span>
          <div className="boaz-axis" style={{ width: day001BoazAxis.geometry.width, height: day001BoazAxis.geometry.height }} aria-hidden="true">
            <i style={{ left: day001BoazAxis.geometry.line.left, top: day001BoazAxis.geometry.line.top, width: day001BoazAxis.geometry.line.width, height: day001BoazAxis.geometry.line.height }} />
            {day001BoazAxis.geometry.node.tops.map((top) => (
              <b key={top} style={{ left: day001BoazAxis.geometry.node.left, top, width: day001BoazAxis.geometry.node.size, height: day001BoazAxis.geometry.node.size, transform: `rotate(${day001BoazAxis.geometry.node.rotationDegrees}deg)` }} />
            ))}
          </div>
          <strong>Eixo · três nós</strong>
          <p>{day001BoazAxis.description}</p>
        </article>

        <article className="day001-contract-card">
          <span className="kicker">CONVERGENCE · {day001Convergence.version}</span>
          <div className="convergence" style={{ height: day001Convergence.geometry.height }} aria-hidden="true">
            <i className="convergence__left" style={{ width: day001Convergence.geometry.lineWidth, left: `calc(50% - ${day001Convergence.geometry.leftOffset + day001Convergence.geometry.lineWidth}px)`, transform: `rotate(${day001Convergence.geometry.leftRotationDegrees}deg)` }} />
            <i className="convergence__right" style={{ width: day001Convergence.geometry.lineWidth, right: `calc(50% - ${day001Convergence.geometry.rightOffset + day001Convergence.geometry.lineWidth}px)`, transform: `rotate(${day001Convergence.geometry.rightRotationDegrees}deg)` }} />
            <b style={{ width: day001Convergence.geometry.centerDiameter, height: day001Convergence.geometry.centerDiameter }} />
          </div>
          <strong>Dois vetores · um centro</strong>
          <p>{day001Convergence.description}</p>
        </article>

        <article className="day001-contract-card day001-contract-card--tree">
          <span className="kicker">TREE FIELD · {day001TreeField.version}</span>
          <div className="tree-field" style={{ width: day001TreeField.geometry.width, height: day001TreeField.geometry.height }} aria-hidden="true">
            <i style={{ left: day001TreeField.geometry.stem.left, top: day001TreeField.geometry.stem.top, width: day001TreeField.geometry.stem.width, height: day001TreeField.geometry.stem.height }} />
            {day001TreeField.geometry.nodes.map(([x, y], index) => (
              <b key={index} data-kether={index === day001TreeField.geometry.ketherNodeIndex} data-lit={firstSpark && index === day001TreeField.geometry.ketherNodeIndex} style={{ left: x, top: y, width: day001TreeField.geometry.nodeDiameter, height: day001TreeField.geometry.nodeDiameter }} />
            ))}
          </div>
          <div><strong>Árvore · primeiro spark</strong><p>{day001TreeField.description} O estado iluminado continua server-derived.</p></div>
        </article>

        <article className="day001-contract-card day001-contract-card--reflection">
          <span className="kicker">REFLECTION FIELD · {day001ReflectionField.version}</span>
          <strong>SOUL MIRROR · VAULT ONLY</strong>
          <p>{day001ReflectionField.description}</p>
          <small className="day001-contract-privacy">Destino de prosa: {day001ReflectionField.privacy.proseDestination}</small>
        </article>
      </div>
    </section>
  );
}
