type Props = { className?: string };

export function LogoMark({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="oklch(78% 0.16 70)" />
      {/* paw mark - 4 toes + pad */}
      <ellipse cx="10" cy="11" rx="2.4" ry="3" fill="oklch(20% 0.04 240)" />
      <ellipse cx="16" cy="9" rx="2.4" ry="3" fill="oklch(20% 0.04 240)" />
      <ellipse cx="22" cy="11" rx="2.4" ry="3" fill="oklch(20% 0.04 240)" />
      <path
        d="M9 20c0-3.5 3-6 7-6s7 2.5 7 6c0 3-2.6 5-7 5s-7-2-7-5z"
        fill="oklch(20% 0.04 240)"
      />
    </svg>
  );
}
