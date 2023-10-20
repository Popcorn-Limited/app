import Link from "next/link";

interface NavbarLinkProps {
  label: string;
  url?: string;
  isActive: boolean;
  onClick?: Function;
  target?: string;
  hidden?: boolean;
}

export default function NavbarLink({ label, url, isActive, onClick, target }: NavbarLinkProps): JSX.Element {
  // TODO -- ask enialo how hover and active should differ
  const className = `leading-5 font-bold text-lg ${isActive ? "text-black" : "text-black"} 
    hover:text-black cursor-pointer`;
  return (
    <>
      <span className={`${!url ? "" : "hidden"}`}>
        <a
          className={className}
          target={target || "_self"}
          onClick={(e) => {
            onClick && onClick();
          }}
        >
          {label}
        </a>
      </span>
      <span className={`${url ? "" : "hidden"}`}>
        <Link
          href={url ? url : "#"}
          passHref
          className={className}
          target={target || "_self"}
          onClick={(e) => {
            onClick && onClick();
          }}
        >
          {label}
        </Link>
      </span>
    </>
  );
};