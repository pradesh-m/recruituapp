import React, { useMemo } from 'react';
import './App.css';

import { useAlumniSearch } from './hooks/useAlumniSearch';
import SearchBar from './components/SearchBar';
import AlumniList from './components/AlumniList';
import PathVisualization from './components/PathVisualization';

function App() {
  const {
    alumniPaths,
    loading,
    error,
    performSearch,
    fetchMoreIfNeeded,
    serverTotalPages,
    lastPageFetched,
  } = useAlumniSearch();

  const handleSearch = (payload) => {
    performSearch(payload);
  };

  const chartData = useMemo(() => {
    const lastCompanies = alumniPaths.map(path => path[path.length - 1]);
    const companyCounts = lastCompanies.reduce((acc, company) => {
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(companyCounts).map(company => ({
      company,
      count: companyCounts[company],
    }));
  }, [alumniPaths]);

  const handleLoadMore = () => {
    fetchMoreIfNeeded();
  };

  return (
    <div className="container">
      <h1 className="main-title">Company Alumni Network</h1>

      <p className="description">
        <strong>From X</strong>: see where people go <em>after</em> X
      </p>

      <SearchBar onSearch={handleSearch} />

      {loading && <p className="info">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {serverTotalPages > 0 && (
        <p className="server-pages-info">
          Total Pages: {serverTotalPages}
        </p>
      )}

      {alumniPaths.length > 0 && (
        <>
          <AlumniList alumni={alumniPaths} />

          <div className="load-more-container">
            <button
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={lastPageFetched >= serverTotalPages || loading}
            >
              {lastPageFetched >= serverTotalPages ? 'All Pages Loaded' : 'Load More'}
            </button>
            {lastPageFetched >= serverTotalPages && (
              <p className="info">All pages have been loaded.</p>
            )}
          </div>

          <PathVisualization data={chartData} />
        </>
      )}
    </div>
  );
}

export default App;
