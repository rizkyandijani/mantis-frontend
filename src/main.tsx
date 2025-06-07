import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import Dashboard from "./pages/Dashboard";
import ChecklistForm from "./pages/ChecklistForm";
import ApprovalList from "./pages/ApprovalList";
import MachineList from "./pages/MachineList";
import MaintenanceSchedule from "./pages/MaintenanceSchedule";
import NotificationPage from "./pages/NotificationPage";
import MachineStatus from "./pages/MachineStatus";
import QRAccessPage from "./pages/QRAccessPage";
import Navbar from "./components/navbar";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/qr/:machineId" element={<QRAccessPage />} />

          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/checklist" element={<ChecklistForm />} />
                  <Route path="/approval" element={<ApprovalList />} />
                  <Route path="/machines" element={<MachineList />} />
                  <Route path="/schedule" element={<MaintenanceSchedule />} />
                  <Route path="/notifications" element={<NotificationPage />} />
                  <Route path="/status" element={<MachineStatus />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);
