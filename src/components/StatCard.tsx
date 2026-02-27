import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <Card className={accent ? "border-accent/30 bg-accent/5" : ""}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`p-3 rounded-lg ${accent ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="stat-value">{value}</p>
          <p className="stat-label">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
