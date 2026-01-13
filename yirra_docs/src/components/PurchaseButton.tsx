import React from 'react';

interface PurchaseButtonProps {
  href: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'compact' | 'inline' | 'card';
  icon?: boolean;
}

const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  href,
  children = 'Buy Now',
  variant = 'primary',
  icon = true,
}) => {
  // Compact inline style for tables - styled like main site
  if (variant === 'inline') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: '#000000',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          border: '1px solid #333',
          marginLeft: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#1a1a1a';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#000000';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {icon && <span style={{ fontSize: '0.8rem' }}>🛒</span>}
        <span>{children}</span>
        <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>→</span>
      </a>
    );
  }

  // Compact button for tight spaces
  if (variant === 'compact') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(14, 165, 233, 0.35)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.25)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)';
        }}
      >
        {icon && <span>🛒</span>}
        <span>{children}</span>
        <span style={{ opacity: 0.7 }}>→</span>
      </a>
    );
  }

  // Card style for featured products
  if (variant === 'card') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '14px 28px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '12px',
          fontSize: '0.95rem',
          fontWeight: '600',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(14, 165, 233, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
        }}
      >
        <span style={{ 
          fontSize: '1.1rem',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}>
          🛒
        </span>
        <span>{children}</span>
        <span style={{ 
          fontSize: '1.1rem',
          opacity: 0.8,
          transition: 'transform 0.3s ease',
        }}>
          →
        </span>
      </a>
    );
  }

  // Default primary style
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(14, 165, 233, 0.4)';
        e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.3)';
        e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)';
      }}
    >
      {icon && <span style={{ fontSize: '1rem' }}>🛒</span>}
      <span>{children}</span>
      <span style={{ opacity: 0.7 }}>→</span>
    </a>
  );
};

export default PurchaseButton;

