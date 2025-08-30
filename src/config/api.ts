// API Configuration
// Update this URL when using ngrok or other tunneling services

export const API_CONFIG = {
  // Local development
  // TODO: Update this URL with your localtunnel backend URL + /api
  // Example: https://your-tunnel-name.loca.lt/api
  BASE_URL: 'https://major-friends-fold.loca.lt/api',
  
  // For ngrok tunneling, uncomment and update with your ngrok URL:
  // BASE_URL: "https://your-ngrok-url.ngrok.io/api",
  
  // For localtunnel, uncomment and update with your localtunnel URL:
  // BASE_URL: "https://your-tunnel-name.loca.lt/api",
};

export const getApiBaseUrl = (): string => {
  return API_CONFIG.BASE_URL;
};
