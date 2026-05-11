import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
  emphasis?: boolean;
};

export function Stat({ label, value, hint, className, emphasis }: Props) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-xs uppercase tracking-wider text-muted font-mono">{label}</span>
      <span className={cn("font-display tracking-tight mt-1", emphasis ? "text-5xl" : "text-3xl")}>{value}</span>
      {hint && <span className="text-sm text-slate mt-1">{hint}</span>}
    </div>
  );
}
