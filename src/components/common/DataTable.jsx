// E-tab Data Table Component
import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export const DataTable = ({ 
  columns, 
  data, 
  onRowClick,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'No data available'
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const toggleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
      onSelectionChange?.([]);
    } else {
      setSelectedRows(data.map(d => d.id));
      onSelectionChange?.(data);
    }
  };

  const toggleSelectRow = (id) => {
    const newSelection = selectedRows.includes(id)
      ? selectedRows.filter(r => r !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelection);
    onSelectionChange?.(data.filter(d => newSelection.includes(d.id)));
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {selectable && (
              <th className="px-4 py-3 w-12">
                <input 
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            )}
            {columns.map(col => (
              <th 
                key={col.key}
                className={cn(
                  'px-4 py-3 font-semibold text-slate-700',
                  col.sortable && 'cursor-pointer hover:bg-slate-100 transition-colors select-none'
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-2">
                  {col.title}
                  {col.sortable && sortConfig.key === col.key && (
                    <span className="text-blue-600">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedData.map((row, idx) => (
            <tr 
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'bg-white hover:bg-slate-50 transition-colors',
                onRowClick && 'cursor-pointer',
                selectedRows.includes(row.id) && 'bg-blue-50 hover:bg-blue-100'
              )}
            >
              {selectable && (
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <input 
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => toggleSelectRow(row.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
              )}
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};