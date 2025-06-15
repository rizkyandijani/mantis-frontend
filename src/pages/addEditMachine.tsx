// src/pages/AddMachine.tsx
import MachineForm from "../components/MachineForm";
import { useNavigate, useParams } from "react-router-dom";
import { MachineData } from "../types/machine";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";
import { useQueryClient } from "@tanstack/react-query";

const getMachineData = (machineId: string | undefined) => {
  return useQuery<MachineData>({
    queryKey: ["getMachineById"],
    queryFn: () => apiFetch("machine/byId/" + machineId),

    retry: 1,
    staleTime: 0, // force re-fetch immediately
    refetchOnMount: true,
  });
};

export default function AddEditMachine() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { machineId } = useParams();
  const isEdit = !!machineId;
  console.log("cek machineId", machineId);
  const { data: machine } = machineId
    ? getMachineData(machineId)
    : { data: undefined }; // Fixing the type issue
  console.log("cek machine data", machine);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {isEdit ? "Edit Detail Mesin" : "Tambah Mesin Baru"}
      </h2>
      <MachineForm
        machineId={machineId}
        machine={machine}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["listMachine", "getMachineById"],
          });
          navigate("/machines");
        }}
      />
    </div>
  );
}
