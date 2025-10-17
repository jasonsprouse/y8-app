import React from 'react';

interface NftCardProps {
  name: string;
  imageUrl: string;
  price: string;
}

const NftCard: React.FC<NftCardProps> = ({ name, imageUrl, price }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      <img src={imageUrl} alt={name} className="w-full h-64 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-gray-600 mt-2">{price}</p>
        <button
          className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => console.log('Buy Now clicked for', name)}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default NftCard;