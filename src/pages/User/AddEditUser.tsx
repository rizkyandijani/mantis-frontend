// src/pages/AddMachine.tsx
import UserForm from "../../components/userForm";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { useQueryClient } from "@tanstack/react-query";
import { UserData } from "../../types/user";

const getUserData = (userId: string | undefined) => {
  return useQuery<UserData>({
    queryKey: ["getUserById"],
    queryFn: () => apiFetch("user/byId/" + userId),

    retry: 1,
    staleTime: 0, // force re-fetch immediately
    refetchOnMount: true,
  });
};

export default function AddEditUser() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useParams();
  const isEdit = !!userId;
  const { data: user } = userId ? getUserData(userId) : { data: undefined }; // Fixing the type issue

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {isEdit ? "Edit Detail Mesin" : "Tambah Mesin Baru"}
      </h2>
      <UserForm
        userId={userId}
        user={user}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["listMachine", "getMachineById"],
          });
          navigate("/user/user-list");
        }}
      />
    </div>
  );
}
