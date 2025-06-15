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

export const STATUS_COLOR_CLASS: Record<MachineStatus, string> = {
    [MachineStatus.OPERATIONAL]: "bg-green-500",
    [MachineStatus.MAINTENANCE]: "bg-yellow-500",
    [MachineStatus.OUT_OF_SERVICE]: "bg-red-500",
  };

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