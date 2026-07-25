interface SeverityBadgeProps {
  score: number;
}

export default function SeverityBadge({ score }: SeverityBadgeProps) {
  let severity = "LOW";
  let styles = "bg-gray-500/20 text-gray-300 border-gray-500/30";

  if (score >= 90) {
    severity = "CRITICAL";
    styles = "bg-soc-danger/20 text-soc-danger border-soc-danger/30 glow-danger";
  } else if (score >= 70) {
    severity = "HIGH";
    styles = "bg-soc-warning/20 text-soc-warning border-soc-warning/30";
  } else if (score >= 40) {
    severity = "MEDIUM";
    styles = "bg-blue-500/20 text-blue-400 border-blue-500/30";
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles}`}>
      {severity}
    </span>
  );
}
