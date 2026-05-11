import { cn } from "@/lib/cn";

type Props = {
  value: number; // 0-100
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  label?: string;
};

export function Progress({ value, className, trackClassName, fillClassName, label }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full", className)} aria-label={label}>
      <div className={cn("h-2 w-full rounded-full bg-line overflow-hidden", trackClassName)}>
        <div
          className={cn("h-full bg-marigold-deep rounded-full transition-all", fillClassName)}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
