function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

interface ThumbProps {
  seed: string;
  name: string;
  className?: string;
}

export function Thumb({ seed, name, className = "" }: ThumbProps) {
  const hue = hashCode(seed) % 360;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      aria-hidden
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 45) % 360} 70% 28%))`,
      }}
      className={`flex shrink-0 select-none items-center justify-center font-semibold text-white/90 ${className}`}
    >
      {initials}
    </div>
  );
}
