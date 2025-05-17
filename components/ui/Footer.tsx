// components/Footer.tsx
import React from 'react';

const Footer = () => {
  return (
    // Use class from globals.css
    <footer className="footer">
      <h2>Good Faith Paradigm</h2>
      <p>© {new Date().getFullYear()} All Rights Reserved. Connecting blockchain technology with everyday applications.</p>
      <p>
        Contact:{" "}
        <a
          href="mailto:support@goodfaith.church"
          style={{ color: "#4285F4", textDecoration: "none" }} // Inline style from original
        >
          support@goodfaith.church
        </a>
      </p>
    </footer>
  );
};

export default Footer;