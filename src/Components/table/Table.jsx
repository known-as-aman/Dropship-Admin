import React from 'react';

const Table = ({ 
  headers, 
  data, 
  renderRow, 
  isLoading,
  emptyMessage = "No data available",
  emptyDetails = null,
  onClearFilters = null
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg shadow-md">
      <table className="w-full">
        <thead>
          <tr className="text-left bg-gray-100 border-b border-gray-300">
            {headers.map((header, index) => (
              <th 
                key={index} 
                className={`px-4 py-3 font-semibold text-gray-700 ${header.width ? header.width : ''}`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={headers.length} className="py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-gray-500 text-lg">{emptyMessage}</p>
                  {emptyDetails && <div className="text-sm text-gray-400">{emptyDetails}</div>}
                  {onClearFilters && (
                    <button
                      onClick={onClearFilters}
                      className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 