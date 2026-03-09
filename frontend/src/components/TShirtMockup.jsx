import { Group, Path, Rect } from "react-konva";
import { useMemo } from "react";

function getShirtPaths() {
  // Normalized 100x120
  const shirtPath = `
    M 22 10
    C 18 10, 14 12, 11 16
    L 4 28
    C 3 30, 4 33, 7 34
    L 18 38
    L 18 108
    C 18 114, 22 118, 28 118
    L 72 118
    C 78 118, 82 114, 82 108
    L 82 38
    L 93 34
    C 96 33, 97 30, 96 28
    L 89 16
    C 86 12, 82 10, 78 10
    C 72 10, 66 12, 60 16
    C 56 19, 44 19, 40 16
    C 34 12, 28 10, 22 10
    Z
  `;

  const neckPath = `
    M 38 12
    C 40 26, 60 26, 62 12
    C 56 8, 44 8, 38 12
    Z
  `;

  return { shirtPath, neckPath };
}

/**
 * Props:
 * - box: { x,y,w,h } in stage coords
 * - color: shirt fill
 * - showPrintArea: boolean
 * - printArea: { x,y,w,h } in stage coords (optional). If not provided we compute a default.
 */
export default function TShirtMockup({
  box,
  color = "#111827",
  showPrintArea = true,
  printArea,
}) {
  const { shirtPath, neckPath } = useMemo(() => getShirtPaths(), []);
  const baseW = 100;
  const baseH = 120;

  const scaleX = box.w / baseW;
  const scaleY = box.h / baseH;

  // default print area (rect dọc lớn)
  const pa =
    printArea ??
    (() => {
      const paddingX = 22; // in normalized units (100-wide)
      const top = 30;
      const bottom = 18;
      return {
        // convert normalized -> stage
        x: box.x + paddingX * scaleX,
        y: box.y + top * scaleY,
        w: box.w - paddingX * 2 * scaleX,
        h: box.h - (top + bottom) * scaleY,
      };
    })();

  return (
    <>
      {/* Shirt vector */}
      <Group x={box.x} y={box.y} scaleX={scaleX} scaleY={scaleY}>
        {/* subtle shadow */}
        <Path data={shirtPath} x={1.2} y={1.2} fill="#000" opacity={0.10} />
        <Path
          data={shirtPath}
          fill={color}
          stroke="#e5e7eb"
          strokeWidth={1.4}
          lineJoin="round"
        />

        <Path data={neckPath} fill="#f9fafb" opacity={0.95} />
        <Path
          data={neckPath}
          fillEnabled={false}
          stroke="#e5e7eb"
          strokeWidth={1.2}
          opacity={0.9}
          lineJoin="round"
        />
      </Group>

      {/* Optional print area guide */}
      {showPrintArea && (
        <Rect
          x={pa.x}
          y={pa.y}
          width={pa.w}
          height={pa.h}
          stroke="#60a5fa"
          dash={[8, 6]}
          cornerRadius={10}
          opacity={0.9}
        />
      )}
    </>
  );
}

// helper to compute the same default print area outside component (used by DesignCanvas)
export function getDefaultPrintArea(box) {
  const baseW = 100;
  const baseH = 120;
  const scaleX = box.w / baseW;
  const scaleY = box.h / baseH;

  const paddingX = 22;
  const top = 30;
  const bottom = 18;

  return {
    x: box.x + paddingX * scaleX,
    y: box.y + top * scaleY,
    w: box.w - paddingX * 2 * scaleX,
    h: box.h - (top + bottom) * scaleY,
  };
}