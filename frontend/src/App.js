import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { GameProvider } from "./context/GameContext"
import Layout from "./components/layout/Layout"
import TeacherLayout from "./components/layout/TeacherLayout"
import AdminLayout from "./components/layout/AdminLayout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Missions from "./pages/Missions"
import Duels from "./pages/Duels"
import Profile from "./pages/Profile"
import Leaderboard from "./pages/Leaderboard"
import Skills from "./pages/Skills"
import Subjects from "./pages/Subjects"
import TeacherDashboard from "./pages/teacher/TeacherDashboard"
import Students from "./pages/teacher/Students"
import Assignments from "./pages/teacher/Assignments"
import Grading from "./pages/teacher/Grading"
import TeacherProfile from "./pages/teacher/TeacherProfile"
import TeacherSubjects from "./pages/teacher/TeacherSubjects"
import TeacherMissions from "./pages/teacher/TeacherMissions"
import ProfessorRequests from "./pages/admin/ProfessorRequests"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProfessors from "./pages/admin/AdminProfessors"
import AdminSubjects from "./pages/admin/AdminSubjects"
import ProtectedRoute from "./components/common/ProtectedRoute"
import "./styles/global.css"

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Rutas de estudiantes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={["estudiante"]}>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/missions"
                element={
                  <ProtectedRoute allowedRoles={["estudiante"]}>
                    <Layout>
                      <Missions />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/duels"
                element={
                  <ProtectedRoute allowedRoles={["estudiante"]}>
                    <Layout>
                      <Duels />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={["estudiante"]}>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute allowedRoles={["estudiante"]}>
                    <Layout>
                      <Leaderboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skills"
                element={
                  <ProtectedRoute allowedRoles={["estudiante"]}>
                    <Layout>
                      <Skills />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subjects"
                element={
                  <ProtectedRoute allowedRoles={["estudiante"]}>
                    <Layout>
                      <Subjects />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Rutas de profesor */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRoles={["profesor"]}>
                    <TeacherLayout>
                      <TeacherDashboard />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <ProtectedRoute allowedRoles={["profesor"]}>
                    <TeacherLayout>
                      <Students />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <ProtectedRoute allowedRoles={["profesor"]}>
                    <TeacherLayout>
                      <Assignments />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/missions"
                element={
                  <ProtectedRoute allowedRoles={["profesor"]}>
                    <TeacherLayout>
                      <TeacherMissions />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/grading"
                element={
                  <ProtectedRoute allowedRoles={["profesor"]}>
                    <TeacherLayout>
                      <Grading />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/profile"
                element={
                  <ProtectedRoute allowedRoles={["profesor"]}>
                    <TeacherLayout>
                      <TeacherProfile />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/subjects"
                element={
                  <ProtectedRoute allowedRoles={["profesor"]}>
                    <TeacherLayout>
                      <TeacherSubjects />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />

              {/* Rutas de administradores */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/professor-requests"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout>
                      <ProfessorRequests />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/professors"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout>
                      <AdminProfessors />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subjects"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout>
                      <AdminSubjects />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Rutas de profesores */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherLayout>
                      <TeacherDashboard />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherLayout>
                      <Students />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherLayout>
                      <Assignments />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/grading"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherLayout>
                      <Grading />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/profile"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherLayout>
                      <TeacherProfile />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </GameProvider>
    </AuthProvider>
  )
}

export default App
