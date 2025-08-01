import * as XLSX from 'xlsx';

/**
 * A generic type for the data to be exported.
 * It should be an array of objects where keys are strings and values are any.
 */
export type ExportData = Record<string, any>[];

/**
 * Exports an array of objects to an Excel file and triggers a download.
 * @param data The array of data to export.
 * @param fileName The desired name for the output file (without extension).
 */
export const exportToExcel = (data: ExportData, fileName: string) => {
  if (!data || data.length === 0) {
    console.warn('No data provided to export.');
    return;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert the JSON data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Trigger the file download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
