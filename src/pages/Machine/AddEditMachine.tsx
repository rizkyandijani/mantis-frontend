// src/pages/AddMachine.tsx
import MachineForm from "../../components/MachineForm";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MachineData } from "../../types/machine";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
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
  const location = useLocation();
  const routeState = location?.state;
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
      {!isEdit && !routeState && (
        <div className="block border-solid bg-blue-100 border-1 px-1 py-1 w-50">
          <div className="mb-2">Ingin Menambahkan Mesin via scan QR?</div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={(e) => {
              e.preventDefault();
              navigate("/scan-machine-qr", {
                state: { from: location.pathname },
              });
            }}
          >
            Scan QR
          </button>
        </div>
      )}
      <MachineForm
        machineId={machineId}
        machine={machine ?? routeState?.machineData}
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
