import { useEffect, useCallback } from 'react';
import { useNotifications } from '../components/NotificationSystem';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export const useKeyboardShortcuts = () => {
  // Try to get notifications context, but don't fail if not available
  let addNotification: ((notification: any) => void) | null = null;
  
  try {
    const notifications = useNotifications();
    addNotification = notifications.addNotification;
  } catch (error) {
    // Notifications not available, continue without them
    console.log('Notifications not available for keyboard shortcuts');
  }

  const shortcuts: Shortcut[] = [
    {
      key: 'h',
      description: 'Go to Home',
      action: () => {
        window.location.href = '/home';
        addNotification?.({
          type: 'info',
          title: 'Navigation',
          message: 'Navigated to Home page',
          duration: 2000
        });
      }
    },
    {
      key: 'c',
      description: 'Go to Chat',
      action: () => {
        window.location.href = '/chat';
        addNotification?.({
          type: 'info',
          title: 'Navigation',
          message: 'Navigated to Chat page',
          duration: 2000
        });
      }
    },
    {
      key: 'a',
      description: 'Go to App World',
      action: () => {
        window.location.href = '/app-world';
        addNotification?.({
          type: 'info',
          title: 'Navigation',
          message: 'Navigated to App World',
          duration: 2000
        });
      }
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Refresh page',
      action: () => {
        window.location.reload();
        addNotification?.({
          type: 'info',
          title: 'Page Refresh',
          message: 'Refreshing the page...',
          duration: 2000
        });
      }
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Toggle debug mode',
      action: () => {
        const debugMode = localStorage.getItem('debugMode') === 'true';
        localStorage.setItem('debugMode', (!debugMode).toString());
        addNotification?.({
          type: debugMode ? 'info' : 'warning',
          title: 'Debug Mode',
          message: debugMode ? 'Debug mode disabled' : 'Debug mode enabled',
          duration: 3000
        });
      }
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Toggle polling inspector',
      action: () => {
        // This will be handled by the PollingInspector component
        addNotification?.({
          type: 'info',
          title: 'Polling Inspector',
          message: 'Press the Polling Inspector button to toggle',
          duration: 3000
        });
      }
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => {
        addNotification?.({
          type: 'info',
          title: 'Keyboard Shortcuts',
          message: 'H: Home, C: Chat, A: App World, Ctrl+R: Refresh, Ctrl+D: Debug, Ctrl+P: Polling Inspector',
          duration: 5000
        });
      }
    }
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    const pressedKey = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    for (const shortcut of shortcuts) {
      if (shortcut.key.toLowerCase() === pressedKey &&
          shortcut.ctrl === ctrl &&
          shortcut.shift === shift &&
          shortcut.alt === alt) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, addNotification]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Show shortcuts on first load
  useEffect(() => {
    const hasSeenShortcuts = localStorage.getItem('hasSeenShortcuts');
    if (!hasSeenShortcuts) {
      setTimeout(() => {
        addNotification?.({
          type: 'info',
          title: 'Welcome to Sumeru AI!',
          message: 'Press ? to see keyboard shortcuts',
          duration: 5000
        });
        localStorage.setItem('hasSeenShortcuts', 'true');
      }, 2000);
    }
  }, [addNotification]);

  return { shortcuts };
}; 