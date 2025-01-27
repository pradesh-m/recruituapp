import React, { useState } from 'react';

const PAGE_SIZE = 10;

function AlumniList({ alumni }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [gotoPage, setGotoPage] = useState('');

  const totalPages = Math.ceil(alumni.length / PAGE_SIZE);

  const startIdx = pageIndex * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  const currentPageItems = alumni.slice(startIdx, endIdx);

  const handlePrev = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handleNext = () => {
    if (pageIndex < totalPages - 1) {
      setPageIndex(pageIndex + 1);
    }
  };

  const handleGoToPage = () => {
    let p = parseInt(gotoPage, 10);
    if (!isNaN(p)) {
      p = Math.max(1, Math.min(p, totalPages)); 
      setPageIndex(p - 1);
    }
    setGotoPage('');
  };

  return (
    <div className="alumni-list-wrapper">
      <h2>Alumni Paths</h2>

      {currentPageItems.length === 0 ? (
        <p className="no-items">No items to show on this page.</p>
      ) : (
        <div className="alumni-grid">
          {currentPageItems.map((path, index) => {
            const finalString = path.join(' → ');
            return (
              <div key={index} className="alumni-card">
                {finalString}
              </div>
            );
          })}
        </div>
      )}

      <div className="pagination-controls">
        <button onClick={handlePrev} disabled={pageIndex === 0}>
          Prev
        </button>

        <span className="page-info">
          Page {pageIndex + 1} of {totalPages}
        </span>

        <button onClick={handleNext} disabled={pageIndex >= totalPages - 1}>
          Next
        </button>
      </div>

      <div className="goto-section">
        <label>Go to page:</label>
        <input
          type="number"
          className="goto-input"
          value={gotoPage}
          onChange={(e) => setGotoPage(e.target.value)}
          min="1"
          max={totalPages}
        />
        <button onClick={handleGoToPage}>Go</button>
      </div>
    </div>
  );
}

export default AlumniList;
