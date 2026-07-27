import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUpdatedAt(value?: any) {
  if (!value) return "Unknown";
  if (typeof value?.toDate === "function") {
    const date = value.toDate();
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  if (typeof value === "number") {
    return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
