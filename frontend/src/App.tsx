import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Layout/Navbar";
import { ProtectedRoute } from "./components/Layout/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { ClassList } from "./pages/ClassList";
import { CodeEditor } from "./pages/CodeEditor";
import { MyTasks } from "./pages/MyTasks";
import { MyClasses } from "./pages/MyClasses";
import { TaskList } from "./pages/TaskList";
import { ClassDetail } from "./pages/ClassDetail";
import { SubmissionList } from "./pages/SubmissionList";
import { SubmissionDetail } from "./pages/SubmissionDetail";
import { AdminDashboard } from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute requiredRole="teacher">
                <ClassList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:id"
            element={
              <ProtectedRoute requiredRole="teacher">
                <ClassDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TaskList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-classes"
            element={
              <ProtectedRoute requiredRole="student">
                <MyClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tasks"
            element={
              <ProtectedRoute requiredRole="student">
                <MyTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:taskId/editor"
            element={
              <ProtectedRoute requiredRole="student">
                <CodeEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <SubmissionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions/classes/:classId"
            element={
              <ProtectedRoute requiredRole="teacher">
                <SubmissionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions/:id"
            element={
              <ProtectedRoute>
                <SubmissionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
