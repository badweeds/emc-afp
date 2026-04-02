import { Badge } from "./ui/badge";
import type { RiskLevel } from "../data/mockData";

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const colors = {
    high: 'bg-[#DC2626] hover:bg-[#DC2626]/90 text-white',
    medium: 'bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white',
    low: 'bg-[#16A34A] hover:bg-[#16A34A]/90 text-white'
  };

  const labels = {
    high: 'High Risk',
    medium: 'Medium Risk',
    low: 'Low Risk'
  };

  return (
    <Badge className={colors[level]}>
      {labels[level]}
    </Badge>
  );
}
