// src/pages/MachineList.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { Link, useNavigate } from "react-router-dom";
import { MachineStatus } from "../../types/machine";
// import { getStatusOperationColor } from "../service/machine";
import { STATUS_COLOR_CLASS } from "../../types/machine";
import ReactPaginate from "react-paginate";

const ITEMS_PER_PAGE = 10;

interface Machine {
  id: string;
  name: string;
  section: string;
  status: MachineStatus;
}

interface SelectedPage {
  selected: number;
}

export const MACHINE_STATUS_WORD: Record<MachineStatus, string> = {
  [MachineStatus.OPERATIONAL]: "Beroperasi",
  [MachineStatus.MAINTENANCE]: "Perlu Perawatan",
  [MachineStatus.OUT_OF_SERVICE]: "Tidak Beroperasi",
};

export const getMachineList = () => {
  return useQuery<Machine[]>({
    queryKey: ["listMachine"],
    queryFn: () => apiFetch("machine"),
    maxPages: 5,

    retry: 1,
    staleTime: 0, // force re-fetch immediately
    refetchOnMount: true,
  });
};

export default function MachineList() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const navigate = useNavigate();

  const { data, error, isLoading } = getMachineList();
  console.log("cek data", data);

  useEffect(() => {
    if (data) {
      setMachines(data);
    }
  }, [data]);

  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + ITEMS_PER_PAGE;
  console.log(`Loading items from ${itemOffset} to ${endOffset}`);
  const currentItems = machines.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(machines.length / ITEMS_PER_PAGE);

  // Invoke when user click to request another page.
  const handlePageClick = (event: SelectedPage) => {
    const newOffset = (event.selected * ITEMS_PER_PAGE) % machines.length;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset ?? 0);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {(error as any).message}</p>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold py-2 mb-2">Daftar Mesin</h2>
        <button
          className="bg-blue-800 text-white py-2 px-2 rounded hover:bg-blue-700 cursor-pointer mb-2"
          onClick={() => navigate("/machine/add-machine")}
        >
          Register Machine
        </button>
      </div>
      <div className="bg-white shadow rounded-md overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="hidden md:block p-2 border">ID Mesin</th>
              <th className="p-2 border">Nama Mesin</th>
              <th className="p-2 border">Section</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Detail</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="hidden md:block p-2 border">{m.id}</td>
                <td className="p-2 border">{m.name}</td>
                <td className="p-2 border">{m.section}</td>
                <td className="p-2 border">
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 ${
                        STATUS_COLOR_CLASS[m.status]
                      } rounded-full mr-1`}
                    />{" "}
                    {MACHINE_STATUS_WORD[m.status]}
                  </div>
                </td>
                <td className="p-2 border">
                  <Link
                    to={`/machines/${m.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ReactPaginate
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handlePageClick}
          onClick={(e) => console.log("cek event", e)}
          pageRangeDisplayed={5}
          pageCount={pageCount ?? 1}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          containerClassName="flex justify-center mt-4 flex-wrap gap-2 text-sm"
          pageClassName="cursor-pointer"
          pageLinkClassName="block px-3 py-1 border border-gray-300 rounded hover:bg-blue-100 transition"
          previousClassName="cursor-pointer"
          previousLinkClassName="block px-3 py-1 border border-gray-300 rounded hover:bg-blue-100 transition"
          nextClassName="cursor-pointer"
          nextLinkClassName="block px-3 py-1 border border-gray-300 rounded hover:bg-blue-100 transition"
          breakClassName="cursor-default"
          breakLinkClassName="block px-3 py-1 text-gray-400"
          activeClassName=""
          activeLinkClassName="bg-blue-500 text-white"
        />
      </div>
    </div>
  );
}
