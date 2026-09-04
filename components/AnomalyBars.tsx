import { rampColor } from "@/lib/ramp";

type Props = {
  values: number[];
  /** Symmetric y-domain in °C. */
  max?: number;
  width?: number;
  height?: number;
  title?: string;
};

/** A bar-per-sample anomaly strip with a zero rule, ramp-coloured. Used for sparklines. */
export function AnomalyBars({ values, max = 3, width = 260, height = 40, title }: Props) {
  const n = values.length;
  const zero = height / 2;
  const scale = zero / max;
  const bw = width / n;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label={title}
    >
      {values.map((v, i) => {
        const h = Math.min(zero, Math.abs(v) * scale);
        return (
          <rect
            key={i}
            x={i * bw}
            y={v >= 0 ? zero - h : zero}
            width={Math.max(bw - 0.5, 0.6)}
            height={Math.max(h, 0.5)}
            fill={rampColor(v)}
          />
        );
      })}
      <line x1={0} x2={width} y1={zero} y2={zero} stroke="#8592A6" strokeWidth={0.75} />
    </svg>
  );
}
