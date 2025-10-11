import React from 'react';

const NotificationBar = () => {
  return (
    <div className="notification-bar-container">
      <div className="notification-bar"> 
        <div className="notification-animation">
           {/* SVG animation remains the same */}
           <svg preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 60">
              <defs>
                 <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="0%"> <stop offset="0%" stopColor="#ff1744" stopOpacity="0.9"/> <stop offset="50%" stopColor="#ff4081" stopOpacity="0.9"/> <stop offset="100%" stopColor="#ff1744" stopOpacity="0.9"/> </linearGradient>
                 <filter id="lightningGlow" x="-20%" y="-20%" width="140%" height="140%"> <feGaussianBlur stdDeviation="2" result="blur"/> <feComposite in="SourceGraphic" in2="blur" operator="over"/> </filter>
                 <path id="lightningBolt" d="M0,30 L15,20 L5,30 L15,40 L0,30" fill="url(#lightningGradient)" filter="url(#lightningGlow)"/>
              </defs>
              <rect width="100%" height="100%" fill="transparent"/>
              <path d="M0,30 Q300,15 600,30 T1200,30" fill="none" stroke="rgba(255,0,0,0.1)" strokeWidth="1" id="lightningPath"/>
              <use href="#lightningBolt"> <animateMotion dur="2s" repeatCount="indefinite" rotate="auto"> <mpath href="#lightningPath"/> </animateMotion> <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/> </use>
              <use href="#lightningBolt"> <animateMotion dur="2.5s" begin="0.5s" repeatCount="indefinite" rotate="auto"> <mpath href="#lightningPath"/> </animateMotion> <animate attributeName="opacity" values="0;1;0" dur="2.5s" begin="0.5s" repeatCount="indefinite"/> </use>
              <use href="#lightningBolt"> <animateMotion dur="3s" begin="1s" repeatCount="indefinite" rotate="auto"> <mpath href="#lightningPath"/> </animateMotion> <animate attributeName="opacity" values="0;1;0" dur="3s" begin="1s" repeatCount="indefinite"/> </use>
              <path d="M200,10 L230,30 L210,35 L240,50" stroke="url(#lightningGradient)" strokeWidth="2" fill="none" filter="url(#lightningGlow)"> <animate attributeName="opacity" values="0;0.8;0" dur="2.7s" begin="0.2s" repeatCount="indefinite"/> </path>
              <path d="M800,10 L750,30 L780,35 L740,50" stroke="url(#lightningGradient)" strokeWidth="2" fill="none" filter="url(#lightningGlow)"> <animate attributeName="opacity" values="0;0.8;0" dur="3.2s" begin="1.5s" repeatCount="indefinite"/> </path>
              <path d="M500,5 L520,25 L490,30 L510,55" stroke="url(#lightningGradient)" strokeWidth="2" fill="none" filter="url(#lightningGlow)"> <animate attributeName="opacity" values="0;0.8;0" dur="4s" begin="1s" repeatCount="indefinite"/> </path>
              <rect width="100%" height="100%" fill="url(#lightningGradient)" opacity="0"> <animate attributeName="opacity" values="0;0.03;0;0.02;0" dur="0.8s" repeatCount="indefinite"/> </rect>
           </svg>
        </div>
        <div className="notification-content">
          <div className="notification-text">
            <h4>Welcome to Good Faith Paradigm - Innovating for Tomorrow</h4>
          </div>
          <div className="notification-wallet">
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;