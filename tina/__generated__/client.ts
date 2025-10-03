import { createClient } from "tinacms/dist/client";
import { queries } from "./types";

// Dynamic configuration based on environment
const getClientConfig = () => {
  const clientId = import.meta.env.VITE_TINA_CLIENT_ID;
  const tinaToken = import.meta.env.VITE_TINA_TOKEN;
  const isLocalDevelopment = import.meta.env.DEV && !clientId && !import.meta.env.VITE_GITHUB_TOKEN && !tinaToken;
  
  if (isLocalDevelopment) {
    // Local development with filesystem backend
    return {
      url: 'http://localhost:4001/graphql',
      token: '',
      queries,
    };
  }
  
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';
  
  if (clientId) {
    // Tina Cloud setup - use read-only token if available, otherwise OAuth
    return {
      url: `https://content.tinajs.io/content/${clientId}/github/${branch}`,
      token: tinaToken || '', // Use Tina token for read operations when available
      queries,
    };
  }
  
  // Legacy GitHub token mode (for backwards compatibility)
  const token = import.meta.env.VITE_GITHUB_TOKEN || '';
  const apiUrl = import.meta.env.VITE_TINA_API_URL || 'https://content.tinajs.io/content';
  
  return {
    url: `${apiUrl}/${branch}`,
    token,
    queries,
  };
};

export const client = createClient(getClientConfig());
export default client;
  