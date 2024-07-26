import './App.css'
import React, { useEffect, useState } from 'react'
// import { ethers, JsonRpcProvider } from 'ethers';
import axios from 'axios'
import { abi } from './assets/abis/erc1155'
import { abi721 } from './assets/abis/erc721'
// import { CONTRACT_ADDRESS } from './constants';
import { useAccount, useReadContract } from 'wagmi'
import { Address } from 'viem'
import { getChainId } from 'wagmi/actions'
import { config } from './main'
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
  const [contractAddress, setContractAddress] = useState<Address | ''>('')
  const [tokenId, setTokenId] = useState('1')
  const [nftData, setNftData] = useState<NFTData | null>(null)
  const { address, isConnected } = useAccount();
  const [error, setError] = useState('');
  // const [type, setType] = useState<'1155' | '721'>('1155');
  const [chainId, setChainId] = useState(0);
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
 

  const fetchNFTData = async (type: '1155' | '721') => {
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
    console.log("TYPE", type);
    try {
      let uri: string | undefined;

      if(type === "1155"){
        await refetch1155();
      if (!isError1155) {
        uri = uri1155 as string;
        console.log("URI1155:", uri)
      }
    }else {
      await refetch721();
      if (!isError721) {
        uri = uri721 as string;
        console.log("URI721:", uri)
      }
      }
  // const fetchNFTData721 = async (type) => {
  //   if (!contractAddress || !tokenId) {
  //     setError('Contract address and Token ID are required');
  //     return;
  //   }
  //   if (!isValidAddress(contractAddress)) {
  //     setError('Invalid contract address');
  //     return;
  //   }

  //   setError('');
  //   setNftData(null);

  //   try {
  //     let uri: string | undefined;
  //     if(type === 721)  
  //     await refetch1155();
  //     if (!isError1155) {
  //       uri = uri1155 as string;
  //     } else{
  //       console.log("")
  //     }

  //     // await refetch721();
  //     // if (!isError721) {
  //     //   uri = uri721 as string;
  //     // } else {
  //     //   await refetch1155();
  //     //   if (!isError1155) {
  //     //     uri = uri1155 as string;
  //     //   }
  //     // }

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
  useEffect(() => {
    async function fetchChainId() {
      try {
        const chainId = await getChainId(config);
        setChainId(chainId);
        console.log("XXX",chainId);
      } catch (error) {
        console.error("Error fetching chain ID:", error);
      }
    }

    fetchChainId();
  }, []);

  // const handleButtonClick721 = async () => {
  //   setType("721");
  //   await fetchNFTData("721");
  // };
  // const handleButtonClick1155 = async () => {
  //   setType("1155");
  //   await fetchNFTData("1155");
  // };

  return (
    <div className="container">
      <h1>VISOR DE TARJETAS</h1>
    <div className='containerInputs'>
      <input
        id='input1'
        type="text"
        placeholder="Identificador de la tarjeta"
        value={contractAddress}
        onChange={(e) => {setContractAddress(e.target.value as Address)}}
      />
      <input
        id='input2'
        type="number"
        placeholder="Numero del identicador"
        value={tokenId}
        min={0}
        onChange={(e) => setTokenId(e.target.value)}
      />
      </div>
      {/* <button onClick={{fetchNFTData721; setType("721")}}>Visualizar tarjeta</button> */}
      {/* <button onClick={handleButtonClick721}>Visualizar tarjeta</button> */}
      {/* <button onClick={handleButtonClick1155}>Visualizar tarjeta 1155</button> */}
      <div className='containerButtons'>
        <button onClick={() => fetchNFTData("1155")}>Visualizar tarjeta 1155</button>
        <button onClick={() => fetchNFTData('721')}>Visualizar tarjeta 721</button>
      </div>
      {nftData && (
        <div className="nft-container">
          {/* <h2>Address conectada: {address}</h2> */}
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