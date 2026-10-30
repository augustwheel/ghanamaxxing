import Image from "next/image";
import { getLaunchType } from "@/config/launch-types";
import { isOptimizable } from "@/lib/format";

function initials(name: string) {
  const words = name.trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

// Round logo with a ring in the launch type's colour; initials when there's no logo.
export function LaunchLogo({
  name,
  logoUrl,
  type,
  size = 48,
  priority = false,
}: {
  name: string;
  logoUrl: string | null;
  type: string;
  size?: number;
  priority?: boolean;
}) {
  const color = getLaunchType(type).color;
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2"
      style={{ width: size, height: size, boxShadow: `0 0 0 2px ${color}` }}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={size}
          height={size}
          priority={priority}
          unoptimized={!isOptimizable(logoUrl)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden className="font-display" style={{ color, fontSize: size * 0.38 }}>
          {initials(name)}
        </span>
      )}
    </span>
  );
}
