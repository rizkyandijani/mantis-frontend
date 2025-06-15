import { MachineData } from "./machine";
import { QuestionResponseData } from "./question";

export enum DailyMaintenanceStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export const MAINTENANCE_STATUS_WORDS: Record<DailyMaintenanceStatus, string> = {
    [DailyMaintenanceStatus.PENDING]: "Menunggu Persetujuan",
    [DailyMaintenanceStatus.APPROVED]: "Disetujui",
    [DailyMaintenanceStatus.REJECTED]: "Ditolak",
}

export const MAINTENANCE_STATUS_COLORS: Record<DailyMaintenanceStatus, string> = {
    [DailyMaintenanceStatus.PENDING]: "text-yellow-600",
    [DailyMaintenanceStatus.APPROVED]: "text-green-600",
    [DailyMaintenanceStatus.REJECTED]: "text-red-600",
}

export interface DailyMaintenanceData {
    id: string;
    date: Date; // ISO format
    dateOnly: string;
    machineId: string;
    studentEmail: string;
    approvedById: string;
    approvedAt: Date;
    machine: MachineData;
    status: DailyMaintenanceStatus;
    approvalNote?: string;
    responses: QuestionResponseData[];
}