const { join } = require("path");
require("./lib/utils/env/envLoader");

const workspace = join(__dirname, "..");

module.exports = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    PINATA_API_SECRET: process.env.PINATA_API_SECRET,
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    IPFS_URL: process.env.IPFS_URL,
    DUNE_API_KEY: process.env.DUNE_API_KEY,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    ENSO_API_KEY:process.env.ENSO_API_KEY,
  },
  images: {
    domains: ["rawcdn.githack.com"],
  },
  async redirects() {
    return [
      {
        source: "/ethereum/staking",
        destination: `/staking`,
        permanent: true,
      },
      {
        source: "/polygon/staking",
        destination: `/staking`,
        permanent: true,
      },
      {
        source: "/ethereum/rewards",
        destination: `/rewards`,
        permanent: true,
      },
      {
        source: "/polygon/rewards",
        destination: `/rewards`,
        permanent: true,
      },
      {
        source: "/ethereum",
        destination: `/`,
        permanent: true,
      },
      {
        source: "/polygon",
        destination: `/`,
        permanent: true,
      },
      {
        source:
          "/api.zerion.io/v1/fungibles/0x1e19cf2d73a72ef1332c882f20534b6519be0276",
        destination:
          "https://api.zerion.io/v1/fungibles/0x1e19cf2d73a72ef1332c882f20534b6519be0276/?currency=usd",
        permanent: true,
      },
    ];
  },
  poweredByHeader: false,
  webpack: (config, options) => {
    /** Allows import modules from packages in workspace. */
    //config.externals = { ...config.externals, electron: 'electron' };
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: [workspace],
          exclude: /node_modules/,
          use: options.defaultLoaders.babel,
        },
      ],
    };
    return config;
  },
};
