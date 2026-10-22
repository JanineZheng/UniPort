import { useEffect, useState } from "react";
import { markets, market } from "./config/markets";
import type { Category } from "./core/units";
import { unit } from "./core/units";
import { convert, format } from "./core/convert";
import { convertSpecs } from "./core/specs";
import {
  describeTime,
  localInput,
  offsetLabel,
  resolveLocal,
} from "./core/timezone";
import { key, readPreferences, recommendedPairs } from "./core/preferences";
import type { Preferences } from "./core/preferences";
import UnitSelect from "./components/UnitSelect";
import Icon from "./components/Icon";

type Tool = Category | "specs" | "time" | "currency";
const tools: {
  id: Tool;
  zh: string;
  en: string;
  icon: string;
  detail: string;
  detailEn: string;
}[] = [
  {
    id: "length",
    zh: "长度",
    en: "Length",
    icon: "↔",
    detail: "从尺寸开始，连接每个市场。",
    detailEn: "Bring every dimension into your market.",
  },
  {
    id: "weight",
    zh: "重量",
    en: "Weight",
    icon: "⚖",
    detail: "商品净重、包装重量，轻松换算。",
    detailEn: "From product weight to package weight.",
  },
  {
    id: "volume",
    zh: "容量",
    en: "Volume",
    icon: "◫",
    detail: "液体容量，明确区分美制与英制。",
    detailEn: "Liquid volume, with US and Imperial clearly defined.",
  },
  {
    id: "temperature",
    zh: "温度",
    en: "Temperature",
    icon: "♧",
    detail: "储存条件与使用温度，准确传达。",
    detailEn: "Make storage and operating temperatures clear.",
  },
  {
    id: "time",
    zh: "时区",
    en: "Time zones",
    icon: "◷",
    detail: "选好城市，让沟通准时发生。",
    detailEn: "The right city. The right time to connect.",
  },
  {
    id: "specs",
    zh: "商品规格",
    en: "Product specs",
    icon: "▱",
    detail: "粘贴商品数据，一次生成英文规格。",
    detailEn: "Paste product data. Get listing-ready specifications.",
  },
  {
    id: "currency",
    zh: "汇率",
    en: "Currency",
    icon: "＄",
    detail: "实时汇率，将在下一阶段接入。",
    detailEn: "Live exchange rates are planned for the next phase.",
  },
];
const errorMessages: Record<string, [string, string]> = {
  number: [
    "请输入有效数字，使用英文小数点（支持科学计数法）。",
    "Enter a valid number with a decimal point (scientific notation supported).",
  ],
  range: [
    "科学计数法指数须在 -30 至 30 之间。",
    "Scientific notation exponent must be between -30 and 30.",
  ],
  negative: [
    "长度、重量和容量不能为负数。",
    "Length, weight and volume cannot be negative.",
  ],
  absoluteZero: [
    "温度不能低于绝对零度。",
    "Temperature cannot be below absolute zero.",
  ],
  columns: [
    "每行需为：SKU（可选）、长、宽、高、重量；使用制表符或英文逗号，不含表头或引号。",
    "Each row needs optional SKU, length, width, height, weight; use tabs or commas, without headers or quotes.",
  ],
  positive: [
    "商品长宽高及重量必须大于 0。",
    "Product dimensions and weight must be greater than zero.",
  ],
  batchSize: [
    "每次最多 500 行、200,000 字符。",
    "Maximum 500 rows and 200,000 characters per batch.",
  ],
  date: [
    "请输入 1900–2100 年之间的有效日期和时间。",
    "Enter a valid date and time between 1900 and 2100.",
  ],
};
export default function App() {
  const [initial] = useState(readPreferences);
  const [p, setP] = useState<Preferences>(initial.preferences);
  const [storage, setStorage] = useState(initial.available);
  const [active, setActive] = useState<Tool>("length");
  const [value, setValue] = useState("100");
  const [batch, setBatch] = useState(
    "SKU-001, 30, 20, 10, 0.5\nSKU-002, 45, 30, 15, 1.2",
  );
  const [local, setLocal] = useState(() =>
    localInput(Date.now(), initial.preferences.sourceZone),
  );
  const [occurrence, setOccurrence] = useState("");
  const [notice, setNotice] = useState("");
  const zh = p.locale === "zh";
  const t = (cn: string, en: string) => (zh ? cn : en);
  const errorText = (code: string) =>
    errorMessages[code]?.[zh ? 0 : 1] ??
    t("换算失败，请检查输入。", "Conversion failed. Please check your input.");
  const current = tools.find((tool) => tool.id === active)!;
  const source = market(p.source),
    target = market(p.target);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(p));
      setStorage(true);
    } catch {
      setStorage(false);
    }
    document.documentElement.lang = p.locale === "zh" ? "zh-CN" : "en";
    document.title =
      p.locale === "zh"
        ? "UnitPort · 跨境换算工作台"
        : "UnitPort · Conversion workspace";
  }, [p]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  function changeMarket(side: "source" | "target", code: string) {
    setP((prev) => {
      const next = { ...prev, [side]: code };
      const rec = recommendedPairs(next.source, next.target);
      // Only update the changed side's suggestions. Other side retains explicit user choices.
      next.pairs = Object.fromEntries(
        (Object.keys(rec) as Category[]).map((c) => [
          c,
          {
            ...prev.pairs[c],
            [side === "source" ? "from" : "to"]:
              rec[c][side === "source" ? "from" : "to"],
          },
        ]),
      ) as Preferences["pairs"];
      next[side === "source" ? "sourceZone" : "targetZone"] =
        market(code).cities[0].zone;
      return next;
    });
    setOccurrence("");
  }
  function setPair(category: Category, side: "from" | "to", id: string) {
    setP((prev) => ({
      ...prev,
      pairs: {
        ...prev.pairs,
        [category]: { ...prev.pairs[category], [side]: id },
      },
    }));
  }
  function toggleFavorite() {
    setP((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(prev.target)
        ? prev.favorites.filter((c) => c !== prev.target)
        : [...prev.favorites, prev.target],
    }));
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(t("已复制到剪贴板", "Copied to clipboard"));
    } catch {
      setNotice(
        t(
          "复制失败，请选中结果手动复制。",
          "Copy failed. Select the result and copy manually.",
        ),
      );
    }
  }
  let output = "",
    conversionError = "";
  if (
    ["length", "weight", "volume", "temperature"].includes(active) &&
    value.trim()
  ) {
    try {
      const pair = p.pairs[active as Category];
      output = format(convert(value, pair.from, pair.to), p.precision);
    } catch (error) {
      conversionError = errorText((error as Error).message);
    }
  }
  let rows: ReturnType<typeof convertSpecs> = [],
    batchError = "";
  if (active === "specs") {
    try {
      rows = convertSpecs(
        batch,
        {
          lengthFrom: p.pairs.length.from,
          lengthTo: p.pairs.length.to,
          weightFrom: p.pairs.weight.from,
          weightTo: p.pairs.weight.to,
        },
        p.precision,
      );
    } catch (error) {
      batchError = errorText((error as Error).message);
    }
  }
  let timeResult: ReturnType<typeof resolveLocal> | undefined,
    timeError = "";
  if (active === "time") {
    try {
      timeResult = resolveLocal(local, p.sourceZone);
    } catch (error) {
      timeError = errorText((error as Error).message);
    }
  }
  const instant =
    timeResult?.status === "valid"
      ? timeResult.instants[0]
      : timeResult?.status === "ambiguous" && occurrence !== ""
        ? timeResult.instants[Number(occurrence)]
        : undefined;
  const validRows = rows.filter((r) => r.text);
  const allValid =
    validRows.length > 0 && validRows.length === rows.length && !batchError;
  const textResult = validRows.map((r) => r.text).join("\n");
  const category = active as Category;
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="./" aria-label="UnitPort home">
          <img
            className="brand-logo"
            src="/brand/uniport-horizontal-transparent-white.svg"
            alt="Uniport"
            width="184"
            height="48"
          />
          <span className="beta">BETA</span>
        </a>
        <div className="header-right">
          <span className="privacy">
            <i /> {t("本地运行 · 无需登录", "Local-first · No sign-in")}
          </span>
          <button
            className="language"
            onClick={() => setP({ ...p, locale: zh ? "en" : "zh" })}
            aria-label={t("Switch to English", "切换到中文")}
          >
            <Icon name="globe" /> <span>{zh ? "EN" : "中文"}</span>
          </button>
        </div>
      </header>
      <main className="layout">
        <section className="intro">
          <div>
            <p className="eyebrow">BUILT FOR GLOBAL SELLERS</p>
            <h1>
              {t("跨越单位，连接市场。", "Different units. One workspace.")}
            </h1>
            <p>
              {t(
                "从商品尺寸到跨洋时差，你的跨境换算工作台。",
                "Dimensions, product specs and time zones. Ready for your next market.",
              )}
            </p>
          </div>
          <div className="intro-art" aria-hidden="true">
            <span className="unit-chip chip-from">cm</span>
            <div className="intro-logo">
              <img
                src="/brand/uniport-logo-transparent-white.svg"
                alt=""
                width="96"
                height="96"
              />
            </div>
            <span className="unit-chip chip-to">
              in <Icon name="arrow" />
            </span>
            <small>LOCAL UNITS. GLOBAL POSSIBILITIES.</small>
          </div>
        </section>
        <section
          className="market-card"
          aria-label={t("市场设置", "Market settings")}
        >
          <div className="market-heading">
            <span className="section-kicker">
              01 / {t("设置你的市场", "YOUR MARKETS")}
            </span>
            <span className="saved">
              {storage ? "✓" : "!"}{" "}
              {storage
                ? t("偏好自动保存", "Preferences saved locally")
                : t("偏好仅本次有效", "Preferences are session-only")}
            </span>
          </div>
          <div className="market-fields">
            <label className="field market-field">
              <span>{t("所在国家 / 地区", "Your country / region")}</span>
              <select
                value={p.source}
                onChange={(e) => changeMarket("source", e.target.value)}
              >
                {markets.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.flag} {m[p.locale]}
                  </option>
                ))}
              </select>
            </label>
            <div className="route-arrow" aria-hidden="true">
              →
            </div>
            <label className="field market-field">
              <span>{t("目标市场", "Target market")}</span>
              <select
                value={p.target}
                onChange={(e) => changeMarket("target", e.target.value)}
              >
                {markets.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.flag} {m[p.locale]}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={`favorite-button ${p.favorites.includes(p.target) ? "is-favorite" : ""}`}
              onClick={toggleFavorite}
              aria-pressed={p.favorites.includes(p.target)}
            >
              {p.favorites.includes(p.target) ? "★" : "☆"}{" "}
              {p.favorites.includes(p.target)
                ? t("已收藏", "Saved")
                : t("收藏市场", "Save market")}
            </button>
          </div>
          <div className="favorites">
            <span>{t("常用市场", "Quick switch")}</span>
            {p.favorites.length ? (
              p.favorites.map((code) => (
                <button
                  key={code}
                  className={code === p.target ? "selected" : ""}
                  onClick={() => changeMarket("target", code)}
                  aria-pressed={code === p.target}
                >
                  {market(code).flag} {market(code)[p.locale]}
                </button>
              ))
            ) : (
              <small>
                {t(
                  "收藏目标市场，即可在此快捷切换。",
                  "Save a target market to switch here.",
                )}
              </small>
            )}
          </div>
        </section>
        <div className="workspace">
          <aside className="sidebar">
            <p className="section-kicker">
              02 / {t("选择换算工具", "YOUR TOOLS")}
            </p>
            <nav aria-label={t("换算工具", "Conversion tools")}>
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  className={active === tool.id ? "active" : ""}
                  aria-current={active === tool.id ? "page" : undefined}
                  onClick={() => {
                    setActive(tool.id);
                    setNotice("");
                  }}
                >
                  <span className="tool-icon" aria-hidden="true">
                    <Icon name={tool.id} />
                  </span>
                  <span>{tool[p.locale]}</span>
                  {tool.id === "currency" ? (
                    <small>{t("即将上线", "Soon")}</small>
                  ) : (
                    <span className="nav-arrow" aria-hidden="true">
                      ↗
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="sidebar-note">
              <img
                src="/brand/uniport-logo-transparent-white.svg"
                alt=""
                width="36"
                height="36"
              />
              <strong>{t("让数据适应市场", "Make your data travel.")}</strong>
              <p>
                {t(
                  "国家提供建议，单位由你决定。",
                  "Market defaults are a starting point. The units are always yours to choose.",
                )}
              </p>
            </div>
          </aside>
          <section className="tool-panel" aria-label={current[p.locale]}>
            <div className="panel-heading">
              <div>
                <span className="section-kicker">
                  {t("换算工作区", "CONVERSION WORKSPACE")}
                </span>
                <h2>
                  {current[p.locale]}
                  <span>{current.icon}</span>
                </h2>
                <p>{current[zh ? "detail" : "detailEn"]}</p>
              </div>
              {active !== "time" && active !== "currency" && (
                <label className="precision">
                  {t("显示小数位", "Decimal places")}
                  <select
                    aria-label={t("显示小数位", "Decimal places")}
                    value={p.precision}
                    onChange={(e) =>
                      setP({ ...p, precision: Number(e.target.value) })
                    }
                  >
                    {[2, 4, 6].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {["length", "weight", "volume", "temperature"].includes(active) && (
              <>
                <div className="conversion-grid">
                  <div className="input-card">
                    <span className="mini-label">{t("原始数值", "FROM")}</span>
                    <label className="value-label" htmlFor="conversion-value">
                      {t("输入数值", "Enter value")}
                    </label>
                    <input
                      id="conversion-value"
                      className="number-input"
                      inputMode="decimal"
                      value={value}
                      maxLength={100}
                      onChange={(e) => setValue(e.target.value)}
                      aria-invalid={!!conversionError}
                      aria-describedby={
                        conversionError ? "conversion-error" : undefined
                      }
                    />
                    <UnitSelect
                      category={category}
                      value={p.pairs[category].from}
                      onChange={(id) => setPair(category, "from", id)}
                      label={t("原始单位", "Source unit")}
                      locale={p.locale}
                    />
                  </div>
                  <button
                    className="swap"
                    aria-label={t("交换单位", "Swap units")}
                    onClick={() => {
                      setP((prev) => ({
                        ...prev,
                        pairs: {
                          ...prev.pairs,
                          [category]: {
                            from: prev.pairs[category].to,
                            to: prev.pairs[category].from,
                          },
                        },
                      }));
                    }}
                  >
                    <Icon name="swap" />
                  </button>
                  <div className="result-card">
                    <span className="mini-label">{t("换算结果", "TO")}</span>
                    <div className="result-number" aria-live="polite">
                      {output || "—"}
                      <span>{unit(p.pairs[category].to).symbol}</span>
                    </div>
                    <UnitSelect
                      category={category}
                      value={p.pairs[category].to}
                      onChange={(id) => setPair(category, "to", id)}
                      label={t("目标单位", "Target unit")}
                      locale={p.locale}
                    />
                  </div>
                </div>
                {conversionError && (
                  <p className="error" id="conversion-error" role="alert">
                    {conversionError}
                  </p>
                )}
                <div className="conversion-bottom">
                  <p>
                    {t(
                      "精确计算 · 仅对结果舍入",
                      "Exact arithmetic · Rounded for display",
                    )}
                    <br />
                    <small>
                      {t(
                        "极小非零值自动保留有效数字。",
                        "Tiny nonzero values keep meaningful digits.",
                      )}
                    </small>
                  </p>
                  <button
                    className="primary"
                    disabled={!output}
                    onClick={() =>
                      copy(`${output} ${unit(p.pairs[category].to).symbol}`)
                    }
                  >
                    <Icon name="copy" /> {t("复制结果", "Copy result")}
                  </button>
                </div>
                <div className="context-note">
                  <span>ⓘ</span>
                  <p>
                    {active === "volume"
                      ? t(
                          "oz 是重量；fl oz 是容量。美制与英制液量盎司不同，不能直接互换。",
                          "oz measures mass; fl oz measures volume. US and Imperial fluid ounces have different definitions.",
                        )
                      : t(
                          "切换市场会更新对应侧的推荐单位。你也可以随时选择其他单位。",
                          "Switching a market updates that side’s suggested units. You can choose any unit at any time.",
                        )}
                  </p>
                </div>
              </>
            )}
            {active === "specs" && (
              <>
                <div className="spec-unit-grid">
                  <UnitSelect
                    category="length"
                    value={p.pairs.length.from}
                    onChange={(id) => setPair("length", "from", id)}
                    label={t("原始尺寸单位", "Source dimensions")}
                    locale={p.locale}
                  />
                  <UnitSelect
                    category="length"
                    value={p.pairs.length.to}
                    onChange={(id) => setPair("length", "to", id)}
                    label={t("目标尺寸单位", "Target dimensions")}
                    locale={p.locale}
                  />
                  <UnitSelect
                    category="weight"
                    value={p.pairs.weight.from}
                    onChange={(id) => setPair("weight", "from", id)}
                    label={t("原始重量单位", "Source weight")}
                    locale={p.locale}
                  />
                  <UnitSelect
                    category="weight"
                    value={p.pairs.weight.to}
                    onChange={(id) => setPair("weight", "to", id)}
                    label={t("目标重量单位", "Target weight")}
                    locale={p.locale}
                  />
                </div>
                <label className="field batch-input">
                  <span>
                    {t(
                      "批量输入 · SKU（可选）, 长, 宽, 高, 重量",
                      "Batch input · optional SKU, length, width, height, weight",
                    )}
                  </span>
                  <textarea
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    rows={6}
                    aria-describedby="batch-help"
                    spellCheck={false}
                  />
                </label>
                <p className="help" id="batch-help">
                  {t(
                    "支持从表格粘贴制表符，或使用英文逗号。无表头、无引号，每次最多 500 行。",
                    "Paste tab-separated spreadsheet rows or simple CSV. No header or quotes; up to 500 rows.",
                  )}
                </p>
                {batchError && (
                  <p className="error" role="alert">
                    {batchError}
                  </p>
                )}
                <div className="spec-results">
                  <div className="results-heading">
                    <strong>
                      {t("英文商品规格", "English specifications")}
                    </strong>
                    <span>
                      {validRows.length} / {rows.length} {t("有效", "valid")}
                    </span>
                  </div>
                  {rows.length ? (
                    rows.map((row) => (
                      <div
                        key={row.line}
                        className={row.error ? "spec-row invalid" : "spec-row"}
                      >
                        <span className="line-number">{row.line}</span>
                        {row.error ? (
                          <p role="alert">
                            {row.sku}: {errorText(row.error)}
                          </p>
                        ) : (
                          <p>{row.text}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="help">
                      {t(
                        "粘贴商品数据以生成规格。",
                        "Paste product data to generate specifications.",
                      )}
                    </p>
                  )}
                </div>
                <div className="conversion-bottom">
                  <p>
                    {t("尺寸顺序：长 × 宽 × 高", "Dimension order: L × W × H")}
                    <br />
                    <small>
                      {t(
                        "请修正所有错误后再复制。",
                        "Resolve all errors before copying.",
                      )}
                    </small>
                  </p>
                  <button
                    className="primary"
                    disabled={!allValid}
                    onClick={() => copy(textResult)}
                  >
                    <Icon name="copy" />{" "}
                    {t("复制全部英文规格", "Copy all English specs")}
                  </button>
                </div>
              </>
            )}
            {active === "time" && (
              <>
                <div className="timezone-grid">
                  <label className="field">
                    <span>{t("出发城市", "Source city")}</span>
                    <select
                      value={p.sourceZone}
                      onChange={(e) => {
                        setP({ ...p, sourceZone: e.target.value });
                        setOccurrence("");
                      }}
                    >
                      {source.cities.map((city) => (
                        <option key={city.zone} value={city.zone}>
                          {city[p.locale]} · {city.zone}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>{t("目标城市", "Target city")}</span>
                    <select
                      value={p.targetZone}
                      onChange={(e) =>
                        setP({ ...p, targetZone: e.target.value })
                      }
                    >
                      {target.cities.map((city) => (
                        <option key={city.zone} value={city.zone}>
                          {city[p.locale]} · {city.zone}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="time-entry">
                  <label className="field">
                    <span>
                      {t(
                        "出发城市的当地日期与时间",
                        "Local date and time in source city",
                      )}
                    </span>
                    <input
                      type="datetime-local"
                      min="1900-01-01T00:00"
                      max="2100-12-31T23:59"
                      value={local}
                      onInput={(e) => {
                        setLocal(e.currentTarget.value);
                        setOccurrence("");
                      }}
                      onChange={(e) => {
                        setLocal(e.target.value);
                        setOccurrence("");
                      }}
                    />
                  </label>
                  <button
                    className="secondary"
                    onClick={() => {
                      setLocal(localInput(Date.now(), p.sourceZone));
                      setOccurrence("");
                    }}
                  >
                    {t("使用当前时间", "Use current time")}
                  </button>
                </div>
                {timeError && (
                  <p className="error" role="alert">
                    {timeError}
                  </p>
                )}
                {timeResult?.status === "gap" && (
                  <p className="error" role="alert">
                    {t(
                      "此时间因时区 / 夏令时切换而不存在，请选择其他时间。",
                      "This local time does not exist because of a time-zone / DST transition. Choose another time.",
                    )}
                  </p>
                )}
                {timeResult?.status === "ambiguous" && (
                  <div className="ambiguity">
                    <p>
                      {t(
                        "此当地时间出现两次，请选择具体一次：",
                        "This local time occurs twice. Choose an occurrence:",
                      )}
                    </p>
                    {timeResult.instants.map((ms, i) => (
                      <label key={ms}>
                        <input
                          type="radio"
                          name="occurrence"
                          value={i}
                          checked={occurrence === String(i)}
                          onChange={() => setOccurrence(String(i))}
                        />
                        {t(
                          i === 0 ? "第一次" : "第二次",
                          i === 0 ? "First" : "Second",
                        )}{" "}
                        · {offsetLabel(ms, p.sourceZone)} ·{" "}
                        {new Date(ms).toISOString()}
                      </label>
                    ))}
                  </div>
                )}
                <div className="time-result result-card">
                  <span className="mini-label">
                    {t("目标城市当地时间", "TARGET LOCAL TIME")}
                  </span>
                  <h3 aria-live="polite">
                    {instant !== undefined
                      ? describeTime(instant, p.targetZone, p.locale)
                      : "—"}
                  </h3>
                  <p>
                    {p.targetZone}
                    {instant !== undefined
                      ? ` · ${offsetLabel(instant, p.targetZone)}`
                      : ""}
                  </p>
                  <button
                    className="primary"
                    disabled={instant === undefined}
                    onClick={() =>
                      instant !== undefined &&
                      copy(
                        `${describeTime(instant, p.targetZone, "en")} [${p.targetZone}] · UTC ${new Date(instant).toISOString()}`,
                      )
                    }
                  >
                    <Icon name="copy" />{" "}
                    {t("复制英文时间", "Copy time in English")}
                  </button>
                </div>
                <div className="context-note">
                  <span>ⓘ</span>
                  <p>
                    {t(
                      "使用浏览器内置 IANA 时区数据，按所选日期自动处理夏令时。请保持浏览器与系统更新。",
                      "Uses your browser’s IANA time-zone data and applies DST for the selected date. Keep your browser and system up to date.",
                    )}
                  </p>
                </div>
              </>
            )}
            {active === "currency" && (
              <div className="currency-empty">
                <span className="currency-art">
                  ↗<small>FX</small>
                </span>
                <span className="coming-soon">PHASE 02</span>
                <h3>{t("让汇率也跟上你的市场", "Exchange rates are next.")}</h3>
                <p>
                  {source.currency} → {target.currency}
                </p>
                <p>
                  {t(
                    "尚未接入汇率数据源，因此暂不提供换算数值。",
                    "No exchange-rate provider is connected. Conversion values are not available yet.",
                  )}
                </p>
                <div className="context-note">
                  <span>ⓘ</span>
                  <p>
                    {t(
                      "正式接入后，每条报价将显示来源与更新时间。",
                      "Once connected, every quote will show its source and update time.",
                    )}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
        <section className="trust-strip">
          <div>
            <span>↗</span>
            <p>
              <strong>
                {t("为跨境工作而生", "Built for cross-border work")}
              </strong>
              <small>
                {t(
                  "单位 · 商品规格 · 时区",
                  "Units · Product specs · Time zones",
                )}
              </small>
            </p>
          </div>
          <div>
            <span>◈</span>
            <p>
              <strong>
                {t("你的数据，留在本地", "Your data stays local")}
              </strong>
              <small>
                {t("无账号，无数据上传", "No account. No data uploads.")}
              </small>
            </p>
          </div>
          <div>
            <span>◎</span>
            <p>
              <strong>
                {t("一个引擎，多个市场", "One engine, many markets")}
              </strong>
              <small>
                {t(
                  "统一标准，自由选择单位",
                  "Consistent definitions. Flexible units.",
                )}
              </small>
            </p>
          </div>
        </section>
        <footer>
          <span>
            UnitPort <span className="footer-dot">/</span>{" "}
            {t("让跨境，更进一步。", "A little closer to every market.")}
          </span>
          <span>
            {t("MVP v0.1 · 纯前端工具", "MVP v0.1 · Browser-based tools")}
          </span>
        </footer>
      </main>
      <div role="status" className={notice ? "toast visible" : "toast"}>
        {notice}
      </div>
    </div>
  );
}
