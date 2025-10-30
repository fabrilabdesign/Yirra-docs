import React from 'react';
import Layout from '@theme-original/Layout';
import { ReadingProgress } from '@site/src/components/ReadingProgress';
import { useKeyboardShortcuts } from '@site/src/hooks/useKeyboardShortcuts';

export default function LayoutWrapper(props: any) {
  useKeyboardShortcuts();

  return (
    <>
      <ReadingProgress />
      <Layout {...props} />
    </>
  );
}
