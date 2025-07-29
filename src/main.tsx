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
import QuestionForm from "./pages/Maintenance/QuestionForm";
import ApprovalList from "./pages/Maintenance/ApprovalList";
import MachineList from "./pages/Machine/MachineList";
import MaintenanceSchedule from "./pages/Maintenance/MaintenanceSchedule";
import NotificationPage from "./pages/NotificationPage";
import MachineStatus from "./pages/Machine/MachineStatus";
import QRAccessPage from "./pages/QR/QRAccessPage";
import MaintenanceSubmissionList from "./pages/Maintenance/MaintenanceList";
import LoginPage from "./pages/User/Login";
import ReviewMaintenance from "./pages/Maintenance/ReviewMaintenance";
import { AuthProvider } from "./contexts/AuthContext";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserRole } from "./types/user";
import MachineDetailPage from "./pages/Machine/MachineDetailPage";
import AppWrapper from "./components/AppWrapper";
import AddEditMachine from "./pages/Machine/AddEditMachine";
import StudentMaintenancePage from "./pages/Maintenance/StudentMaintenanceList";
import MaintenanceQRScanPage from "./pages/QR/MaintenanceQRScanPage";
import UserList from "./pages/User/UserList";
import AddEditUser from "./pages/User/AddEditUser";
import QuestionTemplateList from "./pages/QuestionTemplate/QuestionTemplateList";
import AddEditQuestionTemplate from "./pages/QuestionTemplate/AddEditQuestionTemplate";
import MachineQRScanPage from "./pages/QR/MachineQRScanPage";
import RoleRedirectPage from "./pages/RoleRedirectedPage";
import SectionUnitPerformanceRecap from "./pages/Maintenance/SectionUnitPerformanceRecap";
import YearlyRecapExport from "./pages/Maintenance/YearlyRecapExport";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/*" element={<AppWrapper />}>
              <Route index element={<RoleRedirectPage />} />
              <Route path="qr/:machineId" element={<QRAccessPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
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
              <Route path="question" element={<QuestionForm />} />
              <Route path="question/:machineId" element={<QuestionForm />} />
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
              <Route
                path="maintenaceSubmissionList"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <MaintenanceSubmissionList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="maintenance/yearly-recap-export"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <YearlyRecapExport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="machine/add-machine"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <AddEditMachine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="machine/edit-machine/:machineId"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <AddEditMachine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/my-maintenance"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                    <StudentMaintenancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user/user-list"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <UserList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user/add-user"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <AddEditUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user/edit-user/:userId"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <AddEditUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="question/template-list"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <QuestionTemplateList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="question/add-template"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <AddEditQuestionTemplate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="question/edit-template/:templateId"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <AddEditQuestionTemplate />
                  </ProtectedRoute>
                }
              />
              <Route path="scan-qr" element={<MaintenanceQRScanPage />} />
              <Route
                path="scan-machine-qr"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <MachineQRScanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="scan-machine-qr/add-machine"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <AddEditMachine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="detailMaintenance/:id"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}
                  >
                    <ReviewMaintenance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="maintenance/section-unit-recap"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}>
                    <SectionUnitPerformanceRecap />
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
