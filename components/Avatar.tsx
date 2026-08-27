import Image from "next/image";

interface AvatarProps {
  name: string;
  src: string;
  size: number;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, src, size, className = "" }: AvatarProps) {
  const shape = `shrink-0 rounded-full bg-sunken ${className}`;
  const box = { width: size, height: size };

  if (!src) {
    return (
      <div
        aria-hidden
        style={box}
        className={`flex items-center justify-center font-semibold text-ink ${shape}`}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <Image
      alt=""
      aria-hidden
      src={src}
      width={size}
      height={size}
      style={box}
      className={`object-cover ${shape}`}
    />
  );
}
