import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import './index.css';

// Hardcode the Clerk key for production
const PUBLISHABLE_KEY = 'pk_live_Y2xlcmsueWlycmFzeXN0ZW1zLmNvbSQ';

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      clerkJSUrl="https://clerk.yirrasystems.com/npm/@clerk/clerk-js@5.99.0/dist/clerk.browser.js"
      frontendApi="clerk.yirrasystems.com"
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);


