import { BigNumber, constants } from "ethers";
import { BigNumberWithFormatted, Pop } from "lib/types";
import { formatAndRoundBigNumber } from "lib/utils";
import { Address, useContractRead, useContractReads } from "wagmi";
import { getVotePeriodEndTime } from "./utils";
import { getVeAddresses } from "lib/utils/addresses";

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses();


export default function useGaugeWeights({ address, account, chainId }: { address: string, account: string, chainId: number }): Pop.HookResult<BigNumber[]> {
  const contract = {
    address: GAUGE_CONTROLLER,
    chainId: Number(chainId),
    abi: ["function gauge_relative_weight(address,uint256) view returns (uint256)",
      "function gauge_relative_weight(address) view returns (uint256)",
      "function vote_user_slopes(address user, address gauge) external view returns (uint256)"]
  }

  return useContractReads({
    contracts: [
      {
        ...contract,
        functionName: "gauge_relative_weight",
        args: [address]
      },
      {
        ...contract,
        functionName: "gauge_relative_weight",
        args: [address, getVotePeriodEndTime() / 1000]
      },
      {
        ...contract,
        functionName: "vote_user_slopes",
        args: [account || constants.AddressZero, address]
      }
    ],
    enabled: !!address && !!chainId,
  }) as Pop.HookResult<BigNumber[]>
}