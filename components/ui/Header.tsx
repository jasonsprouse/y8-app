// components/Header.tsx
import React from 'react';


const Header = () => {
  return (
    <header className="header"> {/* Use class from globals.css */}
        {/* Paste the complex SVG for the header background here */}
        <svg preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 300">
            <defs> <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"> <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1"></path> </pattern> </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="#34A853"></rect>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)"></rect>
            <g> <line x1="0" y1="0" x2="1200" y2="0" stroke="rgba(0,0,0,0.1)" strokeWidth="2"> <animate attributeName="y1" from="-300" to="300" dur="10s" repeatCount="indefinite"/> <animate attributeName="y2" from="0" to="600" dur="10s" repeatCount="indefinite"/> </line> <line x1="0" y1="300" x2="1200" y2="300" stroke="rgba(0,0,0,0.1)" strokeWidth="2"> <animate attributeName="y1" from="600" to="0" dur="12s" repeatCount="indefinite"/> <animate attributeName="y2" from="900" to="300" dur="12s" repeatCount="indefinite"/> </line> </g>
            <g> <line y1="0" x1="0" y2="300" x2="0" stroke="rgba(0,0,0,0.1)" strokeWidth="2"> <animate attributeName="x1" from="-300" to="300" dur="11s" repeatCount="indefinite"/> <animate attributeName="x2" from="0" to="600" dur="11s" repeatCount="indefinite"/> </line> <line y1="0" x1="1200" y2="300" x2="1200" stroke="rgba(0,0,0,0.1)" strokeWidth="2"> <animate attributeName="x1" from="1500" to="900" dur="13s" repeatCount="indefinite"/> <animate attributeName="x2" from="1200" to="600" dur="13s" repeatCount="indefinite"/> </line> </g>
        </svg>
      <div className="header-content"> {/* Use class from globals.css */}
        <h1>Y8</h1>
        <p>Premier lifestyle services for everyone.</p>
      </div>
    </header>
  );
};

export default Header;