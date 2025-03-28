import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import WorkflowList from "./pages/WorkflowList";
import Login from "./pages/Login";
import WorkflowEditor from "./pages/WorkflowEditor";
import AuthProvider from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/workflows"
            element={
              <PrivateRoute>
                <WorkflowList />
              </PrivateRoute>
            }
          />
          <Route
            path="/editor/:id?"
            element={
              <PrivateRoute>
                <WorkflowEditor />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/workflows" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
