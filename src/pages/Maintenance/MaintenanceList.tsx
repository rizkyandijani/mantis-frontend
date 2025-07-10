// src/pages/ApprovedMaintenanceList.tsx
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { DailyMaintenanceStatus, MAINTENANCE_STATUS_WORDS } from "../../types/maintenance";
import { MAINTENANCE_STATUS_COLORS } from "../../types/maintenance";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { useState, useMemo, useEffect } from "react";
import { FiMessageCircle } from "react-icons/fi";

interface Maintenance {
  id: string;
  date: Date;
  dateOnly: string;
  machine: { 
    name: string;
    section: string;
    unit: string;
  };
  studentName: string;
  studentId: string;
  approvedById: string;
  approvedBy: { name: string };
  approvedAt?: Date;
  approvalNote?: string;
  status?: DailyMaintenanceStatus;
  response: { question: string; answer: boolean }[];
}

const getLocalDate = (date: Date) => {
  return moment(date).tz("Asia/Jakarta").format("DD-MM-YYYY HH:mm:ss");
};

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100];

function useQueryParams() {
  return new URLSearchParams(useLocation().search);
}

export default function MaintenanceList() {
  const { data, isLoading, error } = useReactQuery<Maintenance[]>({
    queryKey: ["MaintenanceSubmissionsList"],
    queryFn: () => apiFetch("maintenance"),
  });

  const location = useLocation();
  const navigate = useNavigate();
  const query = useQueryParams();

  // Read initial state from URL
  const initialPage = parseInt(query.get("page") || "1", 10);
  const initialPageSize = parseInt(query.get("pageSize") || "15", 10);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Update URL when pagination changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("page", String(currentPage));
    params.set("pageSize", String(pageSize));
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  // Calculate pagination
  const totalItems = data?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = (data?.slice(startIndex, endIndex) || []) as Maintenance[];

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // CSV Export function
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Date',
      'Machine Name',
      'Section',
      'Unit',
      'Student Name',
      'Student ID',
      'Status',
      'Approval Note',
      'Approved By',
      'Approved At'
    ];

    const csvData = data.map((item: Maintenance) => [
      getLocalDate(item.date),
      item.machine.name,
      item.machine.section,
      item.machine.unit,
      item.studentName,
      item.studentId,
      MAINTENANCE_STATUS_WORDS[item.status || DailyMaintenanceStatus.PENDING],
      item.approvalNote || '',
      item.approvedBy?.name || '',
      item.approvedAt ? getLocalDate(item.approvedAt) : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `maintenance_list_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  console.log("cek data Maintenance List", data);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Maintenance</h2>
        <button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to CSV
        </button>
      </div>

      {/* Page Size Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Show:</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
        </div>
      </div>

      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">No.</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Machine</th>
            <th className="border p-2">Section</th>
            <th className="border p-2">Unit</th>
            <th className="border p-2">Student Name</th>
            <th className="border p-2">Student NIM</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Comment</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems?.map((item: Maintenance, index: number) => (
            <tr key={item.id}>
              <td className="border p-2">{startIndex + index + 1}</td>
              <td className="border p-2">{getLocalDate(item.date)}</td>
              <td className="border p-2">{item.machine.name}</td>
              <td className="border p-2">{item.machine.section}</td>
              <td className="border p-2">{item.machine.unit}</td>
              <td className="border p-2">{item.studentName}</td>
              <td className="border p-2">{item.studentId}</td>
              <td
                className={`border p-2 ${
                  item.status
                    ? MAINTENANCE_STATUS_COLORS[item.status]
                    : "text-grey-500"
                }`}
              >
                {item.status ? MAINTENANCE_STATUS_WORDS[item.status] : item.status}
              </td>
              <td className="border p-2 text-center">
                {item.approvalNote ? (
                  <FiMessageCircle title="Has comment" className="inline text-blue-500" />
                ) : null}
              </td>
              <td className="border p-2 text-center">
                <Link
                  to={`/detailMaintenance/${item.id}${location.search}`}
                  className="text-blue-600 hover:underline"
                >
                  Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Improved Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded text-sm ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                disabled={page === '...'}
                className={`px-3 py-1 border rounded text-sm ${
                  page === '...'
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : page === currentPage
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
