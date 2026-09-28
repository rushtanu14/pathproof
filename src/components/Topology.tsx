import { useId } from "react";
import type { Condition, Model, Run } from "../domain/types";

export function conditionLabel(condition: Condition): string {
  if ("always" in condition) return "always";
  if ("input" in condition) return `${condition.input} = ${condition.equals}`;
  const terms = "all" in condition ? condition.all : condition.any;
  return `(${terms.map(conditionLabel).join("all" in condition ? " AND " : " OR ")})`;
}

// Breadth-first layers describe structure, not semantic reachability.
function positions(model: Model) {
  const depths = new Map<string, number>([[model.start, 0]]);
  const queue = [model.start];
  for (let i = 0; i < queue.length; i++) {
    for (const edge of model.edges.filter((edge) => edge.from === queue[i])) {
      if (!depths.has(edge.to)) {
        depths.set(edge.to, depths.get(queue[i])! + 1);
        queue.push(edge.to);
      }
    }
  }
  const last = Math.max(...depths.values());
  const groups = Array.from({ length: last + 1 }, (_, depth) =>
    model.nodes.filter((node) => (depths.get(node.id) ?? last) === depth),
  );
  const rows = Math.max(...groups.map((group) => group.length), 2);
  return {
    width: Math.max(
      840,
      groups.filter((group) => group.length).length * 224 + 32,
    ),
    height: rows * 116 + 96,
    points: new Map(
      groups.flatMap((group, col) =>
        group.map(
          (node, row) =>
            [
              node.id,
              {
                x: 32 + col * 224,
                y: 60 + ((rows - group.length) / 2 + row) * 116,
              },
            ] as const,
        ),
      ),
    ),
  };
}

export function Topology({
  model,
  run,
  step,
  focusedNode,
}: {
  model: Model;
  run?: Run;
  step: number;
  focusedNode?: string;
}) {
  const id = useId().replace(/:/g, "");
  const { points, width, height } = positions(model);
  const activeEdges = run?.edges.slice(0, step) ?? [];
  const activeNodes = run?.path.slice(0, step + 1) ?? [];
  return (
    <div
      className="graph-scroll"
      tabIndex={0}
      role="region"
      aria-label="Workflow diagram, scroll horizontally if needed"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Topology of ${model.name}: ${model.nodes.length} nodes, ${model.edges.length} routes. Full route list follows below.`}
      >
        <defs>
          {["normal", "active"].map((kind) => (
            <marker
              key={kind}
              id={`${id}-${kind}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className={`arrow-${kind}`} />
            </marker>
          ))}
        </defs>
        {model.edges.map((edge, index) => {
          const a = points.get(edge.from)!;
          const b = points.get(edge.to)!;
          const forward = b.x > a.x;
          const x1 = forward ? a.x + 174 : a.x + 90;
          const y1 = forward ? a.y + 36 : a.y;
          const x2 = forward ? b.x : b.x + 50;
          const y2 = forward ? b.y + 36 : b.y;
          const lift = Math.max(12, Math.min(a.y, b.y) - 30 - (index % 3) * 12);
          const d = forward
            ? `M${x1},${y1} C${x1 + 26},${y1} ${x2 - 26},${y2} ${x2},${y2}`
            : `M${x1},${y1} C${x1},${lift} ${x2},${lift} ${x2},${y2}`;
          const active = activeEdges.includes(edge.id);
          return (
            <g key={edge.id}>
              <title>
                {edge.id}: {edge.from} → {edge.to}, {conditionLabel(edge.when)}
              </title>
              <path
                data-edge={edge.id}
                d={d}
                className={`edge ${active ? "edge-active" : ""}`}
                markerEnd={`url(#${id}-${active ? "active" : "normal"})`}
              />
            </g>
          );
        })}
        {model.nodes.map((node, index) => {
          const p = points.get(node.id)!;
          const active =
            activeNodes.includes(node.id) || focusedNode === node.id;
          return (
            <g
              key={node.id}
              transform={`translate(${p.x} ${p.y})`}
              className={`graph-node ${active ? "node-active" : ""} ${node.terminal ? "node-terminal" : ""}`}
            >
              <title>
                {node.id}: {node.label}
                {node.terminal ? " (terminal)" : ""}
              </title>
              <rect width="174" height="72" rx="7" />
              <text x="14" y="22" className="node-caption">
                {String(index + 1).padStart(2, "0")} /{" "}
                {node.terminal
                  ? "END"
                  : node.id === model.start
                    ? "START"
                    : "DECISION"}
              </text>
              <text x="14" y="48" className="node-label">
                {node.label.length > 22
                  ? `${node.label.slice(0, 21)}…`
                  : node.label}
              </text>
              {node.terminal && <circle cx="155" cy="18" r="3" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
