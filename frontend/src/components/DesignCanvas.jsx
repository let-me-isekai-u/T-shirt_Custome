import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, Group, Image, Path } from "fabric";

// ---- Shared geometry ----

// Normalized 100x120
const SHIRT_PATH = `
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

function applyCommonControls(obj) {
  if (!obj || typeof obj.set !== "function") return;
  obj.set({
    cornerStyle: "circle",
    cornerColor: "#2563eb",
    borderColor: "#2563eb",
    transparentCorners: false,
    padding: 6,
  });
}

function isEditableObject(obj) {
  if (!obj) return false;
  const t = obj.type;
  return t === "image";
}

/**
 * Build:
 * - shirtUnder (shadow + fill)
 * - shirtOver (stroke + neck)
 * - shirtFill ref for color updates
 * - shirtClipPath for masking designs to the shirt shape (stage coords)
 */
function buildShirtLayers(box, color) {
  const baseW = 100;
  const baseH = 120;
  const scaleX = box.w / baseW;
  const scaleY = box.h / baseH;

  const shirtFill = new Path(SHIRT_PATH, {
    left: 0,
    top: 0,
    fill: color,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  const shadow = new Path(SHIRT_PATH, {
    left: 1.2,
    top: 1.2,
    fill: "#000",
    opacity: 0.1,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  const shirtStroke = new Path(SHIRT_PATH, {
    left: 0,
    top: 0,
    fill: "",
    stroke: "#e5e7eb",
    strokeWidth: 1.4,
    strokeLineJoin: "round",
    opacity: 1,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });


  const commonGroupProps = {
    left: box.x,
    top: box.y,
    scaleX,
    scaleY,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  };

  const shirtUnder = new Group([shadow, shirtFill], commonGroupProps);
  const shirtOver = new Group([shirtStroke], commonGroupProps);

  // Clip path in STAGE coords (absolutePositioned)
  const shirtClipPath = new Path(SHIRT_PATH, {
    left: box.x,
    top: box.y,
    scaleX,
    scaleY,
    originX: "left",
    originY: "top",
    absolutePositioned: true,
  });

  return { shirtUnder, shirtOver, shirtFill, shirtClipPath };
}

function restack(canvas, { shirtOver }) {
  if (!canvas) return;
  if (shirtOver && typeof canvas.bringObjectToFront === "function") {
    canvas.bringObjectToFront(shirtOver);
  }
  canvas.requestRenderAll();
}

const DesignCanvas = forwardRef(function DesignCanvas(
  { imageSrc, onChangeTransform, onSelectionChange, shirtColor = "#111827" },
  ref
) {
  const stageWidth = 420;
  const stageHeight = 520;
  const shirtWidth = 340;
  const shirtHeight = 480;

  const shirtBox = useMemo(
    () => ({
      x: (stageWidth - shirtWidth) / 2,
      y: 20,
      w: shirtWidth,
      h: shirtHeight,
    }),
    [stageWidth, shirtWidth, shirtHeight]
  );

  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);

  const imageRef = useRef(null);
  const shirtFillRef = useRef(null);
  const shirtOverRef = useRef(null);
  const shirtClipPathRef = useRef(null);

  // keep latest callbacks without re-initting canvas
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onChangeTransformRef = useRef(onChangeTransform);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);
  useEffect(() => {
    onChangeTransformRef.current = onChangeTransform;
  }, [onChangeTransform]);

  const [canvasReady, setCanvasReady] = useState(false);

  useImperativeHandle(ref, () => ({
    deleteSelected() {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const active = canvas.getActiveObject();
      if (!active) return;
      if (!isEditableObject(active)) return;

      canvas.remove(active);
      canvas.discardActiveObject();
      restack(canvas, { shirtOver: shirtOverRef.current });
    },

    bringForward() {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const active = canvas.getActiveObject();
      if (!active || !isEditableObject(active)) return;

      if (typeof canvas.bringObjectForward === "function") {
        canvas.bringObjectForward(active);
      }
      restack(canvas, { shirtOver: shirtOverRef.current });
    },

    sendBack() {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const active = canvas.getActiveObject();
      if (!active || !isEditableObject(active)) return;

      if (typeof canvas.sendObjectBackwards === "function") {
        canvas.sendObjectBackwards(active);
      }
      restack(canvas, { shirtOver: shirtOverRef.current });
    },
  }));

  // INIT canvas only once
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: stageWidth,
      height: stageHeight,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });

    fabricRef.current = canvas;
    setCanvasReady(true);

    // shirt layers + shirt clipPath (mask)
    const { shirtUnder, shirtOver, shirtFill, shirtClipPath } = buildShirtLayers(
      shirtBox,
      shirtColor
    );
    shirtFillRef.current = shirtFill;
    shirtOverRef.current = shirtOver;
    shirtClipPathRef.current = shirtClipPath;

    // Layer order: under -> design image(s) -> over
    canvas.add(shirtUnder);
    canvas.add(shirtOver);

    const emitSelection = () => {
      const active = canvas.getActiveObject();
      const cb = onSelectionChangeRef.current;
      if (!cb) return;

      if (!active) return cb({ type: "none" });
      if (active.type === "image") return cb({ type: "image" });
      return cb({ type: "other" });
    };

    const emitImageTransform = () => {
      const cb = onChangeTransformRef.current;
      if (!cb || !imageRef.current) return;
      const img = imageRef.current;
      cb({
        x: img.left,
        y: img.top,
        scaleX: img.scaleX,
        scaleY: img.scaleY,
        rotation: img.angle || 0,
      });
    };

    canvas.on("selection:created", emitSelection);
    canvas.on("selection:updated", emitSelection);
    canvas.on("selection:cleared", emitSelection);

    canvas.on("object:modified", emitImageTransform);
    canvas.on("object:moving", emitImageTransform);
    canvas.on("object:scaling", emitImageTransform);
    canvas.on("object:rotating", emitImageTransform);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      imageRef.current = null;
      shirtFillRef.current = null;
      shirtOverRef.current = null;
      shirtClipPathRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update shirt color
  useEffect(() => {
    if (shirtFillRef.current && typeof shirtFillRef.current.set === "function") {
      shirtFillRef.current.set({ fill: shirtColor });
      fabricRef.current?.requestRenderAll();
    }
  }, [shirtColor]);

  // load/replace image (race-safe)
  const loadReqIdRef = useRef(0);
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvasReady || !canvas) return;

    loadReqIdRef.current += 1;
    const reqId = loadReqIdRef.current;

    if (!imageSrc) {
      if (imageRef.current) {
        canvas.remove(imageRef.current);
        imageRef.current = null;
        restack(canvas, { shirtOver: shirtOverRef.current });
      }
      return;
    }

    const isBlobUrl = imageSrc.startsWith("blob:");
    const isDataUrl = imageSrc.startsWith("data:");
    const loadOptions =
      isBlobUrl || isDataUrl ? undefined : { crossOrigin: "anonymous" };

    Image.fromURL(imageSrc, loadOptions)
      .then((img) => {
        if (reqId !== loadReqIdRef.current) return;
        const canvasNow = fabricRef.current;
        const shirtClipPath = shirtClipPathRef.current;
        if (!canvasNow || !shirtClipPath) return;

        if (imageRef.current) {
          canvasNow.remove(imageRef.current);
        }

        if (!img.width || !img.height) return;
        const initTargetW = shirtBox.w * 0.34;
        const initTargetH = shirtBox.h * 0.34;
        const scale = Math.min(initTargetW / img.width, initTargetH / img.height);

        img.set({
          left: shirtBox.x + shirtBox.w / 2,
          top: shirtBox.y + shirtBox.h * 0.56,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          angle: 0,
          selectable: true,
          evented: true,
          hasControls: true,
          clipPath: shirtClipPath,
        });

        applyCommonControls(img);

        imageRef.current = img;
        canvasNow.add(img);
        canvasNow.setActiveObject(img);

        restack(canvasNow, { shirtOver: shirtOverRef.current });
      })
      .catch((err) => {
        console.error("Image load error:", err);
      });
  }, [imageSrc, canvasReady]);

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
      <canvas ref={canvasElRef} width={stageWidth} height={stageHeight} />
    </div>
  );
});

export default DesignCanvas;
