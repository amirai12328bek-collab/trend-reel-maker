import { useState, useRef, useCallback, useEffect } from "react";

const PLATFORMS = [
  { id: "instagram_reels", label: "Instagram Reels", short: "Reels",    icon: "◈", color: "#E1306C", bg: "#E1306C15" },
  { id: "stories",         label: "Stories",         short: "Stories",  icon: "◉", color: "#F77737", bg: "#F7773715" },
  { id: "tiktok",          label: "TikTok",           short: "TikTok",  icon: "♪", color: "#69C9D0", bg: "#69C9D015" },
  { id: "youtube_shorts",  label: "YouTube Shorts",   short: "YT Short",icon: "▶", color: "#FF4444", bg: "#FF444415" },
  { id: "youtube_long",    label: "YouTube Long",     short: "YT Long", icon: "⬛",color: "#FF6B6B", bg: "#FF6B6B15" },
];

const TOPICS = ["Мотивация","Любовь","Юмор","Ибратли видео","Бизнес","Лайфхак","Саморазвитие","Путешествия"];

const INSTAGRAM_TRENDS = [
  { tag: "#MotivationMonday", heat: 98, desc: "Понедельник вдохновения" },
  { tag: "#GlowUp2026",       heat: 95, desc: "Трансформация себя" },
  { tag: "#SilentWalk",       heat: 91, desc: "Тихая прогулка без телефона" },
  { tag: "#ThriftFlip",       heat: 89, desc: "Преображение одежды" },
  { tag: "#POVChallenge",     heat: 87, desc: "Твоя точка зрения" },
  { tag: "#MorningRoutine",   heat: 84, desc: "Утренний ритуал" },
];

const YOUTUBE_TRENDS = [
  { tag: "Living on $5 a day",           heat: 97, desc: "Экстремальная экономия" },
  { tag: "I tried X for 30 days",        heat: 94, desc: "30-дневный эксперимент" },
  { tag: "What nobody tells you about",  heat: 92, desc: "Скрытая правда о..." },
  { tag: "Extreme budget challenge",     heat: 88, desc: "Бюджетный челлендж" },
  { tag: "Day in the life (viral city)", heat: 85, desc: "День из жизни" },
  { tag: "Honest review: AI tools",      heat: 82, desc: "Честный обзор AI" },
];

const ZERO_IDEAS = [
  { text: "История ошибки, которая изменила тебя",      emoji: "💡" },
  { text: "1 совет, меняющий жизнь за 60 секунд",       emoji: "⚡" },
  { text: "Что я узнал за год молчания",                 emoji: "🔇" },
  { text: "Почему большинство никогда не разбогатеет",   emoji: "💰" },
  { text: "Маленькая привычка — огромный результат",     emoji: "🌱" },
  { text: "Письмо себе из прошлого",                     emoji: "✉️" },
];

/* ─── API CALL ─── */
async function callAI(platform, topic) {
  const platformLabel = PLATFORMS.find(p => p.id === platform)?.label || platform;

  const systemPrompt = `Ты — топовый SMM-стратег и сценарист вирусного контента. Создаёшь сценарии, которые реально набирают миллионы просмотров. Отвечай ТОЛЬКО валидным JSON без markdown-блоков, без пояснений.`;

  const userPrompt = `Создай вирусный сценарий для ${platformLabel} по теме: "${topic}".

Верни строго такой JSON:
{
  "title": "цепляющий заголовок до 60 символов",
  "hook": "первые 3 секунды: фраза или действие, которое ОСТАНАВЛИВАЕТ скролл",
  "middle": "основная часть: 2-3 предложения с полезным или эмоциональным контентом",
  "ending": "финал: мощный CTA или неожиданный вывод, провоцирующий комментарии",
  "voiceover": "полный текст озвучки в разговорном стиле, 60-90 слов",
  "description": "описание для публикации: 2 предложения + 8-10 хэштегов",
  "viral_reason": "3 конкретные причины почему это станет вирусным",
  "similar_ideas": ["идея 1 с хуком", "идея 2 с хуком", "идея 3 с хуком"]
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Ошибка сервера: HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data?.content?.length) throw new Error("Пустой ответ от AI");

  const raw = data.content.map(b => b.text || "").join("").trim();
  const clean = raw
    .replace(/^```[\w]*\s*/m, "")
    .replace(/```\s*$/m, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Не удалось разобрать ответ AI. Попробуй ещё раз.");
  }
}

/* ─── COPY HOOK ─── */
function useCopy() {
  const [copiedKey, setCopiedKey] = useState(null);
  const copy = useCallback((text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }, []);
  return { copiedKey, copy };
}

/* ─── GLOBAL CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #07090f;
    --surface: #0d1017;
    --border: rgba(255,255,255,0.07);
    --border-h: rgba(255,255,255,0.14);
    --text: #e8edf5;
    --muted: #5a6478;
    --accent: #7c3aed;
    --font-d: 'Instrument Serif', Georgia, serif;
    --font-b: 'DM Sans', system-ui, sans-serif;
    --r: 16px;
    --rs: 10px;
  }
  body { background: var(--bg); }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 2px; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{opacity:.3} 50%{opacity:.9} }
  @keyframes orb1    { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.15)} }
  @keyframes orb2    { 0%,100%{transform:translate(-50%,-50%) scale(1.1)} 50%{transform:translate(-50%,-50%) scale(.9)} }
  @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes pop     { 0%{transform:scale(.92);opacity:0} 60%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }

  .fu  { animation: fadeUp  .45s cubic-bezier(.22,.68,0,1.2) both; }
  .fi  { animation: fadeIn  .3s ease both; }
  .pop { animation: pop     .5s cubic-bezier(.22,.68,0,1.2) both; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    transition: border-color .2s;
  }
  .card:hover { border-color: var(--border-h); }

  .rs {
    border-radius: var(--rs); padding: 16px;
    background: rgba(255,255,255,.025);
    border: 1px solid var(--border);
    transition: border-color .2s;
  }
  .rs:hover { border-color: var(--border-h); }

  .pbtn {
    display:inline-flex; align-items:center; gap:7px;
    padding: 9px 15px; border-radius: 40px; font-size: 13px;
    font-family: var(--font-b); font-weight: 600;
    cursor: pointer; border: 1.5px solid transparent;
    white-space: nowrap; transition: all .2s;
  }
  .pbtn:hover { transform: translateY(-1px); }
  .pbtn:active { transform: scale(.97); }

  .chip {
    padding: 5px 13px; border-radius: 20px; font-size: 12px;
    background: rgba(255,255,255,.04); border: 1px solid var(--border);
    color: var(--muted); cursor: pointer;
    font-family: var(--font-b); font-weight: 500; transition: all .15s;
  }
  .chip:hover { border-color: var(--border-h); color: #94a3b8; }
  .chip.on  { background: rgba(124,58,237,.18); border-color: rgba(124,58,237,.5); color: #c4b5fd; }

  .pill {
    padding: 9px 16px; border-radius: 40px; font-size: 13px;
    border: 1px solid var(--border); background: rgba(255,255,255,.03);
    color: #64748b; cursor: pointer; font-family: var(--font-b); font-weight: 500;
    transition: all .18s; white-space: nowrap;
  }
  .pill:hover { border-color: var(--border-h); color: #94a3b8; transform: translateY(-1px); }
  .pill.on { border-color: rgba(124,58,237,.45); color: #a78bfa; background: rgba(124,58,237,.1); }

  .genbtn {
    width:100%; padding:17px; border-radius:14px; border:none;
    font-family: var(--font-d); font-size: 18px; font-weight: 400;
    font-style: italic; cursor: pointer; transition: all .2s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .genbtn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(124,58,237,.45); }
  .genbtn:disabled { cursor: not-allowed; }
  .genbtn:active:not(:disabled) { transform: scale(.98); }

  .cbtn {
    display:inline-flex; align-items:center; gap:5px;
    padding: 4px 10px; border-radius: 6px;
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; font-family: var(--font-b);
    font-size: 11px; font-weight: 500; color: var(--muted);
    transition: all .15s;
  }
  .cbtn:hover { border-color: var(--border-h); color: #94a3b8; }
  .cbtn.ok  { border-color: rgba(34,197,94,.4); color: #4ade80; }

  .titem {
    display:flex; align-items:center; justify-content:space-between;
    padding: 11px 14px; border-radius: 10px;
    background: rgba(124,58,237,.06); border: 1px solid rgba(124,58,237,.18);
    cursor: pointer; transition: all .15s; width: 100%;
    font-family: var(--font-b); text-align: left;
  }
  .titem:hover { background: rgba(124,58,237,.14); border-color: rgba(124,58,237,.4); transform: translateX(3px); }

  .zidea {
    display:flex; align-items:flex-start; gap:9px;
    padding: 11px 13px; border-radius: 10px; text-align: left;
    background: rgba(255,255,255,.025); border: 1px solid var(--border);
    color: #94a3b8; cursor: pointer; font-family: var(--font-b);
    font-size: 13px; line-height: 1.45; transition: all .15s; width: 100%;
  }
  .zidea:hover { background: rgba(124,58,237,.1); border-color: rgba(124,58,237,.35); color: #c4b5fd; }

  .overlay {
    position:fixed; inset:0; z-index:200;
    background: rgba(0,0,0,.75); backdrop-filter: blur(10px);
    display:flex; align-items:center; justify-content:center; padding:20px;
    animation: fadeIn .2s ease both;
  }
  .mbox {
    background: #0d1017; border: 1px solid rgba(255,255,255,.1);
    border-radius: 20px; padding: 28px; max-width: 420px; width: 100%;
    box-shadow: 0 30px 90px rgba(0,0,0,.7);
    animation: fadeUp .3s cubic-bezier(.22,.68,0,1.2) both;
  }

  .lbl { font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; font-family:var(--font-b); }

  .spinner {
    width:18px; height:18px; border-radius:50%;
    border: 2px solid rgba(124,58,237,.3); border-top-color: #7c3aed;
    animation: spin .7s linear infinite; flex-shrink:0;
  }

  @media(max-width:600px){
    .pbtn { padding:8px 11px; font-size:12px; }
    .two  { grid-template-columns:1fr !important; }
    .mbox { padding:20px; }
  }
`;

/* ─── ORBS ─── */
function Orbs() {
  return (
    <>
      {[
        { l:"12%", t:"15%", s:"520px", c:"rgba(124,58,237,.1)", a:"orb1 8s ease-in-out infinite" },
        { l:"88%", t:"65%", s:"460px", c:"rgba(37,99,235,.09)", a:"orb2 10s ease-in-out infinite" },
        { l:"55%", t:"40%", s:"300px", c:"rgba(236,72,153,.04)", a:"orb1 12s ease-in-out 2s infinite" },
      ].map((o,i) => (
        <div key={i} style={{
          position:"fixed", left:o.l, top:o.t, width:o.s, height:o.s,
          borderRadius:"50%", pointerEvents:"none", zIndex:0,
          background:`radial-gradient(circle, ${o.c} 0%, transparent 65%)`,
          animation:o.a, transform:"translate(-50%,-50%)",
        }}/>
      ))}
    </>
  );
}

/* ─── COPY BUTTON ─── */
function CBtn({ text, id, copiedKey, copy }) {
  const ok = copiedKey === id;
  return (
    <button className={`cbtn ${ok ? "ok" : ""}`} onClick={() => copy(text, id)}>
      {ok ? <><span>✓</span>Скопировано</> : <><span style={{fontSize:"13px"}}>⎘</span>Копировать</>}
    </button>
  );
}

/* ─── RESULT SECTION ─── */
function RSection({ label, content, accent, id, copiedKey, copy, delay=0 }) {
  return (
    <div className="rs fu" style={{ animationDelay:`${delay}ms` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
        <span className="lbl" style={{ color:accent }}>{label}</span>
        <CBtn text={content} id={id} copiedKey={copiedKey} copy={copy} />
      </div>
      <p style={{ color:"#c8d0dc", fontSize:"14px", lineHeight:"1.7", fontFamily:"var(--font-b)", fontWeight:400 }}>{content}</p>
    </div>
  );
}

/* ─── TREND MODAL ─── */
function TrendModal({ type, onClose, onSelect }) {
  const isIG   = type === "instagram";
  const trends = isIG ? INSTAGRAM_TRENDS : YOUTUBE_TRENDS;
  const color  = isIG ? "#E1306C" : "#FF4444";
  const label  = isIG ? "📸 Instagram Trends" : "▶ YouTube Trends";
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="mbox" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
          <span style={{ fontFamily:"var(--font-d)", fontSize:"20px", color, fontStyle:"italic" }}>{label}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:"20px", lineHeight:1 }}>✕</button>
        </div>
        <p style={{ color:"var(--muted)", fontSize:"12px", marginBottom:"18px", fontFamily:"var(--font-b)" }}>
          Нажми — тренд подставится в поле темы
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {trends.map((t,i) => (
            <button key={i} className="titem" onClick={() => { onSelect(t.tag); onClose(); }}>
              <div>
                <div style={{ color:"#e2e8f0", fontSize:"13px", fontWeight:600, fontFamily:"var(--font-b)" }}>{t.tag}</div>
                <div style={{ color:"var(--muted)", fontSize:"11px", marginTop:"2px" }}>{t.desc}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"4px", color, fontWeight:700, fontSize:"12px", flexShrink:0 }}>🔥 {t.heat}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SCRIPT RESULT ─── */
function ScriptResult({ result, platform }) {
  const { copiedKey, copy } = useCopy();
  const pColor = PLATFORMS.find(p => p.id === platform)?.color || "#7c3aed";

  const allText = [
    result.title,
    `\n🎣 HOOK:\n${result.hook}`,
    `\n📖 ОСНОВНАЯ ЧАСТЬ:\n${result.middle}`,
    `\n🎯 ФИНАЛ:\n${result.ending}`,
    `\n🎙 ОЗВУЧКА:\n${result.voiceover}`,
    `\n📝 ОПИСАНИЕ:\n${result.description}`,
    `\n🔥 ПОЧЕМУ ВИРУСНОЕ:\n${result.viral_reason}`,
    `\n💡 ПОХОЖИЕ ИДЕИ:\n${result.similar_ideas.join("\n")}`,
  ].join("\n");

  return (
    <div className="pop" style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

      {/* Title */}
      <div style={{
        background:`linear-gradient(135deg, ${pColor}12, rgba(37,99,235,.1))`,
        border:`1px solid ${pColor}30`, borderRadius:"var(--r)", padding:"20px 22px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:`linear-gradient(90deg,transparent,${pColor}60,transparent)` }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px" }}>
          <div style={{ flex:1 }}>
            <span className="lbl" style={{ color:pColor }}>✦ Готовый сценарий</span>
            <h2 style={{ fontFamily:"var(--font-d)", fontSize:"clamp(18px,3.5vw,24px)", fontWeight:400, fontStyle:"italic", color:"#f1f5f9", marginTop:"8px", lineHeight:1.25 }}>
              {result.title}
            </h2>
          </div>
          <CBtn text={allText} id="all" copiedKey={copiedKey} copy={copy} />
        </div>
      </div>

      {/* Hook / Middle / Ending */}
      <RSection label="🎣 Hook — Крючок"   content={result.hook}   accent="#f472b6" id="hook"  copiedKey={copiedKey} copy={copy} delay={60}  />
      <RSection label="📖 Middle — Основа" content={result.middle} accent="#60a5fa" id="mid"   copiedKey={copiedKey} copy={copy} delay={110} />
      <RSection label="🎯 Ending — Финал"  content={result.ending} accent="#34d399" id="end"   copiedKey={copiedKey} copy={copy} delay={160} />

      {/* Voiceover */}
      <div className="rs fu" style={{ animationDelay:"200ms", background:"rgba(0,0,0,.25)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
          <span className="lbl" style={{ color:"#fbbf24" }}>🎙 Текст озвучки</span>
          <CBtn text={result.voiceover} id="voice" copiedKey={copiedKey} copy={copy} />
        </div>
        <p style={{ color:"#dde4f0", fontSize:"14px", lineHeight:"1.8", fontFamily:"var(--font-d)", fontStyle:"italic" }}>{result.voiceover}</p>
      </div>

      {/* Description + Viral */}
      <div className="two fu" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", animationDelay:"240ms" }}>
        <div className="rs">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
            <span className="lbl" style={{ color:"#94a3b8" }}>📝 Описание</span>
            <CBtn text={result.description} id="desc" copiedKey={copiedKey} copy={copy} />
          </div>
          <p style={{ color:"#7d8fa8", fontSize:"12px", lineHeight:"1.7", fontFamily:"var(--font-b)" }}>{result.description}</p>
        </div>
        <div className="rs" style={{ background:"rgba(239,68,68,.05)", borderColor:"rgba(239,68,68,.15)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
            <span className="lbl" style={{ color:"#f87171" }}>🔥 Почему вирусное</span>
            <CBtn text={result.viral_reason} id="viral" copiedKey={copiedKey} copy={copy} />
          </div>
          <p style={{ color:"#fca5a5", fontSize:"12px", lineHeight:"1.7", fontFamily:"var(--font-b)" }}>{result.viral_reason}</p>
        </div>
      </div>

      {/* Similar ideas */}
      <div className="rs fu" style={{ animationDelay:"280ms" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
          <span className="lbl" style={{ color:"#a78bfa" }}>💡 3 похожие идеи</span>
          <CBtn text={result.similar_ideas.join("\n")} id="ideas" copiedKey={copiedKey} copy={copy} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {result.similar_ideas.map((idea,i) => (
            <div key={i} style={{
              display:"flex", gap:"12px", alignItems:"flex-start",
              padding:"10px 13px", borderRadius:"9px",
              background:"rgba(124,58,237,.07)", border:"1px solid rgba(124,58,237,.18)",
            }}>
              <span style={{ color:"#7c3aed", fontWeight:700, fontSize:"13px", minWidth:"18px", fontFamily:"var(--font-b)" }}>{i+1}.</span>
              <span style={{ color:"#c4b5fd", fontSize:"13px", lineHeight:"1.6", fontFamily:"var(--font-b)" }}>{idea}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── LOADING SKELETON ─── */
function Skeleton() {
  return (
    <div className="card fi" style={{ padding:"28px" }}>
      {[100,70,85,60,90].map((w,i) => (
        <div key={i} style={{
          height:"14px", borderRadius:"7px", marginBottom:"14px", width:`${w}%`,
          background:"linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 100%)",
          backgroundSize:"200% 100%",
          animation:`shimmer 1.5s ease-in-out ${i*.12}s infinite`,
        }}/>
      ))}
      <p style={{ color:"var(--muted)", fontSize:"13px", textAlign:"center", marginTop:"8px", fontFamily:"var(--font-b)" }}>
        AI создаёт твой вирусный сценарий...
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function TrendReelMaker() {
  const [platform, setPlatform] = useState("instagram_reels");
  const [topic,    setTopic]    = useState("");
  const [status,   setStatus]   = useState("idle"); // idle | loading | success | error
  const [result,   setResult]   = useState(null);
  const [errMsg,   setErrMsg]   = useState("");
  const [modal,    setModal]    = useState(null);
  const [showZero, setShowZero] = useState(false);
  const textRef  = useRef(null);
  const resultRef= useRef(null);

  const handleGenerate = async () => {
    if (!topic.trim() || status === "loading") return;
    setStatus("loading");
    setResult(null);
    setErrMsg("");
    try {
      const data = await callAI(platform, topic.trim());
      setResult(data);
      setStatus("success");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 150);
    } catch (e) {
      setStatus("error");
      setErrMsg(e.message || "Неизвестная ошибка. Попробуй ещё раз.");
    }
  };

  const onKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
  };

  const pickTopic = t => {
    setTopic(t);
    setShowZero(false);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  const canGen = topic.trim().length > 0 && status !== "loading";

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", fontFamily:"var(--font-b)", position:"relative" }}>
      <style>{CSS}</style>
      <Orbs/>

      <div style={{ position:"relative", zIndex:1, maxWidth:"760px", margin:"0 auto", padding:"0 18px 100px" }}>

        {/* ── HEADER ── */}
        <header style={{ textAlign:"center", padding:"clamp(40px,8vw,80px) 0 clamp(28px,5vw,44px)" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            padding:"6px 16px", borderRadius:"40px",
            border:"1px solid rgba(124,58,237,.35)", background:"rgba(124,58,237,.08)",
            marginBottom:"22px", fontSize:"12px", color:"#a78bfa", fontWeight:500,
            fontFamily:"var(--font-b)",
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#7c3aed", animation:"pulse 2s infinite", display:"inline-block" }}/>
            AI-powered · Мгновенная генерация
          </div>

          <h1 style={{
            fontFamily:"var(--font-d)", fontWeight:400, fontStyle:"italic",
            fontSize:"clamp(42px,8vw,72px)", lineHeight:"1.0", letterSpacing:"-1px",
            background:"linear-gradient(140deg,#ffffff 25%,#c4b5fd 55%,#93c5fd 85%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            marginBottom:"16px",
          }}>
            Trend Reel<br/>Maker AI
          </h1>

          <p style={{ color:"var(--muted)", fontSize:"clamp(14px,2.5vw,17px)", maxWidth:"400px", margin:"0 auto", lineHeight:1.65 }}>
            Создавай вирусные сценарии для Reels,<br/>TikTok и YouTube Shorts — за 10 секунд
          </p>
        </header>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ display:"flex", gap:"8px", justifyContent:"center", flexWrap:"wrap", marginBottom:"28px" }}>
          <button className="pill" onClick={() => setModal("instagram")}>📸 Instagram Trends</button>
          <button className="pill" onClick={() => setModal("youtube")}>▶ YouTube Trends</button>
          <button className={`pill ${showZero ? "on" : ""}`} onClick={() => setShowZero(v => !v)}>✦ Start from zero</button>
        </div>

        {/* ── ZERO IDEAS ── */}
        {showZero && (
          <div className="card fu" style={{ padding:"20px", marginBottom:"20px" }}>
            <p className="lbl" style={{ color:"#a78bfa", marginBottom:"14px" }}>💡 Идеи для вдохновения</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"8px" }}>
              {ZERO_IDEAS.map((idea,i) => (
                <button key={i} className="zidea" onClick={() => pickTopic(idea.text)}>
                  <span style={{ fontSize:"16px", flexShrink:0 }}>{idea.emoji}</span>
                  <span>{idea.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── INPUT CARD ── */}
        <div className="card" style={{ padding:"clamp(18px,4vw,28px)", marginBottom:"20px" }}>

          {/* Platform selector */}
          <div style={{ marginBottom:"22px" }}>
            <p className="lbl" style={{ color:"var(--muted)", marginBottom:"12px" }}>Платформа</p>
            <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
              {PLATFORMS.map(p => {
                const active = platform === p.id;
                return (
                  <button key={p.id} className="pbtn"
                    onClick={() => setPlatform(p.id)}
                    style={{
                      border:`1.5px solid ${active ? p.color : "rgba(255,255,255,.08)"}`,
                      background: active ? p.bg : "rgba(255,255,255,.025)",
                      color: active ? p.color : "#64748b",
                      boxShadow: active ? `0 0 22px ${p.color}28` : "none",
                    }}
                  >
                    <span style={{fontSize:"15px"}}>{p.icon}</span>
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic textarea */}
          <div style={{ marginBottom:"20px" }}>
            <p className="lbl" style={{ color:"var(--muted)", marginBottom:"12px" }}>Тема видео</p>
            <textarea
              ref={textRef}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={onKey}
              placeholder="Опиши тему... мотивация для студентов, ибратли видео, лайфхак для сна"
              rows={3}
              style={{
                width:"100%", padding:"14px 16px", borderRadius:"12px",
                border:`1px solid ${topic ? "rgba(124,58,237,.4)" : "var(--border)"}`,
                background:"rgba(255,255,255,.025)", color:"var(--text)",
                fontSize:"15px", fontFamily:"var(--font-b)", lineHeight:"1.6",
                resize:"vertical", minHeight:"90px", transition:"border-color .2s,box-shadow .2s", outline:"none",
              }}
              onFocus={e => { e.target.style.borderColor="rgba(124,58,237,.55)"; e.target.style.boxShadow="0 0 0 3px rgba(124,58,237,.1)"; }}
              onBlur={e  => { e.target.style.borderColor=topic?"rgba(124,58,237,.35)":"var(--border)"; e.target.style.boxShadow="none"; }}
            />
            <div style={{ display:"flex", gap:"6px", marginTop:"10px", flexWrap:"wrap" }}>
              {TOPICS.map(t => (
                <button key={t} className={`chip ${topic===t?"on":""}`} onClick={() => setTopic(t)}>{t}</button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button className="genbtn" onClick={handleGenerate} disabled={!canGen}
            style={{
              background: canGen
                ? "linear-gradient(135deg,#7c3aed 0%,#4f46e5 50%,#2563eb 100%)"
                : "rgba(255,255,255,.04)",
              color: canGen ? "#fff" : "var(--muted)",
              boxShadow: canGen ? "0 4px 28px rgba(124,58,237,.35)" : "none",
            }}
          >
            {status === "loading" ? (
              <><span className="spinner"/><span>Генерирую сценарий...</span></>
            ) : (
              <><span style={{fontSize:"16px"}}>✦</span><span>Создать сценарий</span></>
            )}
          </button>

          <p style={{ textAlign:"center", color:"#1e2a3a", fontSize:"11px", marginTop:"10px", fontFamily:"var(--font-b)" }}>
            Enter — быстрая генерация · Shift+Enter — новая строка
          </p>
        </div>

        {/* ── ERROR ── */}
        {status === "error" && (
          <div className="card fu" style={{
            padding:"16px 18px", marginBottom:"20px",
            background:"rgba(239,68,68,.07)", borderColor:"rgba(239,68,68,.25)",
            display:"flex", gap:"12px", alignItems:"flex-start",
          }}>
            <span style={{ fontSize:"18px", flexShrink:0 }}>⚠️</span>
            <div style={{ flex:1 }}>
              <p style={{ color:"#f87171", fontWeight:600, fontSize:"13px", marginBottom:"4px", fontFamily:"var(--font-b)" }}>Ошибка генерации</p>
              <p style={{ color:"#fca5a5", fontSize:"13px", lineHeight:1.5, fontFamily:"var(--font-b)" }}>{errMsg}</p>
            </div>
            <button onClick={handleGenerate} style={{
              flexShrink:0, padding:"6px 14px", borderRadius:"8px",
              border:"1px solid rgba(239,68,68,.3)", background:"rgba(239,68,68,.1)",
              color:"#f87171", cursor:"pointer", fontSize:"12px", fontWeight:600, fontFamily:"var(--font-b)",
            }}>Повторить</button>
          </div>
        )}

        {/* ── SKELETON ── */}
        {status === "loading" && <Skeleton/>}

        {/* ── RESULT ── */}
        {status === "success" && result && (
          <div ref={resultRef}>
            <ScriptResult result={result} platform={platform}/>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer style={{ textAlign:"center", marginTop:"clamp(40px,8vw,70px)", paddingBottom:"20px" }}>
          <p style={{ color:"#1e2535", fontSize:"12px", fontFamily:"var(--font-b)" }}>
            Trend Reel Maker AI · Powered by Claude
          </p>
        </footer>
      </div>

      {/* ── MODALS ── */}
      {modal && (
        <TrendModal
          type={modal}
          onClose={() => setModal(null)}
          onSelect={tag => { setTopic(tag); setTimeout(() => textRef.current?.focus(), 100); }}
        />
      )}
    </div>
  );
}
