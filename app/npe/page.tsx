import React from 'react';
import dynamic from 'next/dynamic';

const NpeManager = dynamic(() => import('../../components/NpeManager'), { ssr: false });

const NpePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">NPE Management</h1>
      <p className="mb-8">This page will be used to manage your Non-Player Entities (NPEs).</p>
      <NpeManager />
    </div>
  );
};

export default NpePage;