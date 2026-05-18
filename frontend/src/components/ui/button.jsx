import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}) {
  const variants = {
    default: "bg-navy text-navy-foreground hover:bg-navy-hover",
    outline: "border border-border bg-transparent hover:bg-muted",
    ghost: "hover:bg-muted text-foreground",
    amber: "bg-amber text-amber-foreground hover:bg-amber/90",
  };
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-9 px-3 text-sm",
    icon: "h-10 w-10",
  };
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
