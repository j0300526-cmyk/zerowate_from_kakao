import React from "react";

export const AVATAR_OPTIONS = [
  { id: "sprout", label: "새싹", emoji: "🌱" },
  { id: "cat", label: "고양이", emoji: "🐱" },
  { id: "dog", label: "강아지", emoji: "🐶" },
  { id: "rabbit", label: "토끼", emoji: "🐰" },
  { id: "bear", label: "곰", emoji: "🐻" },
  { id: "panda", label: "판다", emoji: "🐼" },
] as const;

export type AvatarId = (typeof AVATAR_OPTIONS)[number]["id"];

interface Props {
  avatar?: string;
  color?: string;
  size?: "sm" | "lg" | "xl";
  className?: string;
  label?: string;
}

export function isAvatarId(value: string | null | undefined): value is AvatarId {
  return AVATAR_OPTIONS.some((option) => option.id === value);
}

export default function ProfileAvatar({
  avatar,
  color = "bg-green-300",
  size = "lg",
  className = "",
  label,
}: Props) {
  const selected = AVATAR_OPTIONS.find((option) => option.id === avatar) ?? AVATAR_OPTIONS[0];

  return (
    <span
      className={`cute-avatar cute-avatar-${size} ${color} ${className}`.trim()}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className="cute-avatar-emoji">{selected.emoji}</span>
    </span>
  );
}
