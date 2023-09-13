import { veAddresses } from "lib/types";

const veAddresses = {
    POP: "0x2e76177da141D86e10076dABdcc607Eb8054BdC4",
    WETH: "0x2D9B33e9918Dce388d1Cb8Bf09D4E827b899e9d9",
    USDC: "0x0F5f584470b66f53F1C0462969bE64dDD25dDeA4",
    DAI: "0x6e38bB4A2968EF776bDF648025170229b9C71ad5",
    BalancerPool: "0x1050f901A307e7E71471CA3d12dfceA01d0a0A1c",
    BalancerOracle: "0x1493510a056A4B5bE001Dfbb8624E83B55E9a6cc",
    oPOP: "0x14737B576e8F9aE54cb72F69ef1205ECa06f08b9",
    VaultRegistry: "0x141359231649B9Fbeb9bd799bf981F97F959c4B5",
    Vault1POP: "0xf936E7b590851332caf95F6f7f401dE72E89311B",
    Vault2WETH: "0x079072685B587d5f3Bd89F9EeafD0ee03f9788f7",
    Vault3USDC: "0x421830c97Cd323a1b4566B8cDdD79282f11f4fe2",
    Vault4DAI: "0x6E44af35DbdB8Ce2A48D0C09752ee007bF2203E0",
    BoostV2: "0x36915f72E2d26EdADC42B06e2fF7723B127C61A1",
    Minter: "0x6Aa312053A67056261a29E34B68fE683A1151a0e",
    TokenAdmin: "0x314Ac07C01521eA98E366d91d45613Bc7b5C0159",
    VotingEscrow: "0x991C6135D57d17E8ECACE25d4B56108bC2309f77",
    GaugeController: "0xf11826c60417E3d9c965E31c91644b3c08FB04fC",
    GaugeFactory: "0xf03B2b617deBd8392641e5527A08D323a9f8dE9f",
    SmartWalletChecker: "0xDdB110d3a3bb4A0C2506dF9D8234461e41A682F1",
    VotingEscrowDelegation: "0x7ca6c7aF59d00ec8498AEe92517D92e179d3C46b",
    Vault1POPGauge: "0x6c70f4328b7a77A644657138438fbD1240A59a30",
    Vault2WETHGauge: "0x73F846D3d5Ec3bDFF8893c123e9966BdBeA4c00B",
    Vault3USDCGauge: "0x50185e24e6Db0FB08A530752FE828A19776237c1",
    Vault4DAIGauge: "0x744DaBDc35A924705E49d3183A389040e9E0A84A",
    VaultRouter: "0x1DB17afE14732A5267a0839D5f3dE0AF1426cb9E"
};

export function getVeAddresses(): veAddresses {
    return veAddresses as veAddresses;
}