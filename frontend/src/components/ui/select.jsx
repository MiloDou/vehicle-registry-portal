import { cn } from "@/lib/utils";

// Select HTML nativo estilizado para mantener simplicidad
export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
