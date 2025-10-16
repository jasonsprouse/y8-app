"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const AiAgent = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('Hello! I am your holographic AI assistant. How can I help you today?');
  const pathname = usePathname();

  useEffect(() => {
    switch (pathname) {
      case '/npe':
        setMessage('This is the NPE Management page. Here you can create a new PKP for your Non-Player Entity.');
        break;
      case '/sales':
        setMessage('Welcome to the NFT Sales page! Browse our collection of exclusive NFTs.');
        break;
      case '/marketing':
        setMessage('This is the Marketing page. Here you can find more information about our project.');
        break;
      default:
        setMessage('Hello! I am your holographic AI assistant. How can I help you today?');
        break;
    }
  }, [pathname]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col">
      <div className="p-4 flex-grow">
        <p className="text-gray-800">{message}</p>
      </div>
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
      >
        &times;
      </button>
    </div>
  );
};

export default AiAgent;