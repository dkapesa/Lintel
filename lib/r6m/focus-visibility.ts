export type RenderedElement = Readonly<{
  isConnected: boolean;
  checkVisibility?: (options?: {
    checkOpacity?: boolean;
    checkVisibilityCSS?: boolean;
  }) => boolean;
  getClientRects: () => ArrayLike<Readonly<{ width: number; height: number }>>;
}>;

/** Rendered validity is stricter than connectedness and works for zero-track panes. */
export function isElementRendered(element: RenderedElement | null): boolean {
  if (!element?.isConnected) return false;
  if (typeof element.checkVisibility === "function") {
    try {
      if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    } catch {
      if (!element.checkVisibility()) return false;
    }
  }
  const rects = element.getClientRects();
  for (let index = 0; index < rects.length; index += 1) {
    const rect = rects[index];
    if (rect && rect.width > 0 && rect.height > 0) return true;
  }
  return false;
}
