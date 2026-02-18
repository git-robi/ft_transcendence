
type Props = {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
};

export default function Sparkline({
  data,
  width = 240,
  height = 72,
  stroke = "#fff",
  fill = "none",
}: Props) {
  if (!data || data.length === 0) {
    return <div className="w-full h-20 bg-transparent border rounded-lg" />;
  }

  const pad = 6;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max === min ? 1 : max - min;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + (1 - (v - min) / range) * h;
    return [x, y];
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20">
      <rect x="0" y="0" width={width} height={height} rx="8" ry="8" fill="none" stroke="white" strokeWidth="1.5" opacity="0.15" />
      <path d={path} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}