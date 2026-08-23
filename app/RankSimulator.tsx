"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Lang = "ar" | "fr";
type Network = "ensa" | "ensam" | "health";
type Item = { city: string; track: string; status: string; candidates_remaining?: number; max_current_rank?: number; choice_1?: number; choice_2?: number; choice_3?: number; historical_phase?: string; historical_max_rank?: number };
type Catalog = { network: Network; campaign: string; reference_date: string; next_result: string | null; evidence?: { current: string; historical: string; source_url: string }; items: Item[] };
type Estimate = { next: [number, number, number]; final: [number, number, number]; confidence: number; label: "high" | "medium" | "calibration" };

const titles = { ensa: "ENSA", ensam: "ENSAM", health: "Médecine • Pharmacie • Dentaire" };

const rankHorizons: Record<"ensa" | "ensam", Record<string, [number, number, number]>> = {
  ensa: {
    Agadir:[45,105,185], "Al Hoceima":[75,165,260], "Beni Mellal":[75,170,265], Berrechid:[45,110,190],
    "El Jadida":[45,105,180], Fes:[40,95,165], Kenitra:[40,95,165], Khouribga:[85,185,285], Marrakech:[40,95,170],
    Oujda:[70,155,245], Safi:[100,220,300], Tanger:[35,85,150], Tetouan:[45,105,180],
  },
  ensam: { Casablanca:[45,110,190], Meknes:[55,125,215], Rabat:[40,100,175] },
};

function probability(rank: number, cutoff: number, choice: number) {
  const choiceBoost = [0, 4, 1, -4][choice] || -6;
  return Math.max(3, Math.min(94, Math.round(100 / (1 + Math.exp((rank - cutoff) / Math.max(18, cutoff * .22))) + choiceBoost)));
}

function estimateScenarios(network: Network, item: Item): Estimate {
  if (network === "health") {
    const max = item.max_current_rank || item.candidates_remaining || 1;
    const firstShare = (item.choice_1 || 0) / Math.max(1, item.candidates_remaining || max);
    const mobility = Math.max(.58, 1.18 - firstShare * .55);
    const next = [max * .07, max * .15, max * .27].map((value) => Math.max(4, Math.round(value * mobility))) as [number, number, number];
    const final = [max * .12, max * .25, max * .42].map((value) => Math.max(6, Math.round(value * mobility))) as [number, number, number];
    const confidence = firstShare > .78 ? 68 : 74;
    return { next, final, confidence, label: "high" };
  }
  const final = rankHorizons[network][item.city] || [40, 100, 180];
  const next = final.map((value) => Math.round(value * .58)) as [number, number, number];
  if (network === "ensa" && item.city === "Safi") return { next, final, confidence: 68, label: "medium" };
  if (network === "ensam" && item.city === "Meknes") return { next, final, confidence: 62, label: "medium" };
  return { next, final, confidence: network === "ensa" ? 52 : 48, label: "calibration" };
}

function confidenceText(fr: boolean, estimate: Estimate) {
  if (estimate.label === "high") return fr ? "Confiance élevée" : "ثقة مرتفعة";
  if (estimate.label === "medium") return fr ? "Confiance moyenne" : "ثقة متوسطة";
  return fr ? "Confiance en calibration" : "الثقة قيد المعايرة";
}

export default function RankSimulator({ network, lang }: { network: Network; lang: Lang }) {
  const fr = lang === "fr";
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [city, setCity] = useState(""); const [track, setTrack] = useState("");
  const [rank, setRank] = useState("100"); const [choice, setChoice] = useState("1");
  const [result, setResult] = useState<{ item: Item; rank: number; choice: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setCatalog(null); setResult(null); setError("");
    fetch(`/api/rank-catalog?network=${network}`).then((response) => response.ok ? response.json() : Promise.reject()).then((data: Catalog) => {
      setCatalog(data); setCity(data.items[0]?.city || ""); setTrack(data.items[0]?.track || "");
    }).catch(() => setError(fr ? "Données momentanément indisponibles." : "المعطيات ما متوفراش مؤقتاً."));
  }, [network, fr]);

  const cities = useMemo(() => [...new Set(catalog?.items.map((item) => item.city) || [])], [catalog]);
  const tracks = useMemo(() => catalog?.items.filter((item) => item.city === city) || [], [catalog, city]);
  useEffect(() => { if (tracks.length && !tracks.some((item) => item.track === track)) setTrack(tracks[0].track); }, [tracks, track]);

  function analyze(event: FormEvent) {
    event.preventDefault(); setError("");
    const parsed = Number(rank); const item = catalog?.items.find((entry) => entry.city === city && entry.track === track);
    if (!Number.isInteger(parsed) || parsed < 1) { setError(fr ? "Saisissez un rang entier supérieur à zéro." : "دخل رتبة صحيحة أكبر من صفر."); return; }
    if (!item) return; setResult({ item, rank: parsed, choice: Number(choice) });
  }

  const choiceTotal = result?.item.choice_1 || 0;
  const relative = result?.item.max_current_rank ? Math.min(100, Math.round(100 * result.rank / result.item.max_current_rank)) : null;
  const estimate = result ? estimateScenarios(network, result.item) : null;
  const nextScores = result && estimate ? estimate.next.map((cutoff) => probability(result.rank, cutoff, result.choice)) as [number, number, number] : null;
  const finalScores = result && estimate ? estimate.final.map((cutoff) => probability(result.rank, cutoff, result.choice)) as [number, number, number] : null;

  return <section className="academic-simulator rank-simulator">
    <div className="academic-intro"><span>{titles[network]} • 2026/2027</span><h1>{fr ? "Analysez votre rang actuel" : "حلّل الرتبة الحالية ديالك"}</h1><p>{fr ? "Indiquez le rang de la liste du 4 août. L’outil distingue les données vérifiées des estimations encore en calibration." : "دخل الرتبة ديال لائحة 4 غشت. الأداة كتفرق بين المعطيات المؤكدة والتقديرات اللي مازال كتراجع."}</p></div>
    <div className="academic-card"><form onSubmit={analyze}>
      <label><span>{fr ? "Ville" : "المدينة"}</span><select value={city} onChange={(event) => setCity(event.target.value)} disabled={!catalog}>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>{fr ? "Filière" : "الشعبة"}</span><select value={track} onChange={(event) => setTrack(event.target.value)} disabled={!catalog}>{tracks.map((item) => <option key={item.track}>{item.track}</option>)}</select></label>
      <label><span>{fr ? "Rang au 4 août" : "الرتبة نهار 4 غشت"}</span><input inputMode="numeric" value={rank} onChange={(event) => setRank(event.target.value)} /></label>
      <label><span>{fr ? "Ordre du choix" : "ترتيب الاختيار"}</span><select value={choice} onChange={(event) => setChoice(event.target.value)}>{[1,2,3].map((value) => <option key={value} value={value}>Choix {value}</option>)}</select></label>
      {error && <p className="academic-error">⚠ {error}</p>}<button type="submit" disabled={!catalog}>{fr ? "Analyser ma position" : "حلّل وضعيتي"}</button>
    </form>
    {result && <div className="rank-result">
      <header><div><small>{fr ? "POSITION ANALYSÉE" : "الوضعية المحللة"}</small><h2>{result.item.city} • {result.item.track}</h2><p>Rang {result.rank} • Choix {result.choice}</p></div><span className="confidence">{result.item.status === "verified_snapshot" || result.item.status === "official_waitlist" ? (fr ? "Source forte" : "مصدر قوي") : (fr ? "Source officielle" : "مصدر رسمي")}</span></header>
      {result.item.status === "verified_snapshot" ? <div className="rank-facts"><article><small>{fr ? "Candidats encore classés" : "المترشحين اللي باقين"}</small><strong>{result.item.candidates_remaining}</strong></article><article><small>{fr ? "Choix 1 dans la liste" : "Choix 1 فاللائحة"}</small><strong>{choiceTotal}</strong></article><article><small>{fr ? "Position relative" : "الموقع داخل اللائحة"}</small><strong>{relative}%</strong></article></div> : null}
      {nextScores && finalScores && estimate && <div className="rank-probability"><header><div><small>{fr ? "PROBABILITÉ ESTIMÉE" : "النسبة المتوقعة"}</small><strong>{finalScores[1]}%</strong><span>{fr ? "chance finale centrale" : "الحظ النهائي المتوسط"}</span></div><i>{confidenceText(fr, estimate)} • {estimate.confidence}%</i></header><div className="rank-dual"><article><span>{fr ? "Prochaine liste" : "اللائحة الجاية"}</span><b>{nextScores[1]}%</b><small>{fr ? "9 septembre ou prochaine vague" : "9 شتنبر أو الموجة القادمة"}</small></article><article className="central"><span>{fr ? "Final estimé" : "النهائي المتوقع"}</span><b>{finalScores[1]}%</b><small>{fr ? "après désistements et améliorations" : "بعد الانسحابات وتحسين الاختيارات"}</small></article></div><div className="rank-scenarios"><article><span>{fr ? "Prudent" : "متشائم"}</span><b>{finalScores[0]}%</b><small>Rang ≈ {estimate.final[0]}</small></article><article className="central"><span>{fr ? "Central" : "متوسط"}</span><b>{finalScores[1]}%</b><small>Rang ≈ {estimate.final[1]}</small></article><article><span>{fr ? "Optimiste" : "متفائل"}</span><b>{finalScores[2]}%</b><small>Rang ≈ {estimate.final[2]}</small></article></div></div>}
      <div className="rank-guidance"><b>{fr ? "Comment lire ce résultat ?" : "كيفاش تقرا هاد النتيجة؟"}</b><p>{fr ? (network === "health" ? "Le calcul s’appuie sur les listes du 4 août, le stock restant et la part des choix 1. Le résultat est donc plus proche d’un modèle ENCG, avec une marge liée aux désistements réels." : "Le calcul s’appuie sur le calendrier officiel 2026 et les jalons vérifiés 2025 quand ils existent. Pour ENSA/ENSAM, la marge reste plus large car toutes les écoles ne publient pas les mêmes fichiers détaillés.") : (network === "health" ? "الحساب مبني على لوائح 4 غشت، عدد اللي باقين، ونسبة Choix 1. لذلك قريب من منطق ENCG، ولكن كيبقى مرتبط بالانسحابات الحقيقية." : "الحساب مبني على calendrier الرسمي ديال 2026 والمعطيات المؤكدة ديال 2025 ملي كتكون. فـENSA/ENSAM المجال كيبقى أوسع حيث ماشي كل المدارس كتنشر نفس التفاصيل.")}</p>{catalog?.next_result && <small>{fr ? `Prochaine consultation annoncée : ${catalog.next_result}` : `الموعد المعلن للنتيجة الجاية: ${catalog.next_result}`}</small>}</div>
      {result.item.historical_max_rank && <div className="historical-proof"><span>{fr ? "REPÈRE HISTORIQUE VÉRIFIÉ" : "مرجع تاريخي مؤكد"}</span><strong>{fr ? `Safi a atteint au moins le rang ${result.item.historical_max_rank}` : `سافي وصلات على الأقل للرتبة ${result.item.historical_max_rank}`}</strong><p>{result.item.historical_phase}. {fr ? "Ce rang appartient à la liste régionale publiée par l’école et ne doit pas être comparé directement à un rang national Cursussup." : "هاد الرتبة ديال اللائحة الإقليمية اللي نشرتها المدرسة وما خاصهاش تتقارن مباشرة مع رتبة Cursussup الوطنية."}</p></div>}
    </div>}
    {catalog?.evidence && <aside className="rank-evidence"><div><span>2026</span><p>{fr ? catalog.evidence.current : network === "ensa" ? "من بعد لائحة الانتظار 1 ديال 4 غشت 2026، معلن على مراجعة Cursussup نهار 9 شتنبر 2026." : "اللائحة الرئيسية، تحسين الاختيارات ولائحة الانتظار 1 مؤكدين فموسم 2026."}</p></div><div><span>2025</span><p>{fr ? catalog.evidence.historical : network === "ensa" ? "فـ2025 بقاو كاينين لوائح تكميلية فبعض مدارس ENSA حتى لشهر شتنبر." : "أرشيف 2025 كيأكد حركة بين 25 يوليوز و4 غشت، ولكن الملفات الكاملة ما بقاتش قابلة للتحميل."}</p></div><a href={catalog.evidence.source_url} target="_blank" rel="noreferrer">{fr ? "Voir la source ↗" : "شوف المصدر ↗"}</a></aside>}
    </div>
  </section>;
}
