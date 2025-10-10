const getApiUrl = (path) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://yirrasystems.com';
  const fullUrl = `${apiUrl}${path}`;
  
  // Debug logging to see what URL is being generated
  console.log('getApiUrl debug:', {
    path,
    apiUrl,
    fullUrl,
    env: import.meta.env.VITE_API_URL
  });
  
  const url = new URL(fullUrl);
  url.searchParams.set('cacheBuster', new Date().getTime());
  return url.toString();
};

export default getApiUrl;
