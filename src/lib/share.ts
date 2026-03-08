import { Character, PollenLevel } from "@/types";
import { pollenLevelLabels, pollenLevelEmojis } from "@/data/pollen";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pollen-gacha.vercel.app";

export function getShareText(character: Character, pollenLevel: PollenLevel): string {
  return `🌸 花粉ガチャで【${character.rarity}】${character.name} を引いたよ！
今日の花粉レベル：${pollenLevelEmojis[pollenLevel]} ${pollenLevelLabels[pollenLevel]}
${pollenLevel >= 3 ? "花粉が多い日はレアキャラのチャンス！\n" : ""}
#花粉ガチャ #花粉症`;
}

export function shareToX(character: Character, pollenLevel: PollenLevel): void {
  const text = getShareText(character, pollenLevel);
  const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(APP_URL)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function shareToFacebook(character: Character, pollenLevel: PollenLevel): void {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}&quote=${encodeURIComponent(getShareText(character, pollenLevel))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
