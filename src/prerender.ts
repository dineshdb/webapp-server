import { Oak } from "../deps.ts";

export const botUserAgents = [
  "Baiduspider",
  "bingbot",
  "Embedly",
  "facebookexternalhit",
  "LinkedInBot",
  "outbrain",
  "pinterest",
  "quora link preview",
  "rogerbot",
  "showyoubot",
  "Slackbot",
  "TelegramBot",
  "Twitterbot",
  "vkShare",
  "W3C_Validator",
  "WhatsApp",
  "wget",
  "viber",
  "Skype",
].join("|");

const staticFileExtensions = [
  "ai",
  "avi",
  "css",
  "dat",
  "dmg",
  "doc",
  "doc",
  "exe",
  "flv",
  "gif",
  "ico",
  "iso",
  "jpeg",
  "jpg",
  "js",
  "less",
  "m4a",
  "m4v",
  "mov",
  "mp3",
  "mp4",
  "mpeg",
  "mpg",
  "pdf",
  "png",
  "ppt",
  "psd",
  "rar",
  "rss",
  "svg",
  "swf",
  "tif",
  "torrent",
  "ttf",
  "txt",
  "wav",
  "wmv",
  "woff",
  "xls",
  "xml",
  "zip",
];

export function middleware(url: string) {
  const userAgentPattern = new RegExp(botUserAgents, "i");
  const excludeUrlPattern = new RegExp(
    `\\.(${staticFileExtensions.join("|")})$`,
    "i",
  );
  return async (ctx: Oak.Context, next: () => unknown) => {
    const ua = ctx.request.headers.get("user-agent") ?? "";
    if (
      !ua ||
      !userAgentPattern.test(ua) ||
      excludeUrlPattern.test(ctx.request.url.pathname)
    ) {
      return next();
    }
    const res = await fetch(
      url.replace("%s", encodeURIComponent(ctx.request.url.href)),
    );
    ctx.response.body = res.body;
  };
}
