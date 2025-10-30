import { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';

export const useKeyboardShortcuts = () => {
  const history = useHistory();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K: Focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('.navbar__search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Cmd/Ctrl + /: Show keyboard shortcuts
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        alert(`
Keyboard Shortcuts:
• Cmd/Ctrl + K: Focus search
• Cmd/Ctrl + /: Show this help
• Cmd/Ctrl + B: Toggle sidebar
• Esc: Close search/sidebar
        `);
      }

      // Cmd/Ctrl + B: Toggle sidebar
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        const sidebar = document.querySelector('.theme-doc-sidebar-container');
        if (sidebar) {
          const toggleButton = document.querySelector('.navbar__toggle') as HTMLButtonElement;
          if (toggleButton) {
            toggleButton.click();
          }
        }
      }

      // Escape: Close search/sidebar
      if (event.key === 'Escape') {
        const searchInput = document.querySelector('.navbar__search-input') as HTMLInputElement;
        const sidebar = document.querySelector('.theme-doc-sidebar-container');

        if (document.activeElement === searchInput) {
          searchInput.blur();
        } else if (sidebar && window.getComputedStyle(sidebar).display !== 'none') {
          const toggleButton = document.querySelector('.navbar__toggle') as HTMLButtonElement;
          if (toggleButton && window.innerWidth <= 768) {
            toggleButton.click();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};
