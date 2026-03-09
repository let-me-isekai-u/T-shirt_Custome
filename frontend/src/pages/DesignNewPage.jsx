import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DesignCanvas, { FONT_OPTIONS } from "../components/DesignCanvas";

const SHIRT_COLORS = [
  "#111827",
  "#f97316",
  "#ef4444",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ffffff",
  "#e5e7eb",
  "#94a3b8",
  "#0f172a",
];

export default function DesignNewPage() {
  const [params] = useSearchParams();
  const tshirtId = params.get("tshirtId") || "";

  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [shirtColor, setShirtColor] = useState("#111827");

  const [textValue, setTextValue] = useState("Your text");
  const [fontFamily, setFontFamily] = useState("Poppins");
  const [fontSize, setFontSize] = useState(36);
  const [fontColor, setFontColor] = useState("#111827");
  const [activeType, setActiveType] = useState("none");
  const [showTextTools, setShowTextTools] = useState(true);

  const canvasRef = useRef(null);

  const title = useMemo(() => {
    return tshirtId ? `Design (tshirtId=${tshirtId})` : "Design";
  }, [tshirtId]);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);

    const url = URL.createObjectURL(f);
    setImageSrc(url);
  }

  const isTextSelected = activeType === "text";

  return (
    <div style={{ padding: 18, fontFamily: "Poppins, system-ui, Arial" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/tshirts">← Back</Link>
        <h2 style={{ margin: 0 }}>{title}</h2>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "220px minmax(0, 1fr) 220px",
          gap: 16,
          alignItems: "start",
        }}
      >
        <aside
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            borderRadius: 14,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 520,
          }}
        >
          <div style={{ fontWeight: 600 }}>Tools</div>

          <label
            style={{
              border: "1px solid #334155",
              borderRadius: 10,
              padding: "10px 12px",
              cursor: "pointer",
              display: "inline-block",
              background: "#111827",
              textAlign: "center",
            }}
          >
            Upload image
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={onPickFile}
              style={{ display: "none" }}
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setFile(null);
              setImageSrc("");
            }}
            disabled={!file}
            style={{
              borderRadius: 10,
              border: "1px solid #334155",
              padding: "10px 12px",
              background: file ? "#1e293b" : "#0b1220",
              color: file ? "#e2e8f0" : "#64748b",
              cursor: file ? "pointer" : "not-allowed",
            }}
          >
            Clear image
          </button>

          <button
            type="button"
            onClick={() => setShowTextTools((prev) => !prev)}
            style={{
              borderRadius: 10,
              border: "1px solid #334155",
              padding: "10px 12px",
              background: showTextTools ? "#2563eb" : "#1e293b",
              color: "#e2e8f0",
              textAlign: "left",
            }}
          >
            Add text
          </button>

          {showTextTools && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "#111827",
                borderRadius: 12,
                padding: 12,
                border: "1px solid #1f2937",
              }}
            >
              <input
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Nhập chữ..."
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#e2e8f0",
                }}
              />

              <select
                value={fontFamily}
                onChange={(e) => {
                  const next = e.target.value;
                  setFontFamily(next);
                  canvasRef.current?.setActiveTextStyle({ fontFamily: next });
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#e2e8f0",
                }}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={fontSize}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setFontSize(next);
                    canvasRef.current?.setActiveTextStyle({ fontSize: next });
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#e2e8f0",
                  }}
                />
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => {
                    const next = e.target.value;
                    setFontColor(next);
                    canvasRef.current?.setActiveTextStyle({ fill: next });
                  }}
                  style={{
                    height: 38,
                    width: 48,
                    padding: 0,
                    borderRadius: 8,
                    border: "1px solid #334155",
                    background: "#0f172a",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  canvasRef.current?.addText({
                    text: textValue,
                    fontFamily,
                    fontSize,
                    fill: fontColor,
                  })
                }
                style={{
                  borderRadius: 10,
                  border: "1px solid #334155",
                  padding: "10px 12px",
                  background: "#22c55e",
                  color: "#0f172a",
                  fontWeight: 600,
                }}
              >
                Add text to canvas
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => canvasRef.current?.deleteSelected()}
                  disabled={activeType === "none"}
                  style={{
                    borderRadius: 10,
                    border: "1px solid #334155",
                    padding: "8px 12px",
                    background: activeType === "none" ? "#0b1220" : "#1e293b",
                    color: activeType === "none" ? "#64748b" : "#e2e8f0",
                    cursor: activeType === "none" ? "not-allowed" : "pointer",
                  }}
                >
                  Delete selected
                </button>
                <button
                  type="button"
                  onClick={() => canvasRef.current?.bringForward()}
                  disabled={activeType === "none"}
                  style={{
                    borderRadius: 10,
                    border: "1px solid #334155",
                    padding: "8px 12px",
                    background: activeType === "none" ? "#0b1220" : "#1e293b",
                    color: activeType === "none" ? "#64748b" : "#e2e8f0",
                    cursor: activeType === "none" ? "not-allowed" : "pointer",
                  }}
                >
                  Bring forward
                </button>
                <button
                  type="button"
                  onClick={() => canvasRef.current?.sendBack()}
                  disabled={activeType === "none"}
                  style={{
                    borderRadius: 10,
                    border: "1px solid #334155",
                    padding: "8px 12px",
                    background: activeType === "none" ? "#0b1220" : "#1e293b",
                    color: activeType === "none" ? "#64748b" : "#e2e8f0",
                    cursor: activeType === "none" ? "not-allowed" : "pointer",
                  }}
                >
                  Send back
                </button>
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Mẹo: double‑click chữ để sửa trực tiếp.
          </div>
        </aside>

        <main style={{ display: "flex", justifyContent: "center" }}>
          <DesignCanvas
            ref={canvasRef}
            imageSrc={imageSrc}
            shirtColor={shirtColor}
            onSelectionChange={(info) => {
              setActiveType(info.type);
              if (info.type === "text") {
                setFontFamily(info.fontFamily);
                setFontSize(info.fontSize);
                setFontColor(info.fill);
              }
            }}
            onChangeTransform={(t) => {
              console.log("transform:", t);
            }}
          />
        </main>

        <aside
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            borderRadius: 14,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 520,
          }}
        >
          <div style={{ fontWeight: 600 }}>T-Shirt color</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}
          >
            {SHIRT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setShirtColor(color)}
                title={color}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: 12,
                  border: color === shirtColor ? "2px solid #38bdf8" : "1px solid #334155",
                  background: color,
                  cursor: "pointer",
                  boxShadow:
                    color === "#ffffff" ? "0 0 0 1px #334155 inset" : "none",
                }}
              />
            ))}
          </div>
        </aside>
      </div>

      <p style={{ marginTop: 12, color: "#94a3b8" }}>
        MVP offline: bạn có thể drag/resize/rotate ảnh và thêm chữ. Transform của ảnh sẽ log
        trong console.
      </p>
    </div>
  );
}
