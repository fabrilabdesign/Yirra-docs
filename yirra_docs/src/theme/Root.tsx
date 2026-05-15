import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BrowserOnly>
        {() => {
          const ChatWidget = require('@site/src/components/ChatWidget').default;
          return <ChatWidget theme="dark" apiBase="https://api.yirrasystems.com" mode="panel" />;
        }}
      </BrowserOnly>
    </>
  );
}


