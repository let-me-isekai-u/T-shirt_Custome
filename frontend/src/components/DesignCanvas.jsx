import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Canvas, Group, IText, Image, Path, Rect } from "fabric";

export const FONT_OPTIONS = [
  "Poppins",
  "Roboto",
  "Montserrat",
  "Oswald",
  "Playfair Display",
  "Merriweather",
  "Bebas Neue",
  "Lobster",
  "Pacifico",
  "Lora",
  "Raleway",
  "Nunito",
  "Abril Fatface",
  "Anton",
  "Josefin Sans",
  "Orbitron",
  "Quicksand",
  "Source Sans 3",
  "Rubik",
  "Arial",
  "Helvetica",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Impact",
  "Comic Sans MS",
];

function getDefaultPrintArea(box) {
  // The shirt body (torso) starts at ~28% and ends at ~86% of box height.
  // Using y = 30% gives a comfortable margin above the chest area.
  const w = box.w * 0.46;
  const h = box.h * 0.50;
  return {
    x: box.x + (box.w - w) / 2,
    y: box.y + box.h * 0.30,
    w,
    h,
  };
}

function buildShirtGroup(box, color) {
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

  const baseW = 100;
  const baseH = 120;
  const scaleX = box.w / baseW;
  const scaleY = box.h / baseH;

  const shirt = new Path(shirtPath, {
    fill: color,
    stroke: "#e5e7eb",
    strokeWidth: 1.4,
    strokeLineJoin: "round",
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  // Align shirt paths so their bounding box starts at (0, 0).
  shirt.setCoords();
  const shirtBounds = shirt.getBoundingRect(true, true);
  const offsetX = -shirtBounds.left;
  const offsetY = -shirtBounds.top;
  shirt.set({ left: offsetX, top: offsetY });

  const shadow = new Path(shirtPath, {
    left: offsetX + 1.2,
    top: offsetY + 1.2,
    fill: "#000",
    opacity: 0.1,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  const neckFill = new Path(neckPath, {
    left: offsetX,
    top: offsetY,
    fill: "#f9fafb",
    opacity: 0.95,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  const neckStroke = new Path(neckPath, {
    left: offsetX,
    top: offsetY,
    fill: "",
    stroke: "#e5e7eb",
    strokeWidth: 1.2,
    opacity: 0.9,
    strokeLineJoin: "round",
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  const group = new Group([shadow, shirt, neckFill, neckStroke], {
    left: box.x,
    top: box.y,
    scaleX,
    scaleY,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  return { group, shirt };
}

function applyCommonControls(obj) {
  obj.set({
    cornerStyle: "circle",
    cornerColor: "#2563eb",
    borderColor: "#2563eb",
    transparentCorners: false,
    padding: 6,
  });
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
    [stageWidth]
  );

  const printArea = useMemo(() => getDefaultPrintArea(shirtBox), [shirtBox]);

  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const imageRef = useRef(null);
  const clipRef = useRef(null);
  const printGuideRef = useRef(null);
  const shirtRef = useRef(null);
  // Keep initial shirt color in a ref so canvas isn't rebuilt when color changes.
  // The separate shirtColor effect below handles live color updates.
  const shirtColorRef = useRef(shirtColor);
  // Store callbacks in refs so the canvas init effect doesn't re-run
  // every time the parent re-renders and creates new callback references.
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onChangeTransformRef = useRef(onChangeTransform);
  const [canvasReady, setCanvasReady] = useState(false);

  // Update callback refs on every render to stay in sync with the latest props.
  onSelectionChangeRef.current = onSelectionChange;
  onChangeTransformRef.current = onChangeTransform;

  useImperativeHandle(ref, () => ({
    addText({ text, fontFamily, fontSize, fill }) {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const textObj = new IText(text || "Text", {
        left: printArea.x + printArea.w / 2,
        top: printArea.y + printArea.h / 2,
        originX: "center",
        originY: "center",
        fontFamily,
        fontSize,
        fill,
        editable: true,
        clipPath: clipRef.current || null,
      });

      applyCommonControls(textObj);

      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.requestRenderAll();
    },
    deleteSelected() {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    },
    bringForward() {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      canvas.bringForward(active);
      canvas.requestRenderAll();
    },
    sendBack() {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      canvas.sendBackwards(active);
      canvas.requestRenderAll();
    },
    setActiveTextStyle({ fontFamily, fontSize, fill }) {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      if (active.type === "i-text" || active.type === "textbox" || active.type === "text") {
        active.set({
          fontFamily: fontFamily ?? active.fontFamily,
          fontSize: Number.isFinite(fontSize) ? fontSize : active.fontSize,
          fill: fill ?? active.fill,
        });
        canvas.requestRenderAll();
      }
    },
  }));

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

    const { group: shirtGroup, shirt } = buildShirtGroup(shirtBox, shirtColorRef.current);
    shirtRef.current = shirt;
    canvas.add(shirtGroup);

    const printGuide = new Rect({
      left: printArea.x,
      top: printArea.y,
      originX: "left",
      originY: "top",
      width: printArea.w,
      height: printArea.h,
      fill: "",
      stroke: "#60a5fa",
      strokeWidth: 1.2,
      strokeDashArray: [8, 6],
      rx: 10,
      ry: 10,
      selectable: false,
      evented: false,
    });

    printGuideRef.current = printGuide;
    canvas.add(printGuide);

    const clipRect = new Rect({
      left: printArea.x,
      top: printArea.y,
      originX: "left",
      originY: "top",
      width: printArea.w,
      height: printArea.h,
      absolutePositioned: true,
    });

    clipRef.current = clipRect;

    const emitSelection = () => {
      const active = canvas.getActiveObject();
      if (!onSelectionChangeRef.current) return;
      if (!active) {
        onSelectionChangeRef.current({ type: "none" });
        return;
      }
      if (active.type === "i-text" || active.type === "textbox" || active.type === "text") {
        onSelectionChangeRef.current({
          type: "text",
          fontFamily: active.fontFamily || "Poppins",
          fontSize: Math.round(active.fontSize || 36),
          fill: active.fill || "#111827",
        });
        return;
      }
      if (active.type === "image") {
        onSelectionChangeRef.current({ type: "image" });
        return;
      }
      onSelectionChangeRef.current({ type: "other" });
    };

    canvas.on("selection:created", emitSelection);
    canvas.on("selection:updated", emitSelection);
    canvas.on("selection:cleared", emitSelection);

    const emitImageTransform = () => {
      if (!onChangeTransformRef.current || !imageRef.current) return;
      const img = imageRef.current;
      onChangeTransformRef.current({
        x: img.left,
        y: img.top,
        scaleX: img.scaleX,
        scaleY: img.scaleY,
        rotation: img.angle || 0,
      });
    };

    canvas.on("object:modified", emitImageTransform);
    canvas.on("object:moving", emitImageTransform);
    canvas.on("object:scaling", emitImageTransform);
    canvas.on("object:rotating", emitImageTransform);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      imageRef.current = null;
      shirtRef.current = null;
    };
  }, [printArea.h, printArea.w, printArea.x, printArea.y, shirtBox]);

  useEffect(() => {
    if (shirtRef.current) {
      shirtRef.current.set({ fill: shirtColor });
      fabricRef.current?.requestRenderAll();
    }
  }, [shirtColor]);

  useEffect(() => {
    if (!canvasReady) return;
    if (!fabricRef.current) return;

    if (!imageSrc) {
      if (imageRef.current && fabricRef.current) {
        fabricRef.current.remove(imageRef.current);
        imageRef.current = null;
        fabricRef.current.requestRenderAll();
      }
      return;
    }

    let cancelled = false;

    const isBlobUrl = imageSrc.startsWith("blob:");
    const isDataUrl = imageSrc.startsWith("data:");
    const loadOptions = isBlobUrl || isDataUrl ? undefined : { crossOrigin: "anonymous" };

    Image.fromURL(imageSrc, loadOptions)
      .then((img) => {
        if (cancelled) return;
        // Always use the latest canvas reference in case it was recreated
        const canvas = fabricRef.current;
        if (!canvas) return;

        if (imageRef.current) {
          canvas.remove(imageRef.current);
        }

        const scale = Math.min(printArea.w / img.width, printArea.h / img.height);
        img.set({
          left: printArea.x + printArea.w / 2,
          top: printArea.y + printArea.h / 2,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          angle: 0,
          selectable: true,
          hasControls: true,
          clipPath: clipRef.current || null,
        });

        applyCommonControls(img);

        imageRef.current = img;
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
      })
      .catch((err) => {
        console.error("Image load error:", err);
      });

    return () => { cancelled = true; };
  }, [imageSrc, printArea.h, printArea.w, printArea.x, printArea.y, canvasReady]);

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
