import { veAddresses } from "lib/types";

const VeAddresses = {
    POP: "0xD0Cd466b34A24fcB2f87676278AF2005Ca8A78c4",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    BalancerPool: "0xd5A44704beFD1CfCCa67F7bc498a7654cC092959", 
    BalancerOracle: "0x0124a1697e207De725cd1e7b40aa9b0Ed37Ed5de",
    oPOP: "0xDfFA4D3ed6B433810354430464a5C00b6ea0F1dF",
    VaultRegistry: "0x007318Dc89B314b47609C684260CfbfbcD412864",
    Vault1DAI: "0x5d344226578DC100b2001DA251A4b154df58194f",
    Vault2USDC: "0xc1D4a319dD7C44e332Bd54c724433C6067FeDd0D",
    Vault3OUSD: "0xc8C88fdF2802733f8c4cd7c0bE0557fdC5d2471c",
    BoostV2: "0x9e607c0612cc44298F843288124FaCD19246022B",
    Minter: "0xD37578f51CD8E66819C3689a9Af540Ca2a0AfF04",
    TokenAdmin: "0xd00053501355298b8F5bAcC0610c396e127d974a",
    VotingEscrow: "0xF7D4B9152CaDD0992e35152b315081De23133c7A",
    GaugeController: "0xD7fFc91eb0a7db28FaED4eb2747cb5153F301f55",
    GaugeFactory: "0x54AC26a8fD403F63Df2f0094307Eba90A0Ef7D64",
    SmartWalletChecker: "0xD036025237aE258d53862A3c36461145683ef506",
    VotingEscrowDelegation: "0x212a09F7E81781F045bb065f95c498c2D9C68507",
    Vault1DAIGauge: "0x56b01649cc12711a568775a83ecb5129502d40fa",
    Vault2USDCGauge: "0x5d0525137402240bc11dfa36d82260c39839c337",
    Vault3OUSDGauge: "0x91af5f8869be163a973c054daa30a84bf7f8f405",
    VaultRouter: "0x8aed8Ea73044910760E8957B6c5b28Ac51f8f809",
    FeeDistributor: "0x2661cdddb673DDcF2e0bc0dD7Fd432fCF1fe9e74"
};

export function getVeAddresses(): veAddresses {
    return VeAddresses as veAddresses;
}
