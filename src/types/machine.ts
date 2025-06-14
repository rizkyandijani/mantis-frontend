import { DailyMaintenanceData } from "./maintenance";

export enum MachineType {
    BUBUT = "BUBUT",
    FRAIS = "FRAIS",
}

export enum MachineStatus {
    OPERATIONAL = "OPERATIONAL",
    MAINTENANCE = "MAINTENANCE",
    OUT_OF_SERVICE = "OUT_OF_SERVICE",
}

export interface MachineStatusLog {
    id: string;
    machineId: string;
    oldStatus: MachineStatus;
    newStatus: MachineStatus;
    comment?: string;
    createdAt: string;
    changeById: string;
}


export interface MachineData {
    id: string;
    name: string;
    type: MachineType;
    section: string;
    unit: string;
    status: MachineStatus;
    dailyMaintenances: DailyMaintenanceData[];
    statusLogs: MachineStatusLog[];
    createdAt: string;
    updatedAt: string;
  }