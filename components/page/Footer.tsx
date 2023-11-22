import Link from "next/link";
import React from "react";
import SocialMediaLinks from "../SocialMediaLinks";

type FooterLink = {
  label: string;
  href: string;
}

const ProductLinks = [
  {
    label: "Smart Vaults",
    href: "/vaults",
  },
  {
    label: "Staking",
    href: "https://archive.pop.network/staking",
  },
  {
    label: "Set Token",
    href: "https://archive.pop.network/set-token",
  },
];

const GeneralLinks = [
  {
    label: "Popcorn",
    href: "/",
  },
  {
    label: "Gitbook",
    href: "https://docs.vaultcraft.io/welcome-to-vaultcraft/introduction",
  },
  {
    label: "Disclaimer",
    href: "/disclaimer",
  },
];

const BugBountyLinks = [
  {
    label: "Immunefi",
    href: "https://immunefi.com/bounty/popcorn",
  },
];


const Footer = () => {
  return (
    <footer className="flex flex-col md:flex-row py-12 px-8">
      <div className="w-full md:w-1/4 mr-8">
        <div className="flex flex-row">
          <Link href={`/`} passHref>
            <img src="/images/icons/popLogo.svg" alt="Logo" className="hidden md:block w-10 h-10 mr-10" />
          </Link>
          <p className="text-primaryDark leading-6 mt-8 smmd:mt-0">
            Popcorn is a DeFi yield-optimizing protocol with customizable asset strategies that instantly zap your crypto from any chain into the highest yield-generating products across DeFi in 1 click.
          </p>
        </div>
        <div className="flex flex-row space-x-6 mt-12">
          <SocialMediaLinks />
        </div>
      </div>

      <div className="w-full md:w-3/4 flex md:flex-row space-x-4 md:space-x-44 mt-8 md:mt-0">
        <div>
          <p className="text-gray-900 font-medium leading-6 tracking-1">Products</p>
          <div className="flex flex-col">
            {ProductLinks.map((link: FooterLink) =>
              <Link
                key={link.label}
                href={link.href}
                passHref
                target="_blank"
                className=" text-primary hover:text-black leading-6 mt-4"
              >
                {link.label}
              </Link>
            )}
          </div>
        </div>

        <div>
          <p className="text-gray-900 font-medium leading-6 tracking-1">Links</p>
          <div className="flex flex-col">
            {GeneralLinks.map((link: FooterLink) =>
              <Link
                key={link.label}
                href={link.href}
                passHref
                target="_blank"
                className=" text-primary hover:text-black leading-6 mt-4"
              >
                {link.label}
              </Link>
            )}
          </div>
        </div>

        <div>
          <p className="text-gray-900 font-medium leading-6 tracking-1">Bug Bounty</p>
          <div className="flex flex-col">
            {BugBountyLinks.map((link: FooterLink) =>
              <Link
                key={link.label}
                href={link.href}
                passHref
                target="_blank"
                className=" text-primary hover:text-black leading-6 mt-4"
              >
                {link.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
