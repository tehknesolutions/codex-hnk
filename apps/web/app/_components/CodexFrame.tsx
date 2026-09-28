type Props = { children: React.ReactNode; as?: "section" | "div"; className?: string; label?: string };
import type { ReactNode } from "react";

export function CodexFrame({ children, as: Tag = "section", className = "", label }: Props) {
  return <Tag className={["codex-frame", className].filter(Boolean).join(" ")}>{label ? <div className="codex-frame__label">{label}</div> : null}{children}</Tag>;
}