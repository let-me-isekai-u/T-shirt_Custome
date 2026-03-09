import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TShirtListPage from "./pages/TShirtListPage";
import DesignNewPage from "./pages/DesignNewPage";
// import DesignEditPage from "./pages/DesignEditPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tshirts" replace />} />
        <Route path="/tshirts" element={<TShirtListPage />} />
        <Route path="/design/new" element={<DesignNewPage />} />
        {/* Step sau mới làm */}
        {/* <Route path="/design/:designId" element={<DesignEditPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}