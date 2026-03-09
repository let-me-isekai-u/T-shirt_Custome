import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DesignCanvas from "../components/DesignCanvas";

export default function DesignNewPage() {
  const [params] = useSearchParams();
  const tshirtId = params.get("tshirtId") || "";

  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState("");

  const title = useMemo(() => {
    return tshirtId ? `Design (tshirtId=${tshirtId})` : "Design";
  }, [tshirtId]);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);

    // Offline MVP: dùng ObjectURL để load vào Konva.
    const url = URL.createObjectURL(f);
    setImageSrc(url);
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, Arial" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/tshirts">← Back</Link>
        <h2 style={{ margin: 0 }}>{title}</h2>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <label
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: "pointer",
            display: "inline-block",
          }}
        >
          Upload image
          <input
            type="file"
            accept="image/*"
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
        >
          Clear
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <DesignCanvas
          imageSrc={imageSrc}
          onChangeTransform={(t) => {
            // t = { x,y,scaleX,scaleY,rotation }
            // MVP: log để thấy data lưu được.
            console.log("transform:", t);
          }}
        />
      </div>

      <p style={{ marginTop: 12, color: "#666" }}>
        MVP offline: bạn có thể drag/resize/rotate ảnh overlay. Transform sẽ log trong console.
      </p>
    </div>
  );
}