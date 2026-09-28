import type { ReactNode } from "react";

type Props = { children: ReactNode; title?: string; eyebrow?: string; tone?: "default" | "elevated" | "quiet" };

export function SacredPanel({ children, title, eyebrow, tone = "default" }: Props) {
  return <section className="sacred-panel" data-tone={tone}>{eyebrow ? <span className="sacred-panel__eyebrow">{eyebrow}</span> : null}{title ? <h3 className="sacred-panel__title">{title}</h3> : null}<div className="sacred-panel__content">{children}</div></section>;
}