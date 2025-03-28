import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import Login from './pages/Login';
import WorkflowList from './pages/WorkflowList';
import WorkflowEditor from './pages/WorkflowEditor';
import PrivateRoute from './components/PrivateRoute';
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
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
      </AuthProvider>
    </Router>
  );
}

export default App;
