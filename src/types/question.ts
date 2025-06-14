import { MachineType } from "./machine";

export interface QuestionResponseData {
    id: string;
    dailyMaintenanceId: string;
    questionId: string;
    answer: boolean;
}

export interface QuestionTemplateData {
    id : string;
    machineId? : string;
    machineType: MachineType;
    question: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
