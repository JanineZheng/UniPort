import { useEffect, useRef, useState } from "react";
import type { PointerEvent, KeyboardEvent } from "react";
import { defaultToolOrder } from "../config/toolOrder";
import type { Tool } from "../config/toolOrder";
import { pages } from "../config/pages";
import Icon from "./Icon";

type Item = { id: Tool; zh: string; en: string };
type Drag = { id: Tool; x: number; y: number; moved: boolean; original: Tool[] };
export default function ToolNavigation({ items, active, zh, storage, onOrder }: {
  items: Item[]; active: Tool; zh: boolean; storage: boolean; onOrder: (order: Tool[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [ghost, setGhost] = useState<{id: Tool; x: number; y: number} | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const drag = useRef<Drag | null>(null);
  const nav = useRef<HTMLElement | null>(null);
  const focusAfterMove = useRef<Tool | null>(null);
  useEffect(() => {
    if (focusAfterMove.current) {
      nav.current?.querySelector<HTMLButtonElement>(`[data-sort-tool="${focusAfterMove.current}"]`)?.focus({ preventScroll: true });
      focusAfterMove.current = null;
    }
  }, [items]);
  const t = (cn: string, en: string) => zh ? cn : en;
  function move(id: Tool, to: number) {
    const order = items.map(item => item.id), from = order.indexOf(id);
    if (from < 0 || to < 0 || to >= order.length || from === to) return;
    order.splice(from, 1); order.splice(to, 0, id);
    onOrder(order);
    const item = items.find(item => item.id === id)!;
    setAnnouncement(t(`${item.zh}已移至第 ${to + 1} 位。`, `${item.en} moved to position ${to + 1}.`));
  }
  function start(event: PointerEvent<HTMLButtonElement>, id: Tool) {
    if (!event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id, x: event.clientX, y: event.clientY, moved: false, original: items.map(item => item.id) };
  }
  function track(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current) return;
    if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 5) return;
    current.moved = true;
    setGhost({ id: current.id, x: event.clientX, y: event.clientY });
    const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-sort-tool]");
    if (!hit || !nav.current?.contains(hit)) return;
    const to = items.findIndex(item => item.id === hit.dataset.sortTool);
    move(current.id, to);
  }
  function finish(cancel = false) {
    if (cancel && drag.current) onOrder(drag.current.original);
    drag.current = null; setGhost(null);
  }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, id: Tool) {
    if (event.key === "Escape") { finish(true); return; }
    const columns = nav.current ? getComputedStyle(nav.current).gridTemplateColumns.split(" ").length : 1;
    const delta: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
    if (!(event.key in delta)) return;
    event.preventDefault();
    focusAfterMove.current = id;
    move(id, items.findIndex(item => item.id === id) + delta[event.key]);
  }
  return <>
    <div className="order-toolbar">
      <button type="button" aria-pressed={editing} onClick={() => { finish(); setEditing(!editing); }}>{editing ? t("完成排序", "Done sorting") : t("调整排序", "Customize order")}</button>
      {editing && <button type="button" onClick={() => onOrder([...defaultToolOrder])}>{t("恢复默认", "Reset default order")}</button>}
    </div>
    {editing && <p className="order-help">{t("按住卡片上下左右拖动；也可聚焦卡片后用方向键移动。", "Drag cards in any direction, or focus a card and use the arrow keys.")} {storage ? t("自动保存。", "Saved automatically.") : t("仅在本页有效。", "Applies to this page only.")}</p>}
    <nav ref={nav} className={editing ? "sorting-grid" : undefined} aria-label={t("换算工具", "Conversion tools")}>
      {items.map((item, index) => editing ? <button type="button" key={item.id} data-sort-tool={item.id}
        className={`sort-card${ghost?.id === item.id ? " dragging" : ""}`}
        aria-label={t(`移动${item.zh}`, `Move ${item.en}`)} aria-describedby="sort-instructions"
        onPointerDown={event => start(event, item.id)} onPointerMove={track}
        onPointerUp={() => finish()} onPointerCancel={() => finish(true)} onLostPointerCapture={() => finish()}
        onKeyDown={event => keyboard(event, item.id)}>
        <span className="sort-number">{index + 1}</span><span>{zh ? item.zh : item.en}</span><span aria-hidden="true">⠿</span>
      </button> : <a key={item.id} href={pages.find(page => page.tool === item.id && page.path !== "/")!.path}
        className={active === item.id ? "active" : ""} aria-current={active === item.id ? "page" : undefined}>
        <span className="tool-icon" aria-hidden="true"><Icon name={item.id === "cubic" ? "specs" : item.id === "dimensions" ? "length" : item.id} /></span>
        <span>{zh ? item.zh : item.en}</span><span className="nav-arrow" aria-hidden="true">↗</span>
      </a>)}
    </nav>
    <span id="sort-instructions" className="sr-only">{t("方向键移动卡片，Esc 取消当前拖动。", "Arrow keys move the card. Escape cancels the current drag.")}</span>
    {editing && <span className="sr-only" role="status" aria-live="polite">{announcement}</span>}
    {ghost && <div className="sort-ghost" style={{ left: ghost.x + 12, top: ghost.y + 12 }} aria-hidden="true">{items.find(item => item.id === ghost.id)?.[zh ? "zh" : "en"]}</div>}
  </>;
}
