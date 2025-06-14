import { QuestionResponseData } from "./question";

enum DailyMaintenanceStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export interface DailyMaintenanceData {
    id: string;
    date: Date; // ISO format
    dateOnly: string;
    machineId: string;
    studentEmail: string;
    approvedById: string;
    approvedAt: Date;
    status: DailyMaintenanceStatus;
    approvalNote?: string;
    responses: QuestionResponseData[];
}