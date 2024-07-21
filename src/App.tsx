import './App.css'
import React, { useState } from 'react'
// import { ethers, JsonRpcProvider } from 'ethers';
import axios from 'axios'
import { abi } from './assets/abis/erc1155'
import { abi721 } from './assets/abis/erc721'
// import { CONTRACT_ADDRESS } from './constants';
import { useAccount, useReadContract } from 'wagmi'
import { Address } from 'viem'
// import { abi } from "./assets/abis/erc20";
// import { CONTRACT_ADDRESS } from "./assets/constants/index";

interface NFTData {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
}

//   const NFTViewer = () => {
function NFTViewer(): JSX.Element {
  const [contractAddress, setContractAddress] = useState<Address | undefined>(undefined)
  const [tokenId, setTokenId] = useState('')
  const [nftData, setNftData] = useState<NFTData | null>(null)
  const { address, isConnected } = useAccount();
  const [error, setError] = useState('')

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  const {
    data: uri721,
    refetch: refetch721,
    isError: isError721,
  } = useReadContract({
    address: contractAddress && isValidAddress(contractAddress) ? contractAddress : undefined,
    abi: abi721,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  // Leer URI del contrato ERC-1155
  const {
    data: uri1155,
    refetch: refetch1155,
    isError: isError1155,
  } = useReadContract({
    address: contractAddress && isValidAddress(contractAddress) ? contractAddress : undefined,
    abi: abi,
    functionName: 'uri',
    args: [tokenId],
  });
 

  const fetchNFTData = async () => {
    if (!contractAddress || !tokenId) {
      setError('Contract address and Token ID are required');
      return;
    }
    if (!isValidAddress(contractAddress)) {
      setError('Invalid contract address');
      return;
    }

    setError('');
    setNftData(null);

    try {
      let uri: string | undefined;

      await refetch1155();
      if (!isError1155) {
        uri = uri1155 as string;
      } else {
        await refetch721();
        if (!isError721) {
          uri = uri721 as string;
        }
      }
      // await refetch721();
      // if (!isError721) {
      //   uri = uri721 as string;
      // } else {
      //   await refetch1155();
      //   if (!isError1155) {
      //     uri = uri1155 as string;
      //   }
      // }

      if (uri && typeof uri === 'string' && uri.startsWith('http')) {
        // const response = await axios.get(uri);
        console.log("URI", uri);
    
        const baseIpfsUrl = 'https://ipfs.io/ipfs/';
        // Verifica si el URI comienza con la URL base de IPFS
        console.log("baseIpfsUrl", baseIpfsUrl);
        if (uri.startsWith(baseIpfsUrl)) {
            let tempUri = uri.slice(baseIpfsUrl.length); // Retorna el URI sin la parte base
            uri = `https://gateway.pinata.cloud/ipfs/${tempUri}`;
        }
        console.log("URIDESP", uri);
        // const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${uri?.split('/').pop()}`);
        const response = await axios.get(uri);
        console.log("Responde", response);
        setNftData(response.data);
        console.log("Responde.DATA", response.data);
      } else {
        setError('Invalid URI');
      }
    } catch (err) {
      console.error('Error fetching NFT data:', err);
      setError('Error fetching NFT data');
    }
  };

  return (
    <div className="container">
      <h1>VISOR DE TARJETAS</h1>
      <input
        type="text"
        placeholder="Identificador de la tarjeta"
        value={contractAddress || undefined}
        onChange={(e) => {
            const value = e.target.value;
            if (isValidAddress(value)) {
                setContractAddress(value as Address); // Afirmación de tipo
            } else {
                setContractAddress(undefined); // O puedes dejarlo como string vacío
            }
        }}
      />
      <input
        type="text"
        placeholder="Numero del identicador"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <button onClick={fetchNFTData}>Visualizar tarjeta</button>

      {nftData && (
        <div className="nft-container">
          <h2>Address conectada: {address}</h2>
          <img src={nftData.image} alt={nftData.name} />
          <h2>Nombre de la tarjeta: {nftData.name}</h2>
          <p>Descripción: {nftData.description}</p>
          {nftData?.attributes?.map((attr, idx) => (
                    <div className="attributes" key={idx}>
                        <strong>{attr.trait_type}:</strong> {attr.value}
                    </div>
                ))}
        </div>
      )}
    </div>
  )
}

export default NFTViewer