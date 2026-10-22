export type Category = "length" | "weight" | "volume" | "temperature";
export type Unit = {
  id: string;
  category: Category;
  symbol: string;
  en: string;
  zh: string;
  factor: string;
};
// Exact definitions relative to metres, grams, millilitres and kelvin.
export const units: Unit[] = [
  {
    id: "mm",
    category: "length",
    symbol: "mm",
    en: "Millimeter",
    zh: "毫米",
    factor: "0.001",
  },
  {
    id: "cm",
    category: "length",
    symbol: "cm",
    en: "Centimeter",
    zh: "厘米",
    factor: "0.01",
  },
  {
    id: "m",
    category: "length",
    symbol: "m",
    en: "Meter",
    zh: "米",
    factor: "1",
  },
  {
    id: "km",
    category: "length",
    symbol: "km",
    en: "Kilometer",
    zh: "千米",
    factor: "1000",
  },
  {
    id: "in",
    category: "length",
    symbol: "in",
    en: "Inch",
    zh: "英寸",
    factor: "0.0254",
  },
  {
    id: "ft",
    category: "length",
    symbol: "ft",
    en: "Foot",
    zh: "英尺",
    factor: "0.3048",
  },
  {
    id: "yd",
    category: "length",
    symbol: "yd",
    en: "Yard",
    zh: "码",
    factor: "0.9144",
  },
  {
    id: "mi",
    category: "length",
    symbol: "mi",
    en: "Mile",
    zh: "英里",
    factor: "1609.344",
  },
  {
    id: "mg",
    category: "weight",
    symbol: "mg",
    en: "Milligram",
    zh: "毫克",
    factor: "0.001",
  },
  {
    id: "g",
    category: "weight",
    symbol: "g",
    en: "Gram",
    zh: "克",
    factor: "1",
  },
  {
    id: "kg",
    category: "weight",
    symbol: "kg",
    en: "Kilogram",
    zh: "千克",
    factor: "1000",
  },
  {
    id: "oz",
    category: "weight",
    symbol: "oz",
    en: "Ounce (mass)",
    zh: "盎司（重量）",
    factor: "28.349523125",
  },
  {
    id: "lb",
    category: "weight",
    symbol: "lb",
    en: "Pound",
    zh: "磅",
    factor: "453.59237",
  },
  {
    id: "ml",
    category: "volume",
    symbol: "mL",
    en: "Milliliter",
    zh: "毫升",
    factor: "1",
  },
  {
    id: "l",
    category: "volume",
    symbol: "L",
    en: "Liter",
    zh: "升",
    factor: "1000",
  },
  {
    id: "us-floz",
    category: "volume",
    symbol: "US fl oz",
    en: "US fluid ounce",
    zh: "美制液量盎司",
    factor: "29.5735295625",
  },
  {
    id: "imp-floz",
    category: "volume",
    symbol: "Imperial fl oz",
    en: "Imperial fluid ounce",
    zh: "英制液量盎司",
    factor: "28.4130625",
  },
  {
    id: "us-gal",
    category: "volume",
    symbol: "US gal",
    en: "US liquid gallon",
    zh: "美制液体加仑",
    factor: "3785.411784",
  },
  {
    id: "imp-gal",
    category: "volume",
    symbol: "Imperial gal",
    en: "Imperial gallon",
    zh: "英制加仑",
    factor: "4546.09",
  },
  {
    id: "c",
    category: "temperature",
    symbol: "°C",
    en: "Celsius",
    zh: "摄氏度",
    factor: "1",
  },
  {
    id: "f",
    category: "temperature",
    symbol: "°F",
    en: "Fahrenheit",
    zh: "华氏度",
    factor: "1",
  },
  {
    id: "k",
    category: "temperature",
    symbol: "K",
    en: "Kelvin",
    zh: "开尔文",
    factor: "1",
  },
];
export function unit(id: string): Unit {
  const result = units.find((u) => u.id === id);
  if (!result) throw new Error("unit");
  return result;
}
export const unitsFor = (category: Category) =>
  units.filter((u) => u.category === category);
