const getApiUrl = (path) => {
  // Default to same-origin in staging/prod to avoid CORS
  const base = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const url = new URL(path, base);

  // Debug logging to see what URL is being generated
  console.log('getApiUrl debug:', {
    path,
    apiUrl: base,
    fullUrl: url.toString(),
    env: import.meta.env.VITE_API_URL
  });

  url.searchParams.set('cacheBuster', new Date().getTime());
  return url.toString();
};

export default getApiUrl;
