export function cn(...inputs) {
  // A simplified version of clsx + twMerge since npm install failed on your machine
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ");
}
