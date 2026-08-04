import type { KeyboardEvent, ReactNode, Ref } from "react";

export function PublicSceneTab({
  children,
  className,
  controlsId,
  id,
  isSelected,
  label,
  onActivate,
  onKeyDown,
  tabRef,
}: {
  children: ReactNode;
  className?: string;
  controlsId: string;
  id: string;
  isSelected: boolean;
  label: string;
  onActivate: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  tabRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={tabRef}
      className={className}
      id={id}
      type="button"
      role="tab"
      aria-label={label}
      aria-controls={controlsId}
      aria-selected={isSelected}
      data-selected={isSelected ? "true" : "false"}
      tabIndex={isSelected ? 0 : -1}
      onClick={onActivate}
      onKeyDown={onKeyDown}
    >
      {children}
    </button>
  );
}
