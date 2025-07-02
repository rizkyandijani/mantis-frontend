// src/pages/ApprovedMaintenanceList.tsx
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { DailyMaintenanceStatus } from "../../types/maintenance";
import { MAINTENANCE_STATUS_COLORS } from "../../types/maintenance";
import { Link } from "react-router-dom";
import moment from "moment-timezone";
import ReactPaginate from "react-paginate";
import { useState } from "react";

interface Maintenance {
  id: string;
  date: Date;
  dateOnly: string;
  machine: { name: string };
  studentName: string;
  studentId: string;
  approvedById: string;
  approvedBy: { name: string };
  approvalNote?: string;
  status?: DailyMaintenanceStatus;
  response: { question: string; answer: boolean }[];
}

interface SelectedPage {
  selected: number;
}

const getLocalDate = (date: Date) => {
  return moment(date).tz("Asia/Jakarta").format("DD-MM-YYYY HH:mm:ss");
};

const ITEMS_PER_PAGE = 15;

export default function MaintenanceList() {
  const { data, isLoading, error } = useQuery<Maintenance[]>({
    queryKey: ["MaintenanceSubmissionsList"],
    queryFn: () => apiFetch("maintenance"),
  });

  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + ITEMS_PER_PAGE;
  console.log(`Loading items from ${itemOffset} to ${endOffset}`);
  const currentItems = data && data.slice(itemOffset, endOffset);
  const pageCount = data && Math.ceil(data.length / ITEMS_PER_PAGE);

  // Invoke when user click to request another page.
  const handlePageClick = (event: SelectedPage) => {
    const newOffset = data && (event.selected * ITEMS_PER_PAGE) % data.length;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset ?? 0);
  };

  console.log("cek data Maintenance List", data);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Maintenance</h2>
      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">No.</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Machine</th>
            <th className="border p-2">Student Name</th>
            <th className="border p-2">Student NIM</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems?.map((item, index) => (
            <tr key={item.id}>
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{getLocalDate(item.date)}</td>
              <td className="border p-2">{item.machine.name}</td>
              <td className="border p-2">{item.studentName}</td>
              <td className="border p-2">{item.studentId}</td>
              <td
                className={`border p-2 ${
                  item.status
                    ? MAINTENANCE_STATUS_COLORS[item.status]
                    : "text-grey-500"
                }`}
              >
                {item.status}
              </td>
              <td className="border p-2 text-center">
                <Link
                  to={`/detailMaintenance/${item.id}`}
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
  );
}
