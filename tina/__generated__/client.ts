import { createClient } from "tinacms/dist/client";
import { queries } from "./types";

// Dynamic configuration based on environment
const getClientConfig = () => {
  const isLocalDevelopment = import.meta.env.DEV && !import.meta.env.VITE_GITHUB_TOKEN;
  
  if (isLocalDevelopment) {
    // Local development with filesystem backend
    return {
      url: 'http://localhost:4001/graphql',
      token: '',
      queries,
    };
  }
  
  // Production or development with GitHub backend
  const token = import.meta.env.VITE_GITHUB_TOKEN || '';
  const clientId = import.meta.env.VITE_TINA_CLIENT_ID;
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';
  
  if (clientId) {
    // Tina Cloud setup
    return {
      url: `https://content.tinajs.io/content/${clientId}/github/${branch}`,
      token,
      queries,
    };
  }
  
  // Self-hosted or alternative GraphQL endpoint
  const apiUrl = import.meta.env.VITE_TINA_API_URL || 'https://content.tinajs.io/content';
  return {
    url: `${apiUrl}/${branch}`,
    token,
    queries,
  };
};

export const client = createClient(getClientConfig());
export default client;
  