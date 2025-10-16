import React from 'react';

const marketingLinks = [
  {
    title: 'Social Media Marketing 1',
    url: 'https://goodfaith.church/post/2025/social-media_004/',
  },
  {
    title: 'Social Media Marketing 2',
    url: 'https://goodfaith.church/post/2025/social-media_003/',
  },
  {
    title: 'Social Media Marketing 3',
    url: 'https://goodfaith.church/post/2025/social-media_002/',
  },
];

const MarketingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Marketing Content</h1>
      <div className="space-y-8">
        {marketingLinks.map((link) => (
          <div key={link.url} className="border rounded-lg overflow-hidden">
            <h2 className="text-2xl font-bold p-4 bg-gray-100">{link.title}</h2>
            <iframe
              src={link.url}
              title={link.title}
              className="w-full h-screen"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketingPage;