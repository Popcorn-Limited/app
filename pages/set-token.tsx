import Product from "components/landing/Product";
import { Fragment } from "react";

export default function SetToken(): JSX.Element {
  return (
    <div>
      <div className="grid grid-cols-12 mb-8">
        <div className="col-span-12 md:col-span-4">
          <h1 className=" text-5xl md:text-6xl leading-12">Set Token</h1>
          <p className="text-black mt-2 mb-4">Redeem your 3X or Butter Token as its no longer managed.</p>
        </div>
      </div>
      <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:space-x-8">
        <div className="group border rounded md:w-1/3 xl:w-screen lg:max-w-[21.5rem] relative flex flex-col border-warmGray border-opacity-75 .smmd:items-center gap-6 md:gap-8 p-7">
          <div className="col-span-12 md:col-span-4">
            <div className="relative flex flex-row items-center">
              <h2 className="text-black text-4xl leading-9 md:leading-10 mb-2">How to</h2>
            </div>
            <div className="space-y-2">
              <p className="text-primaryDark">
                1. Click on on of the cards to redeem your 3X or Butter for the underlying yearn vault token.
              </p>
              <p className="text-primaryDark">
                2. Visit <a href="https://yearn.finance/vaults" className="text-blue-500">https://yearn.finance/vaults</a> and click on "Holdings" to redeem your vault token for curve lp token or migrate it to yearns new vaults.
              </p>
              <p className="text-primaryDark">
                3. If you redeem your vault token visit <a href="https://curve.fi/#/ethereum/dashboard" className="text-blue-500">https://curve.fi/#/ethereum/dashboard</a> to see your curve lp token and redeem them for stablecoins.
              </p>
            </div>
          </div>
        </div>
        <Product
          title={
            <Fragment>
              Redeem <br className="hidden md:inline" />
              3X
            </Fragment>
          }
          customContent={
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                className="group-hover:fill-[#C391FF]"
                d="M15 29.9999C23.2842 29.9999 30 23.2842 30 14.9999C30 6.71567 23.2842 -6.10352e-05 15 -6.10352e-05C6.71572 -6.10352e-05 0 6.71567 0 14.9999C0 23.2842 6.71572 29.9999 15 29.9999Z"
                fill="black"
              />
              <path
                className="group-hover:fill-[#C391FF]"
                d="M45 29.9999C53.2842 29.9999 60 23.2842 60 14.9999C60 6.71567 53.2842 -6.10352e-05 45 -6.10352e-05C36.7157 -6.10352e-05 30 6.71567 30 14.9999C30 23.2842 36.7157 29.9999 45 29.9999Z"
                fill="black"
              />
              <path
                className="group-hover:fill-[#C391FF]"
                d="M59.9999 29.9999C59.9999 46.5687 46.5687 59.9999 30 59.9999C13.4312 59.9999 0 46.5687 0 29.9999H59.9999Z"
                fill="black"
              />
            </svg>
          }
          description="Bring your 3X token and redeem it for yearns 3EUR and sUSD vault token."
          route="https://www.tokensets.com/#/v2/set/0x8b97ADE5843c9BE7a1e8c95F32EC192E31A46cf3"
        />
        <Product
          title={
            <Fragment>
              Redeem <br className="hidden md:inline" />
              Butter
            </Fragment>
          }
          customContent={
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                className="group-hover:fill-pink-400"
                d="M45 0C36.7163 0 30 6.71625 30 15C30 6.71625 23.2837 0 15 0C6.71625 0 0 6.71625 0 15V30C0 46.5687 13.4312 60 30 60C21.7163 60 15 53.2837 15 45H22.5C18.3575 45 15 41.6425 15 37.5C15 33.3575 18.3575 30 22.5 30C26.6425 30 30 33.3575 30 37.5C30 33.3575 33.3575 30 37.5 30C41.6425 30 45 33.3575 45 37.5C45 41.6425 41.6425 45 37.5 45H45C45 53.2837 38.2837 60 30 60C46.5687 60 60 46.5687 60 30V15C60 6.71625 53.2837 0 45 0ZM30 37.5C30 41.6425 26.6425 45 22.5 45H37.5C33.3575 45 30 41.6425 30 37.5Z"
                fill="black"
              />
            </svg>
          }
          description="Redeem Butter for alUSD, mUSD,RAI and FRAX yearn vault token."
          route="https://www.tokensets.com/#/v2/set/0x109d2034e97eC88f50BEeBC778b5A5650F98c124"
        />
      </div>
    </div>
  );
}