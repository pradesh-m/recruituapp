import axios from 'axios';

const API_BASE_URL = 'https://dev-dot-recruit-u-f79a8.uc.r.appspot.com/api/lateral-recruiting';

export async function fetchPage(page, searchParams = {}) {
  try {
    const params = {
      page,
      ...searchParams,
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    console.log(`Fetching page ${page} with params:`, params);

    const response = await axios.get(API_BASE_URL, { params, headers });

    if (!response.data || !response.data.results) {
      throw new Error('Invalid API response structure.');
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching page ${page}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error(`No response received for page ${page}:`, error.request);
    } else {
      console.error(`Error setting up request for page ${page}:`, error.message);
    }
    throw error;
  }
}

export async function fetchUpToNPages(startPage, maxPages, searchParams = {}) {
  let results = [];
  let currentPage = startPage;
  let totalPages = 1;

  while (currentPage <= totalPages && currentPage < startPage + maxPages) {
    try {
      const data = await fetchPage(currentPage, searchParams);
      results = results.concat(data.results || []);
      totalPages = data.num_pages || totalPages;
      console.log(`Fetched page ${currentPage}/${totalPages}`);
      currentPage += 1;
    } catch (error) {
      console.error(`Failed to fetch page ${currentPage}. Stopping further requests.`);
      break;
    }
  }

  return {
    results,
    lastPageFetched: currentPage - 1,
    totalPages,
  };
}
