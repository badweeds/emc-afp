import { Card, CardContent } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

export function StatCard({ title, value, icon: Icon, color = '#7B1E1E' }: StatCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-semibold">{value}</p>
          </div>
          <div 
            className="p-4 rounded-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="size-8" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
