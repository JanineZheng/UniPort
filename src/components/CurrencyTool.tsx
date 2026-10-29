import { useEffect, useState } from "react";
import Icon from "./Icon";
import { markets } from "../config/markets";
import { convertCurrency, fetchQuote, FX_REFRESH_MS, FX_SOURCE, FX_SOURCE_URL, isFxStale } from "../core/currency";
import type { FxQuote } from "../core/currency";

const currencies = [...new Set(markets.map(m => m.currency))];
type QuoteState = { pair: string; status: "loading" | "ready" | "error"; quote?: FxQuote; error?: string };
export default function CurrencyTool({ source, target, zh, precision, copy }: { source: string; target: string; zh: boolean; precision: number; copy: (text: string) => void }) {
  const [base, setBase] = useState(source), [counter, setCounter] = useState(target);
  const [amount, setAmount] = useState("100"), [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [state, setState] = useState<QuoteState>({ pair: "", status: "loading" });
  const t = (cn: string, en: string) => zh ? cn : en;
  const pair = `${base}/${counter}`, same = base === counter;
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    const poll = setInterval(() => setRefresh(n => n + 1), FX_REFRESH_MS);
    const resume = () => { setNow(Date.now()); setRefresh(n => n + 1); };
    const visible = () => { if (document.visibilityState === "visible") resume(); };
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", visible);
    return () => { clearInterval(tick); clearInterval(poll); window.removeEventListener("online", resume); window.removeEventListener("focus", resume); document.removeEventListener("visibilitychange", visible); };
  }, []);
  useEffect(() => {
    if (same) return;
    const controller = new AbortController();
    let active = true, timedOut = false;
    setState({ pair, status: "loading" });
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 12_000);
    fetchQuote(base, counter, controller.signal).then(quote => {
      if (active) { setNow(Date.now()); setState({ pair, status: "ready", quote }); }
    }).catch(error => {
      if (active) setState({ pair, status: "error", error: timedOut ? "timeout" : error.message });
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [base, counter, pair, same, refresh]);
  const current = state.pair === pair ? state : undefined;
  const quote = !same && current?.status === "ready" ? current.quote : undefined;
  const stale = quote ? isFxStale(quote, now) : false;
  let result = "", inputError = "";
  if (amount.trim() && (same || (quote && !stale))) {
    try { result = convertCurrency(amount, same ? "1" : quote!.rate, precision); }
    catch { inputError = t("请输入有效的非负金额（英文小数点，指数 -30 至 30，最多 100 字符）。", "Enter a valid non-negative amount (decimal point, exponent -30 to 30, max 100 characters)."); }
  }
  const displayTime = (ms: number) => new Intl.DateTimeFormat(zh ? "zh-CN" : "en-GB", {
    dateStyle: "medium", timeStyle: "long", timeZone: "UTC", hourCycle: "h23",
  }).format(ms);
  return <div className="currency-tool">
    <p className="context-note">{t("每日参考汇率 · 非实时行情 · 银行及支付平台成交汇率可能不同。", "Daily reference rates · Not live market prices · Bank and payment-provider rates may differ.")}</p>
    <div className="pair-selectors">
      <label className="field"><span>{t("原始货币", "Source currency")}</span><select aria-label={t("原始货币", "Source currency")} value={base} onChange={e => setBase(e.target.value)}>{currencies.map(c => <option key={c}>{c}</option>)}</select></label>
      <button className="pair-swap" aria-label={t("交换货币", "Swap currencies")} title={t("交换货币", "Swap currencies")} onClick={() => { setBase(counter); setCounter(base); }}><Icon name="swap" /></button>
      <label className="field"><span>{t("目标货币", "Target currency")}</span><select aria-label={t("目标货币", "Target currency")} value={counter} onChange={e => setCounter(e.target.value)}>{currencies.map(c => <option key={c}>{c}</option>)}</select></label>
    </div>
    <div className="fx-amount-row">
      <label className="field"><span>{t("金额", "Amount")}</span><input inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} maxLength={100} aria-invalid={!!inputError} /></label>
      <button className="secondary" disabled={same || current?.status === "loading"} onClick={() => setRefresh(n => n + 1)}>{t("刷新汇率", "Refresh rate")}</button>
    </div>
    {inputError && <p className="error" role="alert">{inputError}</p>}
    <div className="result-card fx-result-card">
      <span className="mini-label">{t("参考换算结果", "REFERENCE CONVERSION")}</span>
      <h3 aria-live="polite" data-testid="fx-result">{result ? <>{result} <small className="result-unit">{counter}</small></> : "—"}</h3>
      {quote && !stale && <p className="fx-rate">1 {base} = {quote.rate} {counter}</p>}
      <button className="primary" disabled={!result} onClick={() => copy(`${result} ${counter}`)}><Icon name="copy" /> {t("复制结果", "Copy result")}</button>
    </div>
    {same ? <p role="status">{t("相同货币，按 1:1 换算，无需汇率数据。", "Same currency: 1:1 conversion; no exchange-rate data needed.")}</p> : <>
      {(!current || current.status === "loading") && <p role="status">{t("正在获取参考汇率…", "Fetching reference rate…")}</p>}
      {current?.status === "error" && <p className="error" role="alert">{current.error === "timeout" ? t("汇率请求超时。", "The rate request timed out.") : current.error === "unavailable" ? t("数据源暂不支持此货币对。", "This currency pair is unavailable from the provider.") : current.error === "invalid" ? t("汇率数据无效或日期异常。", "The rate data or its date is invalid.") : t("汇率请求失败，请检查网络。", "Could not fetch the rate. Check your connection.")} {t("已停止输出换算结果，请点击刷新重试。", "Conversion is unavailable. Click Refresh rate to retry.")}</p>}
      {quote && <div className="fx-metadata">
        <p role={stale ? "alert" : "status"} className={stale ? "error" : ""}>{stale ? t("数据已过期：数据日期距今天超过 3 天，或超过 30 分钟未成功刷新。已停止输出结果，请刷新。", "Rate expired: its date is over 3 days old or it has not been checked successfully for 30 minutes. Conversion is unavailable; refresh to retry.") : t("已获取数据源最新可用的每日参考汇率，非实时行情。", "Retrieved the provider’s latest available daily reference rate, not a live quote.")}</p>
        <p>{t("数据来源：", "Source: ")}<a href={FX_SOURCE_URL} target="_blank" rel="noreferrer">{FX_SOURCE}</a>{t("（央行及官方来源综合参考汇率）", " (blended central-bank and official reference rates)")}</p>
        {quote.providers.length > 0 && <details><summary>{t("查看底层来源代码", "View underlying provider codes")}</summary><p>{quote.providers.join(", ")}</p></details>}
        <p>{t("数据更新日期：", "Rate date: ")}<time dateTime={quote.asOf}>{quote.asOf}</time>{t("（源站仅提供日期，不提供精确发布时间）", " (the provider supplies a date, not an exact publication time)")}</p>
        <p>{t("本次获取时间：", "Retrieved at: ")}<time dateTime={new Date(quote.fetchedAt).toISOString()}>{displayTime(quote.fetchedAt)}</time></p>
      </div>}
    </>}
    <p className="context-note">{t("每 15 分钟自动重新获取；回到页面或恢复联网时重试。周末、节假日可能沿用前一工作日数据，以数据更新日期为准。金额在本地计算，仅向数据源请求货币对。", "Checks every 15 minutes and retries when you return or reconnect. Weekends and holidays may use the previous business day’s rate; check the rate date. Amounts stay local; only the currency pair is requested.")}</p>
  </div>;
}

