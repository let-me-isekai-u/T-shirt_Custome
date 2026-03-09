import { useMemo } from "react";
import { Link } from "react-router-dom";

export default function TShirtListPage() {
  // Tạm thời fake data để test flow. Sau đó thay bằng fetch API như đang làm.
  const tshirts = useMemo(
    () => [
      { _id: "t1", name: "Basic Tee", price: 199000, color: "black", size: "L" },
      { _id: "t2", name: "Classic Tee", price: 249000, color: "white", size: "M" },
    ],
    []
  );

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, Arial" }}>
      <h2>TShirts</h2>

      <div style={{ display: "grid", gap: 12 }}>
        {tshirts.map((t) => (
          <div
            key={t._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{t.name}</div>
              <div>Price: {t.price}</div>
              <div>Color: {t.color} — Size: {t.size}</div>
            </div>

            <Link to={`/design/new?tshirtId=${encodeURIComponent(t._id)}`}>
              Design →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}