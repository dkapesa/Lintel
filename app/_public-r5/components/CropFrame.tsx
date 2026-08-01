import Image from "next/image";
import type { CSSProperties } from "react";

/* Non-destructive CSS crop, in the spirit of the accepted Scene C crop
   (R5B1_SCENE_RESOLUTION_ADDENDUM.md): the source file is never edited,
   resized or re-encoded. A rectangle in source-pixel space is revealed
   through an overflow-hidden window using width and margin percentages,
   which is fully responsive because CSS margin percentages resolve against
   the containing block's inline size on both axes — the same axis the
   width percentage already uses, so horizontal and vertical offsets stay
   mathematically exact at every viewport width without JavaScript. */

export type CropRect = { left: number; top: number; right: number; bottom: number };

export function CropFrame({
  src,
  alt,
  fullWidth,
  fullHeight,
  rect,
  className,
  priority,
}: {
  src: string;
  alt: string;
  fullWidth: number;
  fullHeight: number;
  rect: CropRect;
  className?: string;
  priority?: boolean;
}) {
  const cropWidth = rect.right - rect.left;
  const cropHeight = rect.bottom - rect.top;
  const widthPct = (fullWidth / cropWidth) * 100;
  const marginLeftPct = -(rect.left / cropWidth) * 100;
  const marginTopPct = -(rect.top / cropWidth) * 100;

  const imgStyle: CSSProperties = {
    width: `${widthPct}%`,
    maxWidth: "none",
    height: "auto",
    marginLeft: `${marginLeftPct}%`,
    marginTop: `${marginTopPct}%`,
    display: "block",
  };

  return (
    <div className={className} style={{ aspectRatio: `${cropWidth} / ${cropHeight}` }}>
      <Image src={src} alt={alt} width={fullWidth} height={fullHeight} style={imgStyle} priority={priority} />
    </div>
  );
}

/** An uncropped scene at its full captured frame — Scenes A, D, E, F and the
    mobile captures. Stable aspect-ratio box, no layout shift on load. */
export function FullScene({
  src,
  alt,
  width,
  height,
  className,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={className}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
}
