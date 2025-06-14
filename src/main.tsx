import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./tailwind.css";
import Dashboard from "./pages/Dashboard";
import QuestionForm from "./pages/QuestionForm";
import ApprovalList from "./pages/ApprovalList";
import MachineList from "./pages/MachineList";
import MaintenanceSchedule from "./pages/MaintenanceSchedule";
import NotificationPage from "./pages/NotificationPage";
import MachineStatus from "./pages/MachineStatus";
import QRAccessPage from "./pages/QRAccessPage";
import Navbar from "./components/navbar";
import LoginPage from "./pages/login";
import ReviewMaintenance from "./pages/ReviewMaintenance";
import { AuthProvider } from "./contexts/AuthContext";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { ProtectedRoute } from "./components/protectedRoute";
import { UserRole } from "./types/user";
import MachineDetailPage from "./pages/MachineDetailPage";
import AppWrapper from "./components/appWrapper";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/*" element={<AppWrapper />}>
              <Route path="qr/:machineId" element={<QRAccessPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
              <Route index element={<Navigate to="/dashboard" />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="question"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      UserRole.ADMIN,
                      UserRole.INSTRUCTOR,
                      UserRole.STUDENT,
                    ]}
                  >
                    <QuestionForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="question/:machineId"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      UserRole.ADMIN,
                      UserRole.INSTRUCTOR,
                      UserRole.STUDENT,
                    ]}
                  >
                    <QuestionForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="approval"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <ApprovalList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="machines"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <MachineList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="schedule"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <MaintenanceSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="notifications"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <NotificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="status"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <MachineStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="approval/:id"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <ReviewMaintenance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="machines/:id"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <MachineDetailPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
