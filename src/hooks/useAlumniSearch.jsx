import { useState } from 'react';
import { fetchPage } from '../services/api';

function partialMatch(text, query) {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function useAlumniSearch() {
  const [alumniPaths, setAlumniPaths] = useState([]);
  const [allData, setAllData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastPageFetched, setLastPageFetched] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(0);
  const [hasTriedExtraFetch, setHasTriedExtraFetch] = useState(false);
  const [lastSearch, setLastSearch] = useState(null);

  function parseDocument(item) {
    const doc = item.document;
    const prev = doc.previous_companies
      ? doc.previous_companies.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const curr = doc.current_company?.company?.trim() || 'unknown';
    return [...prev, curr];
  }

  async function performSearch({ mode, companyX, companyY }) {
    setError('');
    setLoading(true);
    setAlumniPaths([]);
    setAllData([]);
    setLastPageFetched(0);
    setServerTotalPages(0);
    setHasTriedExtraFetch(false);
    setLastSearch({ mode, companyX, companyY });

    try {
      const results = [];
      let currentPage = 1;
      const maxPages = 100;
      let data = null;

      while (currentPage <= maxPages) {
        data = await fetchPage(currentPage, { mode, companyX, companyY });
        if (!data || !data.results) break;
        const parsed = data.results.map(parseDocument);
        results.push(...parsed);
        currentPage += 1;
      }

      setAllData(results);
      setLastPageFetched(currentPage - 1);
      setServerTotalPages(data ? data.num_pages : currentPage - 1);

      const final = filterAndProcess(results, { mode, companyX, companyY });
      setAlumniPaths(final);
      if (final.length === 0) {
        setError('No direct match found or only single-company results. Try another search.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchMoreIfNeeded() {
    if (hasTriedExtraFetch) return;
    if (!lastSearch) return;
    setHasTriedExtraFetch(true);
    setLoading(true);

    try {
      const { mode, companyX, companyY } = lastSearch;
      const results = [...allData];
      let currentPage = lastPageFetched + 1;
      const maxAdditionalPages = 100;
      const endPage = lastPageFetched + maxAdditionalPages;
      let data = null;

      while (currentPage <= serverTotalPages && currentPage <= endPage) {
        data = await fetchPage(currentPage, { mode, companyX, companyY });
        if (!data || !data.results) break;
        const parsed = data.results.map(parseDocument);
        results.push(...parsed);
        currentPage += 1;
      }

      setAllData(results);
      setLastPageFetched(currentPage - 1);
      setServerTotalPages(data ? data.num_pages : serverTotalPages);

      const final = filterAndProcess(results, { mode, companyX, companyY });
      setAlumniPaths(final);
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching more data.');
    } finally {
      setLoading(false);
    }
  }

  function filterAndProcess(data, { mode, companyX, companyY }) {
    let filtered = data.filter(path => path.length > 1);

    if (mode === 'FROM_X') {
      filtered = filtered.filter(path => path.some(item => partialMatch(item, companyX)));
      filtered = filtered.map(path => {
        const idx = path.findIndex(item => partialMatch(item, companyX));
        return idx > 0 ? path.slice(idx) : path;
      });
      filtered = filtered.map(path => {
        if (path[0].trim().toLowerCase() === path[path.length - 1].trim().toLowerCase()) {
          return path.slice(0, -1);
        }
        return path;
      });
    } else if (mode === 'TO_X') {
      filtered = filtered.filter(path => partialMatch(path[path.length - 1], companyX));
      filtered = filtered.filter(path => !partialMatch(path[0], companyX));
      filtered = filtered.filter(path => path[0].trim().toLowerCase() !== path[path.length - 1].trim().toLowerCase());
    }

    const deduped = filtered.map(path => {
      const out = [];
      for (let i = 0; i < path.length; i++) {
        const currentLower = path[i].trim().toLowerCase();
        if (out.length === 0 || out[out.length - 1].trim().toLowerCase() !== currentLower) {
          out.push(path[i].trim());
        }
      }
      return out;
    });

    const final = deduped.filter(p => p.length > 1).map(path => {
      if (mode === 'FROM_X' && path[0].trim().toLowerCase() === path[path.length - 1].trim().toLowerCase()) {
        return path.slice(0, -1);
      }
      return path;
    });

    return final;
  }

  return {
    alumniPaths,
    loading,
    error,
    performSearch,
    fetchMoreIfNeeded,
    serverTotalPages,
    lastPageFetched,
  };
}
