import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Group } from "react-konva";
import TShirtMockup, { getDefaultPrintArea } from "./TShirtMockup";

// load HTML image object from src (ObjectURL/base64/http...)
function useHtmlImage(src) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.onerror = (e) => console.log("image load error", e);
    img.src = src;
  }, [src]);

  return image;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function DesignCanvas({ imageSrc, onChangeTransform }) {
  const stageWidth = 420;
  const stageHeight = 520;

  // shirt position on the stage
  const shirtBox = useMemo(
    () => ({
      x: 40,
      y: 20,
      w: 340,
      h: 480,
    }),
    []
  );

  // print area is a vertical rectangle inside the shirt
  const printArea = useMemo(() => getDefaultPrintArea(shirtBox), [shirtBox]);

  const img = useHtmlImage(imageSrc);

  const imageRef = useRef(null);
  const trRef = useRef(null);

  // keep overlay in STAGE coordinates (simple & stable)
  const [transform, setTransform] = useState({
    x: printArea.x + printArea.w / 2,
    y: printArea.y + printArea.h / 2,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });

  // reset when new image loaded
  useEffect(() => {
    if (!img) return;
    setTransform({
      x: printArea.x + printArea.w / 2,
      y: printArea.y + printArea.h / 2,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    });
  }, [img, printArea.x, printArea.y, printArea.w, printArea.h]);

  // attach transformer
  useEffect(() => {
    if (!img) return;
    if (!trRef.current || !imageRef.current) return;

    trRef.current.nodes([imageRef.current]);
    trRef.current.getLayer()?.batchDraw();
  }, [img]);

  function emit(t) {
    setTransform(t);
    onChangeTransform?.(t);
  }

  function clampToPrintArea(next) {
    if (!img) return next;

    // rendered size ignoring rotation
    const renderedW = img.width * next.scaleX;
    const renderedH = img.height * next.scaleY;

    // because we use offset center
    const halfW = renderedW / 2;
    const halfH = renderedH / 2;

    const minX = printArea.x + halfW;
    const maxX = printArea.x + printArea.w - halfW;
    const minY = printArea.y + halfH;
    const maxY = printArea.y + printArea.h - halfH;

    const x =
      minX <= maxX ? clamp(next.x, minX, maxX) : printArea.x + printArea.w / 2;
    const y =
      minY <= maxY ? clamp(next.y, minY, maxY) : printArea.y + printArea.h / 2;

    return { ...next, x, y };
  }

  function selectImage() {
    if (!trRef.current || !imageRef.current) return;
    trRef.current.nodes([imageRef.current]);
    trRef.current.getLayer()?.batchDraw();
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        display: "inline-block",
        padding: 12,
        background: "#fafafa",
      }}
    >
      <Stage
        width={stageWidth}
        height={stageHeight}
        onMouseDown={(e) => {
          // click outside image => deselect
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty && trRef.current) {
            trRef.current.nodes([]);
            trRef.current.getLayer()?.batchDraw();
          }
        }}
      >
        <Layer>
          {/* background "paper" */}
          <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill="#ffffff" />

          {/* shirt vector + print area outline */}
          <TShirtMockup box={shirtBox} color="#111827" showPrintArea />

          {/* clip overlay inside print area */}
          <Group
            clipX={printArea.x}
            clipY={printArea.y}
            clipWidth={printArea.w}
            clipHeight={printArea.h}
          >
            {img && (
              <KonvaImage
                ref={imageRef}
                image={img}
                x={transform.x}
                y={transform.y}
                rotation={transform.rotation}
                scaleX={transform.scaleX}
                scaleY={transform.scaleY}
                offsetX={img.width / 2}
                offsetY={img.height / 2}
                draggable
                onClick={selectImage}
                onTap={selectImage}
                onDragMove={(e) => {
                  const node = e.target;
                  const next = clampToPrintArea({
                    ...transform,
                    x: node.x(),
                    y: node.y(),
                  });
                  node.x(next.x);
                  node.y(next.y);
                  emit(next);
                }}
                onDragEnd={(e) => {
                  const node = e.target;
                  const next = clampToPrintArea({
                    ...transform,
                    x: node.x(),
                    y: node.y(),
                  });
                  node.x(next.x);
                  node.y(next.y);
                  emit(next);
                }}
                onTransformEnd={() => {
                  const node = imageRef.current;
                  if (!node) return;

                  const nextScaleX = Math.max(0.1, node.scaleX());
                  const nextScaleY = Math.max(0.1, node.scaleY());

                  const next = clampToPrintArea({
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    scaleX: nextScaleX,
                    scaleY: nextScaleY,
                  });

                  node.x(next.x);
                  node.y(next.y);
                  emit(next);
                }}
              />
            )}
          </Group>

          {/* transformer OUTSIDE clip group => handles always visible & resizable */}
          {img && (
            <Transformer
              ref={trRef}
              rotateEnabled
              enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
              // optional: keep ratio when resizing (often nicer for photos)
              keepRatio={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}