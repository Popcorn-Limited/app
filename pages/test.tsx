import { useContractReads } from "wagmi"
import NoSSR from "react-no-ssr"
import axios from "axios";
import Cors from 'cors'

function Fetcher() {


  return <></>
}

import { NextApiRequest, NextApiResponse } from "next";


export default function Test() {
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address: '0x5d344226578DC100b2001DA251A4b154df58194f',
        abi: vaultABI,
        functionName: 'totalAssets',
        chainId: 1
      },
      {
        address: '0x5d344226578DC100b2001DA251A4b154df58194f',
        abi: vaultABI,
        functionName: 'totalSupply',
        chainId: 1
      },
    ],
  })

  return (
    <NoSSR>
      <div>
        <h1>Test</h1>
        <Fetcher />
      </div>
    </NoSSR>
  )
}

const vaultABI = [
  { "inputs": [], "name": "totalAssets", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
] as const 
