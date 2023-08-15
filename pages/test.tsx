import { Contract } from "ethers"
import useOPopDiscount from "lib/OPop/useOPopDiscount"
import useOPopPrice from "lib/OPop/useOPopPrice"
import { RPC_PROVIDERS } from "lib/utils"

export default function Test() {

  const c = new Contract("0x4b4a8479CDFaB077BA4D0926041D10098f18bFe7", ["function getPrice() view returns (uint256)", "function multiplier() view returns (uint16)", "function balancerTwapOracle() view returns (address)"], RPC_PROVIDERS[5])
  c.getPrice().then(res => console.log(res))

  const { data: oPopDiscount } = useOPopDiscount({ chainId: 5, address: "0x4b4a8479CDFaB077BA4D0926041D10098f18bFe7" })
  console.log({ oPopDiscount })
  return <></>
}