import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DesignCanvas from "../components/DesignCanvas";

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

  const [activeType, setActiveType] = useState("none");

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
        </aside>

        <main style={{ display: "flex", justifyContent: "center" }}>
          <DesignCanvas
            ref={canvasRef}
            imageSrc={imageSrc}
            shirtColor={shirtColor}
            onSelectionChange={(info) => {
              setActiveType(info.type);
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
                  border:
                    color === shirtColor ? "2px solid #38bdf8" : "1px solid #334155",
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
    </div>
  );
}
