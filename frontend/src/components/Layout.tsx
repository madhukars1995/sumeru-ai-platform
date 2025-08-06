import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [apiQuotas] = useState({
    daily: { used: 45, limit: 100 },
    monthly: { used: 1200, limit: 5000 }
  });

  // Show notification and auto-hide
  useEffect(() => {
    if (notification) {
      setTimeout(() => setNotification(null), 5000);
    }
  }, [notification]);

  const checkBackendConnection = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/api/model', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        // Only show success notification if we were previously disconnected
        // This prevents showing notifications on initial load
        console.log('Backend connection successful');
      } else {
        console.log('Backend responded with error status');
      }
    } catch (error) {
      // Don't show error notifications for connection issues
      // This is expected when backend is not running
      console.log('Backend connection check failed:', error);
    }
  }, []);

  // Effects
  useEffect(() => {
    // Don't check connection on initial load
    // Only start checking after a delay
    const timer = setTimeout(() => {
      checkBackendConnection();
      const interval = setInterval(checkBackendConnection, 60000); // Check every minute instead of 30 seconds
      return () => clearInterval(interval);
    }, 5000); // Wait 5 seconds before first check
    
    return () => clearTimeout(timer);
  }, [checkBackendConnection]);

  return (
    <div className="mgx-app">
      {/* Top Navigation */}
      <div className="top-nav">
        <div className="logo-btn">
          <div className="logo">Sumeru AI</div>
          <span className="beta-chip">Beta</span>
        </div>
        <div className="nav-controls">
          <Link to="/" className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/chat" className={`nav-btn ${location.pathname === '/chat' ? 'active' : ''}`}>
            Chat
          </Link>
          <Link to="/app-world" className={`nav-btn ${location.pathname === '/app-world' ? 'active' : ''}`}>
            App World
          </Link>
        </div>
        <div className="global-actions">
          <ThemeToggle />
          <button className="action-btn">🕐</button>
          <button className="action-btn">Supabase ▾</button>
          <button className="action-btn">Share</button>
          <button className="action-btn">⋮</button>
        </div>
      </div>

      {/* Quota Indicator - Always Visible */}
      <div className="quota-indicator">
        <div className="quota-info">
          <div className="quota-label">API Quota</div>
          <div className="quota-daily">Daily: {apiQuotas.daily.used}/{apiQuotas.daily.limit}</div>
          <div className="quota-monthly">Monthly: {apiQuotas.monthly.used}/{apiQuotas.monthly.limit}</div>
        </div>
        <div className="quota-bar">
          <div 
            className="quota-progress" 
            style={{ width: `${(apiQuotas.daily.used / apiQuotas.daily.limit) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      {children}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default Layout; 