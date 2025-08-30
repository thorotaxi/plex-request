// API Configuration
// Supports both local development and production deployment

export const API_CONFIG = {
  // Production: Use environment variable from Vercel
  // Development: Fall back to local development URL
  BASE_URL: process.env.REACT_APP_API_URL || 'https://major-friends-fold.loca.lt/api',
  
  // For ngrok tunneling, uncomment and update with your ngrok URL:
  // BASE_URL: "https://your-ngrok-url.ngrok.io/api",
  
  // For localtunnel, uncomment and update with your localtunnel URL:
  // BASE_URL: "https://your-tunnel-name.loca.lt/api",
};

export const getApiBaseUrl = (): string => {
  return API_CONFIG.BASE_URL;
};
