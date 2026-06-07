"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from '../styles/Navbar.module.css';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about-us', label: 'About Us' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/calendar', label: 'Calendar' },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // Check if we're on mobile and reset menu state when window is resized
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <nav className="slimmenu-container">
      <button 
        className={`hamburger-menu ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div className={`slimmenu ${isOpen ? 'open' : ''}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? 'active' : ''}
              onClick={() => isMobile && setIsOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
        
        {/* Show logout button if authenticated */}
        {isAuthenticated && user && (
          <div style={{ borderTop: '1px solid #ccc', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', paddingBottom: '0.5rem' }}>
              {user.address.slice(0, 6)}...{user.address.slice(-4)}
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;