import { IconProps } from "@/lib/types"


const PopIcon: React.FC<IconProps> = ({ color, size, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.8465 35.9995C24.8465 29.3729 19.4743 23.9999 12.8468 23.9999C6.21934 23.9999 0.847168 29.3729 0.847168 35.9995C0.847168 42.627 6.21934 48 12.8468 48C19.4743 48 24.8465 42.6262 24.8465 35.9995Z" fill={color} className={className} />
      <path d="M28.3616 44.485C33.048 49.1714 40.646 49.1714 45.3316 44.485C50.0172 39.7986 50.0181 32.1998 45.3316 27.5142L28.3616 44.485Z" fill={color} className={className} />
      <path d="M33.3319 32.4853C38.0184 27.7989 38.0184 20.2009 33.3319 15.5145C28.6455 10.828 21.0475 10.828 16.3611 15.5145L33.3319 32.4853Z" fill={color} className={className} />
      <path d="M45.3316 20.4857C50.0181 15.7993 50.0181 8.2013 45.3316 3.51568C40.6452 -1.17075 33.0472 -1.17075 28.3616 3.51568L45.3316 20.4857Z" fill={color} className={className} />
      <path d="M21.3325 3.51482C16.6461 -1.17161 9.0481 -1.17161 4.36248 3.51482C-0.323951 8.20125 -0.323951 15.7993 4.36248 20.4849L21.3325 3.51482Z" fill={color} className={className} />
    </svg>
  )
}

export default PopIcon;
