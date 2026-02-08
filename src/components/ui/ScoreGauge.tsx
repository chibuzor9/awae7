import { type SVGAttributes } from "react";
import { cn } from "@/lib/utils";

function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e"; /* green-500 */
  if (score >= 70) return "#84cc16"; /* lime-500 */
  if (score >= 50) return "#f59e0b"; /* amber-500 */
  if (score >= 30) return "#f97316"; /* orange-500 */
  return "#ef4444"; /* red-500 */
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 30) return "Poor";
  return "Critical";
}

export interface ScoreGaugeProps extends SVGAttributes<SVGSVGElement> {
  score: number;
  size?: number;
}

export function ScoreGauge({
  score,
  size = 120,
  className,
  ...props
}: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = getScoreColor(clampedScore);
  const label = getScoreLabel(clampedScore);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Score: ${clampedScore} out of 100 - ${label}`}
      className={cn("inline-block", className)}
      {...props}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />

      {/* Score arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.6s ease" }}
      />

      {/* Score number */}
      <text
        x="50%"
        y="46%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={size * 0.28}
        fontWeight="700"
        fill={color}
      >
        {clampedScore}
      </text>

      {/* Label */}
      <text
        x="50%"
        y="66%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={size * 0.11}
        fill="#6b7280"
      >
        {label}
      </text>
    </svg>
  );
}
