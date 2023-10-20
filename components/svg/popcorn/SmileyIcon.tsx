import { IconProps } from "@/lib/types"


const SmileyIcon: React.FC<IconProps> = ({ color, size, className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 60 61" fill="none">
      <path d="M15 30.2519C23.2842 30.2519 30 23.5362 30 15.252C30 6.96768 23.2842 0.251953 15 0.251953C6.71572 0.251953 0 6.96768 0 15.252C0 23.5362 6.71572 30.2519 15 30.2519Z" fill={color} className={className} />
      <path d="M45 30.2519C53.2842 30.2519 60 23.5362 60 15.252C60 6.96768 53.2842 0.251953 45 0.251953C36.7157 0.251953 30 6.96768 30 15.252C30 23.5362 36.7157 30.2519 45 30.2519Z" fill={color} className={className} />
      <path d="M59.9999 30.252C59.9999 46.8207 46.5687 60.2519 30 60.2519C13.4312 60.2519 0 46.8207 0 30.252H59.9999Z" fill={color} className={className} />
    </svg>
  )
}

export default SmileyIcon;