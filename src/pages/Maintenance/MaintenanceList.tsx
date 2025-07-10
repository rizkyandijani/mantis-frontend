// src/pages/ApprovedMaintenanceList.tsx
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { DailyMaintenanceStatus, MAINTENANCE_STATUS_WORDS } from "../../types/maintenance";
import { MAINTENANCE_STATUS_COLORS } from "../../types/maintenance";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { useState, useMemo, useEffect } from "react";
import { FiMessageCircle } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  // Filter state
  const [filterType, setFilterType] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<Date | null>(null);
  const [filterDateTo, setFilterDateTo] = useState<Date | null>(null);

  // Extract unique filter values
  const machineTypes = useMemo(() => Array.from(new Set(data?.map(d => d.machine?.name) || [])), [data]);
  const units = useMemo(() => Array.from(new Set(data?.map(d => d.machine?.unit) || [])), [data]);
  const sections = useMemo(() => Array.from(new Set(data?.map(d => d.machine?.section) || [])), [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    return (data || []).filter(item => {
      const matchType = !filterType || item.machine?.name === filterType;
      const matchUnit = !filterUnit || item.machine?.unit === filterUnit;
      const matchSection = !filterSection || item.machine?.section === filterSection;
      const date = new Date(item.date);
      const matchDateFrom = !filterDateFrom || date >= filterDateFrom;
      const matchDateTo = !filterDateTo || date <= filterDateTo;
      return matchType && matchUnit && matchSection && matchDateFrom && matchDateTo;
    });
  }, [data, filterType, filterUnit, filterSection, filterDateFrom, filterDateTo]);

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
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = filteredData.slice(startIndex, endIndex);

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

  // CSV Export function (export filtered data)
  const exportToCSV = () => {
    if (!filteredData || filteredData.length === 0) {
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

    const csvData = filteredData.map((item: Maintenance) => [
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
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
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
        <div className="flex-1 min-w-[120px] max-w-xs">
          <label className="block text-xs font-medium mb-1">Submission Date From</label>
          <DatePicker
            selected={filterDateFrom}
            onChange={(date: Date | null) => setFilterDateFrom(date)}
            className="border rounded px-2 py-1 text-xs w-full"
            dateFormat="yyyy-MM-dd"
            placeholderText="From"
            isClearable
          />
        </div>
        <div className="flex-1 min-w-[120px] max-w-xs">
          <label className="block text-xs font-medium mb-1">Submission Date To</label>
          <DatePicker
            selected={filterDateTo}
            onChange={(date: Date | null) => setFilterDateTo(date)}
            className="border rounded px-2 py-1 text-xs w-full"
            dateFormat="yyyy-MM-dd"
            placeholderText="To"
            isClearable
          />
        </div>
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
            <th className="border p-2">Approver</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems?.map((item: Maintenance, index: number) => (
            <tr key={item.id}
              className={
                [
                  item.status === 'REJECTED' ? 'bg-red-50' : '',
                  item.approvalNote ? 'ring-2 ring-blue-200' : '',
                  'transition'
                ].join(' ')
              }
            >
              <td className="border p-2">{startIndex + index + 1}</td>
              <td className="border p-2">{getLocalDate(item.date)}</td>
              <td className="border p-2">{item.machine.name}</td>
              <td className="border p-2">{item.machine.section}</td>
              <td className="border p-2">{item.machine.unit}</td>
              <td className="border p-2">{item.studentName}</td>
              <td className="border p-2">{item.studentId}</td>
              <td className="border p-2 text-center">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    item.status === 'REJECTED'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : item.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : item.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      : 'bg-gray-100 text-gray-500 border border-gray-300'
                  }`}
                  title={item.status ? MAINTENANCE_STATUS_WORDS[item.status] : 'Unknown'}
                >
                  {item.status ? MAINTENANCE_STATUS_WORDS[item.status] : item.status}
                </span>
              </td>
              <td className="border p-2 text-center">
                {item.approvalNote ? (
                  <span title={item.approvalNote} className="inline-flex items-center justify-center">
                    <FiMessageCircle className="inline text-blue-600 w-5 h-5" />
                  </span>
                ) : null}
              </td>
              <td className="border p-2 text-center">
                {item.approvedBy?.name || '-'}
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
