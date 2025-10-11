"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ethers } from 'ethers';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './SunShade.module.css';

// ABI for a simple ERC-721 NFT contract with minting functionality
const NFT_CONTRACT_ABI = [
  "function mint(string memory tokenURI) public payable returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function setApprovalForAll(address operator, bool approved) public",
  "function isApprovedForAll(address owner, address operator) public view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// Contract address for your NFT (replace with your actual contract address)
const NFT_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; 

// Sunshade project wallet (where the fees will go)
const SUNSHADE_WALLET = "0x9876543210987654321098765432109876543210"; 

// Fee percentage (1%)
const FEE_PERCENTAGE = 1;

// IPFS gateway for retrieving metadata
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

export default function SunshadeNFTMinter() {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [mintPrice, setMintPrice] = useState("0.1");
  const [mintStatus, setMintStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState<any[]>([]);
  const [totalRaised, setTotalRaised] = useState("0.00");
  const [showFeesInfo, setShowFeesInfo] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Calculate fees based on the mint price
  const calculateFees = () => {
    try {
      const price = parseFloat(mintPrice);
      const feeAmount = (price * FEE_PERCENTAGE) / 100;
      return {
        basePrice: price - feeAmount,
        feeAmount,
        totalPrice: price
      };
    } catch (e) {
      return {
        basePrice: 0,
        feeAmount: 0,
        totalPrice: 0
      };
    }
  };

  // Upload file to IPFS (mock function - in production would use a real IPFS service)
  const uploadToIPFS = async (file: File): Promise<string> => {
    setMintStatus("Uploading image to IPFS...");
    
    // In a real implementation, you'd upload to IPFS here
    // For this demo, we'll simulate it with a timeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a fake IPFS hash
    return "QmXHJHrg4R5FY9UKKBsXEjMovfzELwUxe3Yt7sd7Y4Dr" + Math.floor(Math.random() * 1000);
  };

  // Upload metadata to IPFS (mock function)
  const uploadMetadata = async (imageUri: string): Promise<string> => {
    setMintStatus("Creating metadata...");
    
    const metadata = {
      name: nftName,
      description: nftDescription,
      image: `ipfs://${imageUri}`,
      attributes: [
        {
          trait_type: "Sunshade Contribution",
          value: `${FEE_PERCENTAGE}%`
        }
      ]
    };
    
    // In a real implementation, you'd upload this metadata to IPFS
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a fake IPFS hash for the metadata
    return "QmZdj4xjkM1C9mR3kJfGx7uX1aYPypEr4mj9RFpn5yQT" + Math.floor(Math.random() * 1000);
  };

  // Mint NFT
  const mintNFT = async () => {
    if (!isAuthenticated) {
      setMintStatus("Please connect your wallet first");
      return;
    }
    
    if (!file) {
      setMintStatus("Please select an image for your NFT");
      return;
    }
    
    if (!nftName || !nftDescription) {
      setMintStatus("Please provide a name and description for your NFT");
      return;
    }
    
    try {
      setIsLoading(true);
      setMintStatus("Preparing to mint your NFT...");
      
      // Upload image to IPFS
      const imageUri = await uploadToIPFS(file);
      
      // Upload metadata to IPFS
      const metadataUri = await uploadMetadata(imageUri);
      
      // Get provider and signer
      if (typeof window.ethereum === "undefined") {
        throw new Error("Ethereum provider not available");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
      
      // Calculate price and fee
      const { totalPrice } = calculateFees();
      const priceInWei = ethers.parseEther(totalPrice.toString());
      
      setMintStatus("Confirm the transaction in your wallet...");
      
      // Mint NFT with the price
      const tx = await nftContract.mint(`ipfs://${metadataUri}`, { value: priceInWei });
      
      setMintStatus("Transaction submitted! Waiting for confirmation...");
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Get the token ID from the transfer event
      const transferEvent = receipt.logs
        .map((log: any) => {
          try {
            return nftContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .filter((event: any) => event !== null && event.name === "Transfer")[0];
      
      const tokenId = transferEvent ? transferEvent.args[2] : "Unknown";
      
      // Update UI
      setMintStatus(`Success! NFT minted with ID: ${tokenId}`);
      
      // Update minted NFTs list
      const newNFT = {
        id: tokenId.toString(),
        name: nftName,
        description: nftDescription,
        image: `${IPFS_GATEWAY}${imageUri}`,
        timestamp: new Date().toISOString()
      };
      
      setMintedNFTs(prev => [...prev, newNFT]);
      
      // Update total raised
      const feeAmount = calculateFees().feeAmount;
      setTotalRaised(prev => (parseFloat(prev) + feeAmount).toFixed(2));
      
      // Reset form
      setFile(null);
      setPreviewUrl(null);
      setNftName("");
      setNftDescription("");
      
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMintStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's previously minted NFTs
  useEffect(() => {
    // This would be implemented with actual contract calls in production
    // Mock implementation for demo purposes
    const fetchMintedNFTs = async () => {
      if (!isAuthenticated) return;
      
      // Simulate loading
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      
      // Mock data
      const mockNFTs = [
        {
          id: "1",
          name: "Sunshade Prototype #1",
          description: "First conceptual design for space sunshade",
          image: "/images/sunshade_nft_1.jpg",
          timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      ];
      
      setMintedNFTs(mockNFTs);
    };
    
    fetchMintedNFTs();
  }, [isAuthenticated]);

  return (
    <div className={styles.container}>
    <section className={styles.hero}>
      <div className={styles.animatedBackground}>
        {/* Create animated squares */}
        {[...Array(8)].map((_, i) => (
        <motion.svg 
          key={i}
          className={styles.animatedSquare}
          width="60" 
          height="60" 
          viewBox="0 0 60 60"
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: -100,
            rotate: 0,
            opacity: 0.3 + Math.random() * 0.4
          }}
          animate={{ 
            x: `${Math.random() * 100}%`, 
            y: '120vh',
            rotate: 360,
            opacity: 0.2 + Math.random() * 0.3
          }}
          transition={{ 
            duration: 15 + Math.random() * 20,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: Math.random() * 10
          }}
        >
          <rect width="60" height="60" fill="rgba(255, 255, 255, 0.2)" />
        </motion.svg>
        ))}
      </div>
      <motion.div 
        className={styles.heroContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Space Sunshade NFT</h1>
        <p>Mint exclusive NFTs and contribute to the Sunshade Climate Protection Initiative</p>
        <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{totalRaised} ETH</span>
          <span className={styles.statLabel}>Raised for Sunshade</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{mintedNFTs.length}</span>
          <span className={styles.statLabel}>NFTs Minted</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{FEE_PERCENTAGE}%</span>
          <span className={styles.statLabel}>Fee for Sunshade</span>
        </div>
        </div>
      </motion.div>
    </section>

      <section className={styles.minterSection}>
        <div className={styles.minterContainer}>
          {/* Left column: NFT Preview */}
          <div className={styles.previewColumn}>
            <h2>NFT Preview</h2>
            <div className={styles.nftPreview}>
              {previewUrl ? (
                <img src={previewUrl} alt="NFT Preview" className={styles.previewImage} />
              ) : (
                <div className={styles.emptyPreview}>
                  <span>NFT Preview</span>
                  <p>Upload an image to see your NFT</p>
                </div>
              )}
            </div>
            
            {/* Project info */}
            <div className={styles.projectInfo}>
              <h3>About the Sunshade Project</h3>
              <p>
                The Space Sunshade is a climate engineering project designed to reduce global 
                warming through placement of a parasol in space. Your NFT purchase helps fund 
                research and development for this critical technology.
              </p>
              <button 
                className={styles.infoButton} 
                onClick={() => setShowFeesInfo(!showFeesInfo)}
              >
                {showFeesInfo ? "Hide Fee Details" : "Show Fee Details"}
              </button>
              
              {showFeesInfo && (
                <div className={styles.feesExplainer}>
                  <h4>How Your Contribution Works</h4>
                  <p>
                    For every NFT minted, 99% of the mint price is automatically 
                    contributed to the Sunshade project wallet. These funds are used for research, 
                    development, and eventual deployment of space-based climate protection technology.
                  </p>
                  <div className={styles.feeCalculation}>
                    <div>
                      <span>Current Mint Price:</span>
                      <span>{mintPrice} ETH</span>
                    </div>
                    <div>
                      <span>Your NFT Cost:</span>
                      <span>{calculateFees().basePrice.toFixed(4)} ETH</span>
                    </div>
                    <div>
                      <span>Sunshade Contribution:</span>
                      <span>{calculateFees().feeAmount.toFixed(4)} ETH</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column: Minting Form */}
          <div className={styles.formColumn}>
            <h2>Create Your Sunshade NFT</h2>
            
            {!isAuthenticated ? (
              <div className={styles.connectPrompt}>
                <p>Connect your wallet to mint NFTs</p>
                <button onClick={() => {/* TODO: Implement wallet connection */}} className={styles.connectButton}>
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className={styles.mintForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="nft-image">Upload Image</label>
                  <input
                    type="file"
                    id="nft-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="nft-name">NFT Name</label>
                  <input
                    type="text"
                    id="nft-name"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                    placeholder="Enter a name for your NFT"
                    className={styles.textInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="nft-description">Description</label>
                  <textarea
                    id="nft-description"
                    value={nftDescription}
                    onChange={(e) => setNftDescription(e.target.value)}
                    placeholder="Describe your NFT"
                    className={styles.textareaInput}
                    rows={4}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="mint-price">Mint Price (ETH)</label>
                  <input
                    type="number"
                    id="mint-price"
                    value={mintPrice}
                    onChange={(e) => setMintPrice(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className={styles.textInput}
                  />
                  <small className={styles.feeNote}>
                    Includes {FEE_PERCENTAGE}% contribution to the Sunshade project
                  </small>
                </div>
                
                <button 
                  onClick={mintNFT} 
                  disabled={isLoading || !file || !nftName || !nftDescription}
                  className={styles.mintButton}
                >
                  {isLoading ? "Processing..." : "Mint NFT"}
                </button>
                
                {mintStatus && (
                  <div className={`${styles.statusMessage} ${mintStatus.includes('Error') ? styles.errorStatus : ''}`}>
                    {mintStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      
    {/* Multi-chain NFT Minting Statistics */}
    <section className={styles.statsSection}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={styles.statsContainer}
      >
        <h2>Sunshade NFT Contribution Statistics</h2>
        <p>Track the total impact of NFT minting across blockchain networks</p>
        
        <div className={styles.tableContainer}>
        <table className={styles.statsTable}>
          <thead>
            <tr>
            <th>Blockchain</th>
            <th>NFTs Minted</th>
            <th>Total Raised</th>
            <th>Avg per NFT</th>
            <th>Total Contribution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
            <td>Ethereum</td>
            <td>152</td>
            <td>38.5 ETH ($77,000)</td>
            <td>0.253 ETH ($506)</td>
            <td>0.385 ETH ($770)</td>
            </tr>
            <tr>
            <td>Polygon</td>
            <td>284</td>
            <td>1,420 MATIC ($1,136)</td>
            <td>5 MATIC ($4)</td>
            <td>14.2 MATIC ($11.36)</td>
            </tr>
            <tr>
            <td>Solana</td>
            <td>96</td>
            <td>192 SOL ($15,360)</td>
            <td>2 SOL ($160)</td>
            <td>1.92 SOL ($153.60)</td>
            </tr>
            <tr>
            <td>Avalanche</td>
            <td>65</td>
            <td>130 AVAX ($3,250)</td>
            <td>2 AVAX ($50)</td>
            <td>1.3 AVAX ($32.50)</td>
            </tr>
            <tr className={styles.totalRow}>
            <td>All Networks</td>
            <td>597</td>
            <td>-</td>
            <td>-</td>
            <td>$967.46</td>
            </tr>
          </tbody>
        </table>
        </div>
        
        <div className={styles.refreshInfo}>
        <small>Last updated: {new Date().toLocaleString()}</small>
        <button className={styles.refreshButton}>
          Refresh Stats
        </button>
        </div>
      </motion.div>
    </section>
      {isAuthenticated && mintedNFTs.length > 0 && (
        <section className={styles.mintedNFTsSection}>
          <h2>Your Sunshade NFTs</h2>
          <div className={styles.nftGrid}>
            {mintedNFTs.map(nft => (
              <div key={nft.id} className={styles.nftCard}>
                <div className={styles.nftImageContainer}>
                  <img src={nft.image} alt={nft.name} className={styles.nftImage} />
                </div>
                <div className={styles.nftDetails}>
                  <h3>{nft.name}</h3>
                  <p>{nft.description}</p>
                  <div className={styles.nftMeta}>
                    <span>ID: {nft.id}</span>
                    <span>Minted: {new Date(nft.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}