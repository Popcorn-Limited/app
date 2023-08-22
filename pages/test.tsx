import { Contract } from "ethers"
import useOPopDiscount from "lib/OPop/useOPopDiscount"
import useOPopPrice from "lib/OPop/useOPopPrice"
import { RPC_PROVIDERS } from "lib/utils"
import {getSupportedTokens} from "wido"

export default function Test() {

  getSupportedTokens({
    chainId: [1],  // (Optional) Array of chain ids to filter by
    protocol: ["pop.network"]  // (Optional) Array of protocols to filter by
}).then(res => console.log(res))
  return <></>
}