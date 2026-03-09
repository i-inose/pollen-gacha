export interface Prefecture {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const prefectures: Prefecture[] = [
  { id: "hokkaido", name: "北海道", lat: 43.06, lon: 141.35 },
  { id: "aomori", name: "青森県", lat: 40.82, lon: 140.74 },
  { id: "iwate", name: "岩手県", lat: 39.70, lon: 141.15 },
  { id: "miyagi", name: "宮城県", lat: 38.27, lon: 140.87 },
  { id: "akita", name: "秋田県", lat: 39.72, lon: 140.10 },
  { id: "yamagata", name: "山形県", lat: 38.24, lon: 140.34 },
  { id: "fukushima", name: "福島県", lat: 37.75, lon: 140.47 },
  { id: "ibaraki", name: "茨城県", lat: 36.34, lon: 140.45 },
  { id: "tochigi", name: "栃木県", lat: 36.57, lon: 139.88 },
  { id: "gunma", name: "群馬県", lat: 36.39, lon: 139.06 },
  { id: "saitama", name: "埼玉県", lat: 35.86, lon: 139.65 },
  { id: "chiba", name: "千葉県", lat: 35.61, lon: 140.12 },
  { id: "tokyo", name: "東京都", lat: 35.68, lon: 139.69 },
  { id: "kanagawa", name: "神奈川県", lat: 35.45, lon: 139.64 },
  { id: "niigata", name: "新潟県", lat: 37.90, lon: 139.02 },
  { id: "toyama", name: "富山県", lat: 36.70, lon: 137.21 },
  { id: "ishikawa", name: "石川県", lat: 36.59, lon: 136.63 },
  { id: "fukui", name: "福井県", lat: 36.07, lon: 136.22 },
  { id: "yamanashi", name: "山梨県", lat: 35.66, lon: 138.57 },
  { id: "nagano", name: "長野県", lat: 36.23, lon: 138.18 },
  { id: "gifu", name: "岐阜県", lat: 35.39, lon: 136.72 },
  { id: "shizuoka", name: "静岡県", lat: 34.98, lon: 138.38 },
  { id: "aichi", name: "愛知県", lat: 35.18, lon: 136.91 },
  { id: "mie", name: "三重県", lat: 34.73, lon: 136.51 },
  { id: "shiga", name: "滋賀県", lat: 35.00, lon: 135.87 },
  { id: "kyoto", name: "京都府", lat: 35.02, lon: 135.76 },
  { id: "osaka", name: "大阪府", lat: 34.69, lon: 135.52 },
  { id: "hyogo", name: "兵庫県", lat: 34.69, lon: 135.18 },
  { id: "nara", name: "奈良県", lat: 34.69, lon: 135.83 },
  { id: "wakayama", name: "和歌山県", lat: 34.23, lon: 135.17 },
  { id: "tottori", name: "鳥取県", lat: 35.50, lon: 134.24 },
  { id: "shimane", name: "島根県", lat: 35.47, lon: 133.05 },
  { id: "okayama", name: "岡山県", lat: 34.66, lon: 133.93 },
  { id: "hiroshima", name: "広島県", lat: 34.40, lon: 132.46 },
  { id: "yamaguchi", name: "山口県", lat: 34.19, lon: 131.47 },
  { id: "tokushima", name: "徳島県", lat: 34.07, lon: 134.56 },
  { id: "kagawa", name: "香川県", lat: 34.34, lon: 134.04 },
  { id: "ehime", name: "愛媛県", lat: 33.84, lon: 132.77 },
  { id: "kochi", name: "高知県", lat: 33.56, lon: 133.53 },
  { id: "fukuoka", name: "福岡県", lat: 33.61, lon: 130.42 },
  { id: "saga", name: "佐賀県", lat: 33.25, lon: 130.30 },
  { id: "nagasaki", name: "長崎県", lat: 32.74, lon: 129.87 },
  { id: "kumamoto", name: "熊本県", lat: 32.79, lon: 130.74 },
  { id: "oita", name: "大分県", lat: 33.24, lon: 131.61 },
  { id: "miyazaki", name: "宮崎県", lat: 31.91, lon: 131.42 },
  { id: "kagoshima", name: "鹿児島県", lat: 31.56, lon: 130.56 },
  { id: "okinawa", name: "沖縄県", lat: 26.34, lon: 127.68 },
];

export function getPrefecture(id: string): Prefecture | undefined {
  return prefectures.find((p) => p.id === id);
}

export function getPrefectureName(id: string): string {
  return prefectures.find((p) => p.id === id)?.name ?? id;
}
