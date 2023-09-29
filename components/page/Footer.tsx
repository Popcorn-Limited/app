import Link from "next/link";
import React from "react";
import SocialMediaLinks from "../SocialMediaLinks";

const Footer = () => {
  return (
    <footer className="grid grid-cols-12 smmd:gap-14 pb-10 mt-20 font-landing px-6 md:px-8">
      <div className="col-span-12 lg:col-span-3 order-1 smmd:order-1">
        <div className="bg-customYellow rounded-lg py-3 text-center font-medium text-black">
          Subscribe to our newsletter
        </div>
      </div>
      <div className="col-span-12 smmd:col-span-6 flex flex-col justify-between order-3 smmd:order-2 mt-12 smmd:mt-0">
        <p className=" text-primaryDark leading-6 order-2 smmd:order-1 mt-8 smmd:mt-0">
          Popcorn is an audited, non-custodial DeFi wealth manager with yield-generating products that simultaneously fund nonprofits and social impact organizations.
        </p>
        <div className="flex justify-between smmd:justify-start smmd:gap-7 order-1 smmd:order-2">
          <SocialMediaLinks />
        </div>
      </div>

      <div className="col-span-12 smmd:col-span-6 lg:col-span-3 flex flex-col smmd:flex-row  gap-12 smmd:gap-0 smmd:justify-between order-2 smmd:order-3 mt-12 smmd:mt-0">
        <div>
          <p className="text-gray-900 font-medium leading-6 tracking-1">Links</p>
          <div className="flex flex-col">
            <Link href="/" className=" text-primary hover:text-black leading-6 mt-4">
              Popcorn
            </Link>
            <Link
              href="/docs/Popcorn_whitepaper_v1.pdf"
              target="_blank"
              className=" text-primary hover:text-black leading-6 mt-4"
            >
              Whitepaper
            </Link>
            <Link
              href="https://popcorn-dao.gitbook.io/popcorndao-gitbook/about-popcorn/welcome-to-popcorn"
              target="_blank"
              className=" text-primary hover:text-black leading-6 mt-4"
            >
              Gitbook
            </Link>
            <Link
              href="/disclaimer"
              target="_blank"
              className=" text-primary hover:text-black leading-6 mt-4"
            >
              Disclaimer
            </Link>
          </div>
        </div>

        <div>
          <p className="text-gray-900 font-medium leading-6 tracking-1">Bug Bounty</p>
          <div className="flex flex-col">
            <Link
              href="https://immunefi.com/bounty/popcorn"
              passHref
              target="_blank"
              className=" text-primary hover:text-black leading-6 mt-4"
            >
              Immunefi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
