import { useRouter } from "next/router";

export const useProductLinks = () => {
  const router = useRouter();

  return [
    {
      title: "Sweet Vaults",
      url: "/sweet-vaults",
      currentlySelected: router?.pathname === "/sweet-vaults",
      hidden: false
    },
    {
      title: "Staking",
      url: "/staking",
      currentlySelected: router?.pathname === "/staking",
    },
    {
      title: "3X | Butter",
      url: "/set-token",
      currentlySelected: router?.pathname === "/set-token",
    },
  ];
};
