import DiscordIcon from "@/components/svg/DiscordIcon";
import MediumIcon from "@/components/svg/MediumIcon";
import RedditIcon from "@/components/svg/RedditIcon";
import TelegramIcon from "@/components/svg/TelegramIcon";
import TwitterIcon from "@/components/svg/TwitterIcon";
import YoutubeIcon from "@/components/svg/YoutubeIcon";

export default function SocialMediaLinks() {
  return <>
    <a href="https://twitter.com/Popcorn_DAO">
      <TwitterIcon color={"#645F4B"} size={"24"} />
    </a>
    <a href="https://discord.gg/NYgNA6wv">
      <DiscordIcon color={"#645F4B"} size={"24"} />
    </a>
    <a href="https://t.me/popcorndaochat">
      <TelegramIcon color={"#645F4B"} size={"24"} />
    </a>
    <a href="https://medium.com/popcorndao">
      <MediumIcon color={"#645F4B"} size={"24"} />
    </a>
    <a href="https://www.reddit.com/r/popcorndao/">
      <RedditIcon color={"#645F4B"} size={"24"} />
    </a>
    <a href="https://www.youtube.com/channel/UCe8n8mGG4JR7nhFT4v9APyA">
      <YoutubeIcon color={"#645F4B"} size={"24"} />
    </a>
  </>
}