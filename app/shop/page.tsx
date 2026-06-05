"use client";

import React, { useState } from 'react';

// Mark as dynamic to prevent static prerendering
export const dynamic = 'force-dynamic';

const ShopPage = () => {
  const [activeTab, setActiveTab] = useState('digital');

  return (
    <div className="page-content">
      <h1 className="text-4xl font-bold mb-4">Shop</h1>
      <div className="flex border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'digital' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('digital')}
        >
          Digital
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'physical' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('physical')}
        >
          Physical
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'labor' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('labor')}
        >
          Labor
        </button>
      </div>
      <div className="py-4">
        {activeTab === 'digital' && <div>Coming soon: Digital marketplace.</div>}
        {activeTab === 'physical' && <div>Coming soon: A marketplace for physical goods.</div>}
        {activeTab === 'labor' && <div>Coming soon: A marketplace for labor and services.</div>}
      </div>
    </div>
  );
};

export default ShopPage;