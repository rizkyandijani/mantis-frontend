// src/components/MachineForm.tsx
import { useState, useEffect } from "react";
import { apiFetch } from "../libs/api";
import { swal } from "../libs/swal";
import { useNavigate } from "react-router-dom";
import { UserData } from "../types/user";
import { UserRole } from "../types/user";

interface MachineFormProps {
  userId?: string;
  onSuccess: () => void;
  user?: UserData;
}

export default function MachineForm({
  userId,
  onSuccess,
  user,
}: MachineFormProps) {
  console.log("cek userData form", user);
  const navigate = useNavigate();
  const isEdit = !!userId;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(UserRole.STUDENT);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role as UserRole);
      setPassword(user.password || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, email, role, password };
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `user/${userId}` : "user";

    try {
      apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      }).then((user) => {
        swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Berhasil ${isEdit ? "Mengedit" : "Menambahkan"} User`,
        });
        setName("");
        setEmail("");
        setRole(UserRole.STUDENT);
        setPassword("");
        onSuccess();
      });
    } catch (error) {
      console.log("cek error add edit user", error);
      swal.fire({
        icon: "error",
        title: "Gagal",
        text: `Tidak Berhasil ${isEdit ? "Mengedit" : "Menambahkan"} User.`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span>Nama User</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama User"
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <span>Email User</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email User"
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className={`${isEdit ? "hidden" : "block"}`}>
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <span>Role User</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full border px-3 py-2 rounded"
        >
          {Object.values(UserRole).map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isEdit ? "Update" : "Tambah"} User
      </button>
    </form>
  );
}
