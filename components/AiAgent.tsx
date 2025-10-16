"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const AiAgent = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('Hello! I am your holographic AI assistant. How can I help you today?');
  const [tweetText, setTweetText] = useState('');
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

  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState('');

  const handlePostTweet = async () => {
    setIsPosting(true);
    setPostStatus('');
    try {
      const response = await fetch('/api/tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetText }),
      });

      const data = await response.json();

      if (response.ok) {
        setPostStatus(data.message);
        setTweetText('');
      } else {
        setPostStatus(data.error || 'Failed to post tweet.');
      }
    } catch (error) {
      setPostStatus('An error occurred while posting the tweet.');
    } finally {
      setIsPosting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto">
        <p className="text-gray-800">{message}</p>

        <div className="mt-4">
          <h3 className="font-bold text-lg">Compose a Tweet</h3>
          <textarea
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            className="w-full h-24 p-2 mt-2 border rounded"
            placeholder="What's happening?"
          />
          <button
            onClick={handlePostTweet}
            disabled={isPosting}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full disabled:bg-gray-400"
          >
            {isPosting ? 'Posting...' : 'Post Tweet'}
          </button>
          {postStatus && (
            <p className="mt-2 text-sm text-gray-600">{postStatus}</p>
          )}
        </div>
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