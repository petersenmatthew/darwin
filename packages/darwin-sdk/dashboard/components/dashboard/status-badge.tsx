import { cn } from "@/lib/utils";

type Status = "running" | "completed" | "error" | "cancelled" | "active" | "inactive" | "pending" | "initializing";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  running: {
    label: "Running",
    className: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  },
  completed: {
    label: "Completed",
    className: "bg-success/20 text-success border-success/30",
  },
  error: {
    label: "Error",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
  active: {
    label: "Active",
    className: "bg-success/20 text-success border-success/30",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-border",
  },
  pending: {
    label: "Pending",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  initializing: {
    label: "Initializing",
    className: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border",
        config.className,
        status === "running" && "animate-pulse",
        className
      )}
    >
      {status === "running" && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {config.label}
    </span>
  );
}
