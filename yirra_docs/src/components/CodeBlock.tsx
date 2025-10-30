import React, { useState, useRef } from 'react';

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language = 'text',
  title
}) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const copyToClipboard = async () => {
    if (codeRef.current) {
      const text = codeRef.current.textContent || '';
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <div style={{
      position: 'relative',
      margin: 'var(--space-4) 0',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--color-gray-200)',
    }}>
      {/* Header */}
      {(title || language) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-gray-100)',
          borderBottom: '1px solid var(--color-gray-200)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-gray-600)',
        }}>
          <span>
            {title || language}
          </span>
          <button
            onClick={copyToClipboard}
            style={{
              background: 'none',
              border: 'none',
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-gray-500)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
              e.currentTarget.style.color = 'var(--color-gray-700)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-gray-500)';
            }}
          >
            {copied ? '✓' : '📋'}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Code */}
      <pre
        ref={codeRef}
        style={{
          margin: 0,
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-gray-900)',
          color: 'var(--color-gray-100)',
          overflow: 'auto',
          fontSize: 'var(--font-size-sm)',
          lineHeight: 'var(--line-height-relaxed)',
          fontFamily: 'var(--font-family-mono)',
        }}
      >
        <code style={{
          fontFamily: 'inherit',
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'inherit',
        }}>
          {children}
        </code>
      </pre>
    </div>
  );
};
