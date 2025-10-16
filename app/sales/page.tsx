import React from 'react';
import dynamic from 'next/dynamic';

const NftCard = dynamic(() => import('../../components/NftCard'), { ssr: false });

const nfts = [
  {
    name: 'Holographic Principle',
    imageUrl: 'https://img.rarible.com/prod/v1/image/t_image_big/a-ipfs/QmVFlRjAWp4gP7j5Yk2f2j2gqA46i2fFw2DP15X1Zt1ZzQ/image.jpeg',
    price: '0.05 ETH',
  },
  {
    name: 'Harps of God',
    imageUrl: 'https://img.rarible.com/prod/v1/image/t_image_big/a-ipfs/Qme2bL3X2Vj4j4j4j4j4j4j4j4j4j4j4j4j4j4j4j4/image.jpeg',
    price: '0.05 ETH',
  },
];

const SalesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">NFT Sales</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {nfts.map((nft) => (
          <NftCard key={nft.name} {...nft} />
        ))}
      </div>
    </div>
  );
};

export default SalesPage;