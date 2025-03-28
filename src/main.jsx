import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import WorkflowList from "./pages/WorkflowList";
import Login from "./pages/Login";
import WorkflowEditor from "./pages/WorkflowEditor";
import AuthProvider from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/workflows" element={<WorkflowList />} />
          <Route path="/editor/:id?" element={<WorkflowEditor />} />
          <Route path="/" element={<Navigate to="/workflows" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
