export type TreeNodeState = "dormant" | "perceived" | "active" | "revealed" | "acquired";

type TreeNodeProps = {
  label: string;
  index: string;
  state?: TreeNodeState;
  href?: string;
  description?: string;
};

export function TreeNode({ label, index, state = "dormant", href, description }: TreeNodeProps) {
  const content = <><span className="tree-node__index">{index}</span><span className="tree-node__label">{label}</span>{description ? <span className="tree-node__description">{description}</span> : null}</>;
  return href ? <a className="tree-node" data-state={state} href={href}>{content}</a> : <div className="tree-node" data-state={state}>{content}</div>;
}