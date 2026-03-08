import { Character } from "@/types";

export const characters: Character[] = [
  // N（ノーマル）× 4体
  {
    id: "sugicchi",
    name: "スギっち",
    rarity: "N",
    motif: "スギ花粉",
    description: "日本の花粉症の代名詞。春になると猛威を振るう。",
    quote: "春の定番、スギだよ〜",
    imageUrl: "/characters/sugicchi.png",
  },
  {
    id: "hinokking",
    name: "ヒノキング",
    rarity: "N",
    motif: "ヒノキ花粉",
    description: "スギの後を追うようにやってくる、ヒノキ花粉の化身。",
    quote: "スギの後にやってくるぜ",
    imageUrl: "/characters/hinokking.png",
  },
  {
    id: "butakusan",
    name: "ブタクサン",
    rarity: "N",
    motif: "ブタクサ花粉",
    description: "秋の花粉症の主犯格。油断した隙に襲いかかる。",
    quote: "秋も油断するなよ〜",
    imageUrl: "/characters/butakusan.png",
  },
  {
    id: "kamogayar",
    name: "カモガヤー",
    rarity: "N",
    motif: "カモガヤ花粉",
    description: "イネ科花粉の代表選手。初夏から秋まで活動する。",
    quote: "イネ科代表、参上！",
    imageUrl: "/characters/kamogayar.png",
  },

  // R（レア）× 3体
  {
    id: "inetchi",
    name: "イネッチ",
    rarity: "R",
    motif: "イネ花粉",
    description: "田んぼから生まれた花粉モンスター。穏やかだが油断は禁物。",
    quote: "田んぼからこんにちは",
    imageUrl: "/characters/inetchi.png",
  },
  {
    id: "yomogirasu",
    name: "ヨモギラス",
    rarity: "R",
    motif: "ヨモギ花粉",
    description: "秋の伏兵。ヨモギ餅は美味しいが花粉は厄介。",
    quote: "秋の伏兵、ヨモギだ！",
    imageUrl: "/characters/yomogirasu.png",
  },
  {
    id: "shirakabaron",
    name: "シラカバロン",
    rarity: "R",
    motif: "シラカバ花粉",
    description: "北海道を中心に活動する貴族的花粉モンスター。",
    quote: "北海道の貴公子",
    imageUrl: "/characters/shirakabaron.png",
  },

  // SR（スーパーレア）× 2体
  {
    id: "hanamizuking",
    name: "ハナミズキング",
    rarity: "SR",
    motif: "ハナミズキ花粉",
    description: "花粉界の隠れたボス。美しい花の裏に潜む脅威。",
    quote: "花粉界の隠れボス",
    imageUrl: "/characters/hanamizuking.png",
  },
  {
    id: "matsudaioh",
    name: "マツダイオー",
    rarity: "SR",
    motif: "マツ花粉",
    description: "巨大な花粉粒を持つ帝王。その存在感は圧倒的。",
    quote: "巨大花粉の帝王",
    imageUrl: "/characters/matsudaioh.png",
  },

  // SSR（超激レア）× 1体
  {
    id: "kafun-daimaoh",
    name: "花粉大魔王",
    rarity: "SSR",
    motif: "全花粉の融合体",
    description:
      "すべての花粉が融合して生まれた究極のモンスター。花粉症患者の最大の敵。",
    quote: "すべての花粉を統べる者…",
    imageUrl: "/characters/kafun-daimaoh.png",
  },
];

export const getCharactersByRarity = (rarity: string) =>
  characters.filter((c) => c.rarity === rarity);
