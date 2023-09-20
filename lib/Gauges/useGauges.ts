import { useContractRead, useContractReads } from "wagmi";
import { BigNumber } from "ethers";
import { Pop } from "lib/types";

export interface Gauge {
  address: string;
  vault: string;
  chainId: number;
}

export default function useGauges({ address, chainId }: { address: string, chainId: number }): Pop.HookResult<Gauge[]> {
  console.log({ address, chainId })
  const { data: n_gauges } = useContractRead({
    address,
    abi: abiController,
    functionName: "n_gauges",
    chainId,
    args: []
  }) as { data: BigNumber, status: string }
  console.log({ n_gauges })

  const { data: gauges } = useContractReads({
    contracts: Array(n_gauges?.toNumber()).fill(undefined).map((item, idx) => {
      return {
        address,
        abi: abiController,
        functionName: "gauges",
        chainId,
        args: [idx]
      }
    }),
    enabled: !!n_gauges,
  }) as { data: string[], status: string }
  console.log({ gauges })

  const { data: areGaugesKilled } = useContractReads({
    contracts: gauges?.map((gauge: any) => {
      return {
        address: gauge,
        abi: abiGauge,
        functionName: "is_killed",
        chainId,
        args: []
      }
    }),
    enabled: !!gauges,
  }) as { data: boolean[], status: string }
  console.log({ areGaugesKilled })

  const aliveGauges = areGaugesKilled ? gauges?.filter((gauge: any, idx: number) => !areGaugesKilled[idx]) : gauges
  console.log({ aliveGauges })

  const { data, status } = useContractReads({
    contracts: aliveGauges?.map((gauge: any) => {
      return {
        address: gauge,
        abi: abiGauge,
        functionName: "lp_token",
        chainId,
        args: [],
      }
    }),
    enabled: !!aliveGauges,
    select: (data) => {
      return (data as string[]).map((token, i) => { return { address: aliveGauges[i], vault: token, chainId: chainId } })
    }
  }) as { data: Gauge[], status: string }
  console.log({ data, status })

  return { data, status } as Pop.HookResult<Gauge[]>;
}

const abiController = [
  {
    "stateMutability": "view",
    "type": "function",
    "name": "n_gauges",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "int128"
      }
    ]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "gauges",
    "inputs": [
      {
        "name": "arg0",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ]
  },
]
const abiGauge = [
  {
    "stateMutability": "view",
    "type": "function",
    "name": "lp_token",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "is_killed",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ]
  },
]