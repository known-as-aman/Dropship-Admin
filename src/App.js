import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css"
import Admin from "./layouts/admin";
import Auth from "./layouts/auth";

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<Admin />} />
      <Route path="/auth/login" element={<Auth />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;
