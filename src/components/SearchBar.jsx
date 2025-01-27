import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [companyX, setCompanyX] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyX.trim()) return;

    onSearch({
      mode: 'FROM_X',
      companyX: companyX.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="field-group">
        <input
          type="text"
          placeholder="Enter Company X"
          value={companyX}
          onChange={(e) => setCompanyX(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="search-button-container">
        <button type="submit" className="search-button">
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
