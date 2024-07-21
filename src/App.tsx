import './App.css'
import React, { useState } from 'react'
// import { ethers, JsonRpcProvider } from 'ethers';
import axios from 'axios'
import { abi } from './assets/abis/erc1155'
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
  const { address, isConnected } = useAccount()

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  const {
      data: uri,
      isLoading,
    refetch,
  } = useReadContract({
    abi,
    address: contractAddress && isValidAddress(contractAddress) ? contractAddress : undefined, // Validación address
    functionName: 'uri',
    args: [tokenId]
  })
  const fetchNFTData = async () => {
    if (!contractAddress || !tokenId) {
      return
    }
    // const provider = new JsonRpcProvider(
    //     // import.meta.env.REACT_APP_ARBITRUM_SEPOLIA_RPC_URL
    //     // process.env.REACT_APP_ARBITRUM_SEPOLIA_RPC_URL
    //     process.env.REACT_APP_SEPOLIA_RPC_URL
    //   );
    // const contract = new ethers.Contract(contractAddress, abi, provider);
    
    try {
        console.log('Control')
        console.log('Address', contractAddress)
        if (!isValidAddress(contractAddress)) {
          console.error('Dirección no válida:', contractAddress);
          return;
        }
        //   console.log("DATA", data);
        console.log('Address conectada', address)
        
        // const uri = await contract?.uri(tokenId);
        // console.log("URI", uri);
        //   const cosa = await contract?.getAddress();
        //   console.log("Cosa", cosa);
        //   const uri: string = data;
        if (typeof uri === 'string' && uri.startsWith('http')) {
            console.log('URI', uri)
            //   const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${uri?.split('/').pop()}`);
            const response = await axios.get(uri)
            
            console.log('Response', response)
            setNftData(response.data)
            console.log('Response.data', response.data)
            console.log('NFTDAta', await nftData)
            refetch()
        }
    } catch (error) {
      console.error('Error fetching NFT data:', error)
    }
  }

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
