import React from 'react';
import NavbarOriginal from '@theme-original/Navbar';
import AuthButtons from '@site/src/components/AuthButtons';

export default function Navbar(props: any): JSX.Element {
  return (
    <div style={{ position: 'relative' }}>
      <NavbarOriginal {...props} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '1rem',
          transform: 'translateY(-50%)',
          zIndex: 100,
        }}
      >
        <AuthButtons />
      </div>
    </div>
  );
}


