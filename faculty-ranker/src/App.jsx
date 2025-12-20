import { Routes, Route } from "react-router-dom";

// Pages
import FacultyListPage from "./FacultyListPage";
import FacultyPage from "./FacultyPage";

import AdminPanel from './AdminPanel'

export default function App() {

  return (
    <Routes>
      {/* List page at root */}
      <Route
        path="/"
        element={
          <FacultyListPage />
        }
      />

      {/* Per-faculty page */}
      <Route
        path="/faculty/:id"
        element={<FacultyPage />}
      />
      <Route path="/admin" element={<AdminPanel />} />
      {/* Fallback (catch-all) */}
      <Route
        path="*"
        element={<div style={{ padding: 40, fontFamily: "system-ui" }}>Page not found</div>}
      />
      
    </Routes>
  );
}
