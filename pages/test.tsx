import { Contract } from "ethers"
import useOPopDiscount from "lib/OPop/useOPopDiscount"
import useOPopPrice from "lib/OPop/useOPopPrice"
import { RPC_PROVIDERS } from "lib/utils"
import { useState } from "react"
import { getSupportedTokens } from "wido"
import NoSSR from "react-no-ssr";
import axios from "axios"

function DynamicImage() {
  const [image, setImage] = useState<string>("")

  try {
    fetch("https://etherscan.io/token/0xd0cd466b34a24fcb2f87676278af2005ca8a78c4")
      .then(res => res.text())
      .then(res => {
        const i = res.indexOf("js-token-avatar rounded-circle")
        const roughItem = res.slice(i - 100, i)
        const j = roughItem.indexOf('src="')
        const n = roughItem.indexOf('width="32"')
        console.log(`https://etherscan.io/${roughItem.slice(j + 5, n - 2)}`)
        setImage(`https://etherscan.io/${roughItem.slice(j + 5, n - 2)}`)
      })
  } catch (e) { console.log(e) }
  console.log(image)
  return <img src={image} className="w-8 h-8" />
}

export default function Test() {
  axios.get('https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
    headers: {
      'X-CMC_PRO_API_KEY': 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c',
    },
  }).then(res => console.log(res))

  return <>

  </>
}