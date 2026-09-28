import type { ReactNode } from "react";
import { CodexFrame } from "../_components/CodexFrame";
import { MetricStrip } from "../_components/MetricStrip";

type Props = {
  children: ReactNode;
  day: string;
  title: string;
  subtitle: string;
};

export function DayChamber({ children, day, title, subtitle }: Props) {
  return (
    <main className="day-chamber">
      <header className="day-chamber__masthead">
        <span className="kicker">CODEX · KETHER · {day}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      <MetricStrip metrics={[
        { label: "Day", value: day },
        { label: "Esfera", value: "KETHER" },
        { label: "Modo", value: "JORNADA" },
      ]} />
      <CodexFrame label="DAY CHAMBER">
        <div className="day-chamber__content">{children}</div>
      </CodexFrame>
    </main>
  );
}
