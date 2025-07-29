// src/pages/MachineList.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { Link, useNavigate } from "react-router-dom";
import { MachineStatus, MachineData } from "../../types/machine";
// import { getStatusOperationColor } from "../service/machine";
import { STATUS_COLOR_CLASS } from "../../types/machine";
import ReactPaginate from "react-paginate";

const ITEMS_PER_PAGE = 10;

// Use MachineData from types

interface SelectedPage {
  selected: number;
}

export const MACHINE_STATUS_WORD: Record<MachineStatus, string> = {
  [MachineStatus.OPERATIONAL]: "Beroperasi",
  [MachineStatus.MAINTENANCE]: "Perlu Perawatan",
  [MachineStatus.OUT_OF_SERVICE]: "Tidak Beroperasi",
};

export const getMachineList = () => {
  return useQuery<MachineData[]>({
    queryKey: ["listMachine"],
    queryFn: () => apiFetch("machine"),
    maxPages: 5,

    retry: 1,
    staleTime: 0, // force re-fetch immediately
    refetchOnMount: true,
  });
};

export default function MachineList() {
  const [machines, setMachines] = useState<MachineData[]>([]);
  const navigate = useNavigate();

  const { data, error, isLoading } = getMachineList();

  useEffect(() => {
    if (data) {
      setMachines(data as MachineData[]);
    }
  }, [data]);

  // Filter state
  const [filterType, setFilterType] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterSection, setFilterSection] = useState("");

  // Extract unique filter values
  const machineTypes = Array.from(new Set(machines.map(m => m.machineCommonType)));
  const units = Array.from(new Set(machines.map(m => m.unit)));
  const sections = Array.from(new Set(machines.map(m => m.section)));

  // Filtered data
  const filteredMachines = machines.filter(m => {
    const matchType = !filterType || m.machineCommonType === filterType;
    const matchUnit = !filterUnit || m.unit === filterUnit;
    const matchSection = !filterSection || m.section === filterSection;
    return matchType && matchUnit && matchSection;
  });

  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + ITEMS_PER_PAGE;
  const currentItems = filteredMachines.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredMachines.length / ITEMS_PER_PAGE);

  // Invoke when user click to request another page.
  const handlePageClick = (event: SelectedPage) => {
    const newOffset = (event.selected * ITEMS_PER_PAGE) % filteredMachines.length;
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
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div className="flex-1 min-w-[120px] max-w-xs">
          <label className="block text-xs font-medium mb-1">Machine Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded px-2 py-1 text-xs w-full">
            <option value="">All</option>
            {machineTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[120px] max-w-xs">
          <label className="block text-xs font-medium mb-1">Unit</label>
          <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)} className="border rounded px-2 py-1 text-xs w-full">
            <option value="">All</option>
            {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[120px] max-w-xs">
          <label className="block text-xs font-medium mb-1">Section</label>
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="border rounded px-2 py-1 text-xs w-full">
            <option value="">All</option>
            {sections.map(section => <option key={section} value={section}>{section}</option>)}
          </select>
        </div>
      </div>
      <div className="bg-white shadow rounded-md overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="hidden md:block p-2 border">ID Mesin</th>
              <th className="p-2 border">Nama Mesin</th>
              <th className="p-2 border">Tipe Mesin</th>
              <th className="p-2 border">Unit</th>
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
                <td className="p-2 border">{m.machineCommonType}</td>
                <td className="p-2 border">{m.unit}</td>
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
