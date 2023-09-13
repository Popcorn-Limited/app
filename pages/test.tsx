import { BigNumber, Contract, constants, ethers } from "ethers"
import { parseUnits } from "ethers/lib/utils.js"
import useOPopDiscount from "lib/OPop/useOPopDiscount"
import useOPopPrice from "lib/OPop/useOPopPrice"
import { RPC_PROVIDERS } from "lib/utils"
import { getVeAddresses } from "lib/utils/addresses"
import GaugeControllerAbi from "lib/utils/constants/abi/GaugeController"
import LiquidityGaugeAbi from "lib/utils/constants/abi/LiquidityGauge"
import { useState } from "react"

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses()

const thisPeriodTimestamp = () => {
  const week = 604800 * 1000;
  return (Math.floor(Date.now() / week) * week) / 1000;
};

const provider = RPC_PROVIDERS[5];

async function getGaugeData(_gauge) {
  const gaugeContract = new Contract(_gauge, LiquidityGaugeAbi, provider);

  const is_killed = await gaugeContract.is_killed();
  const inflation_rate = await gaugeContract.inflation_rate();
  const relative_weight = await gaugeContract.getCappedRelativeWeight(thisPeriodTimestamp());
  const tokenless_production = await gaugeContract.tokenless_production();
  const working_supply = await gaugeContract.working_supply();

  return [is_killed, inflation_rate.div(1e18), relative_weight.div(1e18), tokenless_production, working_supply.div(1e18)];
}

async function getGaugeControllerData(_gauge) {
  const gaugeControllerContract = new Contract(GAUGE_CONTROLLER, GaugeControllerAbi, provider);

  const gauge_exists = await gaugeControllerContract.gauge_exists(_gauge);

  return [gauge_exists];
}

async function calculateAPR(vaultAddress, gaugeAddress) {
  /// fetch the price of token0, token1 and LIT in USD
  const popPriceUSD = parseUnits("1") // TODO fetch pop price

  /// calculate the price of the vaultToken in USD
  const vaultTokenPriceUSD = parseUnits("1") // TODO calculate PPS * price

  /// calculate the lowerAPR and upperAPR
  let lowerAPR = constants.Zero;
  let upperAPR = constants.Zero;

  if (gaugeAddress) {
    const [is_killed, inflation_rate, relative_weight, tokenless_production, working_supply] = await getGaugeData(gaugeAddress);
    const [gauge_exists] = await getGaugeControllerData(gaugeAddress);

    /// @dev the price of oPOP is determined by applying the discount factor to the POP price.
    /// as of this writing, the discount factor of 50% but is subject to change. Additional dev
    /// work is needed to programmatically apply the discount factor at any given point in time.
    const oPopPriceUSD = popPriceUSD.mul(0.5);

    if (gauge_exists == true && is_killed == false) {
      const relative_inflation = inflation_rate.mul(relative_weight);
      if (relative_inflation.gt(0)) {
        const annualRewardUSD = relative_inflation.mul(86400).mul(365).mul(oPopPriceUSD);
        const effectiveSupply = working_supply.gt(0) ? working_supply : parseUnits("1");
        const workingSupplyUSD = effectiveSupply.mul(vaultTokenPriceUSD);

        lowerAPR = annualRewardUSD.mul(tokenless_production).div(100).div(workingSupplyUSD).mul(100);
        upperAPR = annualRewardUSD.div(workingSupplyUSD).mul(100);
      }
    }
  } else {
    console.log('~~~~~ No Gauge Found ~~~~~');
    return;
  }

  console.log(`lowerAPR: ${Number(lowerAPR).toFixed(2)}%`);
  console.log(`upperAPR: ${Number(upperAPR).toFixed(2)}%`);

  return [lowerAPR, upperAPR];
}

export default function Test() {


  return <>

  </>
}