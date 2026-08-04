import type { ReactNode } from "react";

export function PublicScenePanel({
  active,
  children,
  className,
  enhanced,
  id,
  label,
  labelledBy,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
  enhanced: boolean;
  id: string;
  label: string;
  labelledBy: string;
}) {
  return (
    <section
      className={className}
      id={id}
      role={enhanced ? "tabpanel" : "region"}
      aria-hidden={active ? undefined : true}
      aria-label={enhanced ? undefined : label}
      aria-labelledby={enhanced ? labelledBy : undefined}
      data-active={active ? "true" : "false"}
      inert={active ? undefined : true}
      tabIndex={enhanced && active ? 0 : -1}
    >
      {children}
    </section>
  );
}
