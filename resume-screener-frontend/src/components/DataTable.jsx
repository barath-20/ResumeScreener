import React, { useState, useMemo } from 'react';

function DataTable({ 
  data, 
  columns, 
  itemsPerPage = 10, 
  searchable = false, 
  searchPlaceholder = "Search...",
  emptyMessage = "No data available"
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;
    
    return data.filter(item => 
      columns.some(column => {
        const value = column.accessor ? item[column.accessor] : '';
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, searchable, columns]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ←
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className="data-table-container">
      {searchable && (
        <div className="table-search">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="table-search-input"
          />
        </div>
      )}

      <div className="table-info">
        <span>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="table-header">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={index} className="table-row">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="table-cell">
                      {column.render ? column.render(item) : item[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
}

export default DataTable;

