import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MachineData } from "../../types/machine";
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, eachDayOfInterval, isSameDay, endOfWeek, setDefaultOptions } from "date-fns";
import { enUS } from 'date-fns/locale';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { CellDef } from 'jspdf-autotable';

// Configure week to start on Monday
setDefaultOptions({ weekStartsOn: 1, locale: enUS });

const getYearList = (start = 2020) => {
  const current = new Date().getFullYear();
  return Array.from({ length: current - start + 1 }, (_, i) => start + i);
};

interface YearlyRecapData {
  machine: MachineData;
  checklistQuestions: string[];
  maintenanceData: {
    date: string;
    approvalNote?: string;
    checklistItems: {
      questionId: string;
      studentSubmitted: boolean;
      instructorApproved: boolean;
    }[];
  }[];
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

type CellStyle = {
  halign?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  fontSize?: number;
  cellWidth?: number;
  fillColor?: [number, number, number];
  font?: string;
  textColor?: [number, number, number];
  lineWidth?: number;
  lineColor?: [number, number, number];
  minCellHeight?: number;
  cellPadding?: number;
};

type TableCell = {
  content: string;
  styles?: CellStyle;
  rowSpan?: number;
  colSpan?: number;
};

export default function YearlyRecapExport() {
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch machines for dropdown
  const { data: machines } = useQuery<MachineData[]>({
    queryKey: ["machines"],
    queryFn: () => apiFetch("machine"),
  });

  // Fetch yearly recap data
  const { data: yearlyData } = useQuery<YearlyRecapData | null>({
    queryKey: ["maintenance", "yearly-recap", selectedMachine, selectedYear],
    queryFn: async () => {
      if (!selectedMachine) return null;
      return apiFetch(`maintenance/yearly-recap?machineId=${selectedMachine}&year=${selectedYear}`);
    },
    enabled: !!selectedMachine,
  });

  const generatePDF = async () => {
    if (!yearlyData) return;
    
    // Initialize PDF in landscape orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Create header boxes in a row
    const pageWidth = doc.internal.pageSize.width;
    const boxWidth = (pageWidth - 42) / 3; // 14mm margin on each side, divide remaining space by 3
    const boxHeight = 12;
    const startY = 14;

    // Title box
    autoTable(doc, {
      body: [[{ 
        content: 'Yearly Maintenance Recap',
        styles: { 
          halign: 'center' as const,
          valign: 'middle' as const,
          fontSize: 12,
          fontStyle: 'bold'
        }
      }]],
      startY: startY,
      theme: 'grid',
      styles: {
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0] as [number, number, number]
      },
      margin: { left: 14 },
      tableWidth: boxWidth
    });

    // Machine info box
    autoTable(doc, {
      body: [[{ 
        content: `Machine: ${yearlyData.machine.name || "-"}\nID: ${yearlyData.machine.inventoryId || "-"}`,
        styles: { 
          halign: 'left' as const,
          valign: 'middle' as const,
          fontSize: 10
        }
      }]],
      startY: startY,
      theme: 'grid',
      styles: {
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0] as [number, number, number]
      },
      margin: { left: 14 + boxWidth + 7 },
      tableWidth: boxWidth
    });

    // Year box
    autoTable(doc, {
      body: [[{ 
        content: `Year: ${selectedYear}`,
        styles: { 
          halign: 'left' as const,
          valign: 'middle' as const,
          fontSize: 10
        }
      }]],
      startY: startY,
      theme: 'grid',
      styles: {
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0] as [number, number, number]
      },
      margin: { left: 14 + (boxWidth + 7) * 2 },
      tableWidth: boxWidth
    });

    // Split months into two groups of 6
    const months = Array.from({ length: 12 }, (_, i) => new Date(selectedYear, i));
    const firstHalfMonths = months.slice(0, 6);
    const secondHalfMonths = months.slice(6);

    // Generate first half table
    let currentY = startY + boxHeight + 5;
    currentY = generateMonthTable(doc, firstHalfMonths, currentY);
    
    // Add minimal spacing and generate second half table
    currentY += 3;
    currentY = generateMonthTable(doc, secondHalfMonths, currentY);

    // Add legend after both tables with minimal spacing
    currentY += 3;
    
    // Create legend table with smaller width and compact layout
    autoTable(doc, {
      body: [[
        { content: 'V', styles: { halign: 'center' as const, fontSize: 9 } },
        { content: ': Approved', styles: { halign: 'left' as const, fontSize: 9 } },
        { content: '?', styles: { halign: 'center' as const, fontSize: 9 } },
        { content: ': Unapproved', styles: { halign: 'left' as const, fontSize: 9 } },
        { content: '', styles: { halign: 'center' as const, fontSize: 9, fillColor: [220, 220, 220] } },
        { content: ': Days from adjacent months', styles: { halign: 'left' as const, fontSize: 9 } }
      ]],
      startY: currentY,
      theme: 'plain',
      styles: {
        cellPadding: 1,
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 10 },
        3: { cellWidth: 30 },
        4: { cellWidth: 10 },
        5: { cellWidth: 50 }
      }
    });

    // Add new page for questions and comments
    doc.addPage();
    
    // Reset Y position for new page
    currentY = 14;

    // Add Questions Section
    if (yearlyData?.checklistQuestions?.length) {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Maintenance Questions:", 14, currentY);
      currentY += 8;

      // Questions box
      const questionsList = yearlyData.checklistQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');
      autoTable(doc, {
        body: [[{ 
          content: questionsList,
          styles: {
            halign: 'left' as const,
            valign: 'top' as const,
            fontSize: 9
          }
        }]],
        startY: currentY,
        theme: 'grid',
        styles: {
          cellPadding: 5,
          fontSize: 9,
          lineColor: [0, 0, 0] as [number, number, number],
          lineWidth: 0.1
        },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Add Approval Comments Section
    doc.setFontSize(11);
    doc.text("Approval Comments:", 14, currentY);
    currentY += 8;

    // Collect all comments
    const allComments: string[] = [];
    if (yearlyData) {
      months.forEach((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        yearlyData.maintenanceData
          .filter(data => {
            const date = new Date(data.date);
            return date >= monthStart && date <= monthEnd;
          })
          .forEach(data => {
            if (data.checklistItems.some(item => item.instructorApproved)) {
              const date = format(new Date(data.date), 'dd MMM yyyy');
              const machineInfo = `${yearlyData.machine.name} (${yearlyData.machine.inventoryId})`;
              const comment = data.approvalNote 
                ? `${date} - ${machineInfo} - ${data.approvalNote}`
                : `${date} - ${machineInfo} - (No comment provided)`;
              allComments.push(comment);
            }
          });
      });
    }

    // Comments box
    autoTable(doc, {
      body: [[{ 
        content: allComments.length > 0 
          ? allComments.join('\n')
          : 'No approval comments for this period.',
        styles: {
          halign: 'left' as const,
          valign: 'top' as const,
          fontSize: 9
        }
      }]],
      startY: currentY,
      theme: 'grid',
      styles: {
        cellPadding: 5,
        fontSize: 9,
        lineColor: [0, 0, 0] as [number, number, number],
        lineWidth: 0.1
      },
      margin: { left: 14, right: 14 }
    });

    // Save the PDF
    doc.save(`maintenance-recap-${yearlyData.machine.name}-${selectedYear}.pdf`);
  };

  const generateMonthTable = (doc: jsPDF, months: Date[], startY: number) => {
    const GREEN_COLOR: [number, number, number] = [26, 188, 156];
    
    // Calculate weeks for each month
    const monthColumns = months.map(month => {
      return {
        month,
        weeks: eachWeekOfInterval({
          start: startOfMonth(month),
          end: endOfMonth(month)
        }, { weekStartsOn: 1 }) // Explicitly set week to start on Monday
      };
    });

    // Create header rows with proper structure
    const headers: TableCell[][] = [
      [
        { 
          content: 'Day',
          rowSpan: 2,
          styles: {
            halign: 'center' as const,
            valign: 'middle' as const,
            fillColor: GREEN_COLOR
          }
        },
        ...monthColumns.map(({ month, weeks }) => ({
          content: format(month, 'MMMM'),
          colSpan: weeks.length,
          styles: { 
            fillColor: GREEN_COLOR,
            halign: 'center' as const,
            valign: 'middle' as const
          }
        }))
      ],
      [
        ...monthColumns.flatMap(({ weeks }) => 
          weeks.map((_, i) => ({
            content: `${i + 1}`,
            styles: { 
              fillColor: GREEN_COLOR,
              halign: 'center' as const,
              valign: 'middle' as const,
              textColor: [255, 255, 255] as [number, number, number]
            }
          }))
        )
      ]
    ];

    // Create data rows - one row per day of the week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Initialize the body array
    const body: TableCell[][] = daysOfWeek.map(day => {
      const row: TableCell[] = [];
      
      // Add day name column
      row.push({
        content: day,
        styles: {
          halign: 'center' as const,
          valign: 'middle' as const
        }
      });

      // Add empty cells for each week
      monthColumns.forEach(({ month, weeks }) => {
        weeks.forEach((weekStart) => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          const currentMonth = month.getMonth();
          
          const weekDays = eachDayOfInterval({
            start: weekStart,
            end: weekEnd
          });

          const dayOfWeek = weekDays.find(d => format(d, 'EEEE') === day);
          if (dayOfWeek && yearlyData) {
            const dayData = yearlyData.maintenanceData.find(d => 
              isSameDay(new Date(d.date), dayOfWeek)
            );

            // Check if this day belongs to a different month
            const isOverlapping = dayOfWeek.getMonth() !== currentMonth;
            const LIGHT_GRAY: [number, number, number] = [220, 220, 220];

            row.push({
              content: (!dayData || dayData.checklistItems.length === 0 || isOverlapping)
                ? '' 
                : dayData.checklistItems.some(item => item.instructorApproved)
                  ? 'V'
                  : '?',
              styles: { 
                fontSize: 10,
                halign: 'center' as const,
                valign: 'middle' as const,
                font: 'helvetica',
                fillColor: isOverlapping ? LIGHT_GRAY : undefined
              }
            });
          } else {
            // If no matching day found, still check if this slot would be outside current month
            const emptyDayDate = weekDays.find(d => format(d, 'EEEE') === day);
            const isOverlapping = emptyDayDate && emptyDayDate.getMonth() !== currentMonth;
            const LIGHT_GRAY: [number, number, number] = [220, 220, 220];

            row.push({
              content: '',
              styles: {
                halign: 'center' as const,
                valign: 'middle' as const,
                fillColor: isOverlapping ? LIGHT_GRAY : undefined
              }
            });
          }
        });
      });

      return row;
    });

    // Generate the table
    autoTable(doc, {
      head: headers,
      body: body,
      startY: startY,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0] as [number, number, number],
        halign: 'center' as const,
        valign: 'middle' as const,
        minCellHeight: 8,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: GREEN_COLOR,
        textColor: [255, 255, 255] as [number, number, number],
        fontSize: 9,
        halign: 'center' as const,
        valign: 'middle' as const
      },
      columnStyles: {
        0: { 
          cellWidth: 25,
          halign: 'center' as const
        }
      }
    });

    return (doc as any).lastAutoTable.finalY;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Yearly Maintenance Recap Export</h1>
      
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Machine
          </label>
          <select
            className="w-full p-2 border rounded"
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
          >
            <option value="">Select a machine...</option>
            {machines?.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Year
          </label>
          <select
            className="w-full p-2 border rounded"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {getYearList().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        onClick={generatePDF}
        disabled={!selectedMachine || !yearlyData}
      >
        Generate PDF
      </button>
    </div>
  );
} 