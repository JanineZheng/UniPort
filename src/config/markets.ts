import type { Category } from "../core/units";
export type Locale = "zh" | "en";
export type City = { zone: string; zh: string; en: string };
export type Market = {
  code: string;
  flag: string;
  zh: string;
  en: string;
  currency: string;
  recommended: Record<Category, string>;
  cities: City[];
};
const metric = { length: "cm", weight: "kg", volume: "ml", temperature: "c" };
export const markets: Market[] = [
  {
    code: "CN",
    flag: "🇨🇳",
    zh: "中国",
    en: "China",
    currency: "CNY",
    recommended: metric,
    cities: [
      { zone: "Asia/Shanghai", zh: "上海 / 北京", en: "Shanghai / Beijing" },
      {
        zone: "Asia/Urumqi",
        zh: "乌鲁木齐（新疆时间）",
        en: "Urumqi (Xinjiang time)",
      },
    ],
  },
  {
    code: "US",
    flag: "🇺🇸",
    zh: "美国",
    en: "United States",
    currency: "USD",
    recommended: {
      length: "in",
      weight: "lb",
      volume: "us-floz",
      temperature: "f",
    },
    cities: [
      { zone: "America/Los_Angeles", zh: "洛杉矶", en: "Los Angeles" },
      { zone: "America/New_York", zh: "纽约", en: "New York" },
      { zone: "America/Chicago", zh: "芝加哥", en: "Chicago" },
      { zone: "America/Denver", zh: "丹佛", en: "Denver" },
      { zone: "America/Phoenix", zh: "凤凰城", en: "Phoenix" },
      { zone: "America/Anchorage", zh: "安克雷奇", en: "Anchorage" },
      { zone: "Pacific/Honolulu", zh: "檀香山", en: "Honolulu" },
    ],
  },
  {
    code: "GB",
    flag: "🇬🇧",
    zh: "英国",
    en: "United Kingdom",
    currency: "GBP",
    recommended: metric,
    cities: [{ zone: "Europe/London", zh: "伦敦", en: "London" }],
  },
  {
    code: "JP",
    flag: "🇯🇵",
    zh: "日本",
    en: "Japan",
    currency: "JPY",
    recommended: metric,
    cities: [{ zone: "Asia/Tokyo", zh: "东京", en: "Tokyo" }],
  },
  {
    code: "DE",
    flag: "🇩🇪",
    zh: "德国",
    en: "Germany",
    currency: "EUR",
    recommended: metric,
    cities: [{ zone: "Europe/Berlin", zh: "柏林", en: "Berlin" }],
  },
  {
    code: "FR",
    flag: "🇫🇷",
    zh: "法国",
    en: "France",
    currency: "EUR",
    recommended: metric,
    cities: [{ zone: "Europe/Paris", zh: "巴黎", en: "Paris" }],
  },
  {
    code: "CA",
    flag: "🇨🇦",
    zh: "加拿大",
    en: "Canada",
    currency: "CAD",
    recommended: metric,
    cities: [
      { zone: "America/Toronto", zh: "多伦多", en: "Toronto" },
      { zone: "America/Vancouver", zh: "温哥华", en: "Vancouver" },
      { zone: "America/St_Johns", zh: "圣约翰斯", en: "St. John's" },
    ],
  },
  {
    code: "AU",
    flag: "🇦🇺",
    zh: "澳大利亚",
    en: "Australia",
    currency: "AUD",
    recommended: metric,
    cities: [
      { zone: "Australia/Sydney", zh: "悉尼", en: "Sydney" },
      { zone: "Australia/Perth", zh: "珀斯", en: "Perth" },
      { zone: "Australia/Lord_Howe", zh: "豪勋爵岛", en: "Lord Howe Island" },
    ],
  },
  {
    code: "BR",
    flag: "🇧🇷",
    zh: "巴西",
    en: "Brazil",
    currency: "BRL",
    recommended: metric,
    cities: [
      { zone: "America/Sao_Paulo", zh: "圣保罗", en: "São Paulo" },
      { zone: "America/Manaus", zh: "马瑙斯", en: "Manaus" },
    ],
  },
  {
    code: "KR",
    flag: "🇰🇷",
    zh: "韩国",
    en: "South Korea",
    currency: "KRW",
    recommended: metric,
    cities: [{ zone: "Asia/Seoul", zh: "首尔", en: "Seoul" }],
  },
  {
    code: "AE",
    flag: "🇦🇪",
    zh: "阿联酋",
    en: "United Arab Emirates",
    currency: "AED",
    recommended: metric,
    cities: [{ zone: "Asia/Dubai", zh: "迪拜", en: "Dubai" }],
  },
  {
    code: "IN",
    flag: "🇮🇳",
    zh: "印度",
    en: "India",
    currency: "INR",
    recommended: metric,
    cities: [
      { zone: "Asia/Kolkata", zh: "孟买 / 新德里", en: "Mumbai / New Delhi" },
    ],
  },
];
export const market = (code: string) => markets.find((m) => m.code === code)!;
