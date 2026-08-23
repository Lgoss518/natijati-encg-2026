"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Lang = "ar" | "fr";
type Network = "ensa" | "ensam" | "health";
type Item = { city: string; track: string; status: string; candidates_remaining?: number; max_current_rank?: number; choice_1?: number; choice_2?: number; choice_3?: number };
type Catalog = { network: Network; campaign: string; reference_date: string; next_result: string | null; items: Item[] };

const titles = { ensa: "ENSA", ensam: "ENSAM", health: "Médecine • Pharmacie • Dentaire" };

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
      <header><div><small>{fr ? "POSITION ANALYSÉE" : "الوضعية المحللة"}</small><h2>{result.item.city} • {result.item.track}</h2><p>Rang {result.rank} • Choix {result.choice}</p></div><span className="confidence">{result.item.status === "verified_snapshot" ? (fr ? "Liste vérifiée" : "لائحة مؤكدة") : (fr ? "Calibration" : "قيد المعايرة")}</span></header>
      {result.item.status === "verified_snapshot" ? <div className="rank-facts"><article><small>{fr ? "Candidats encore classés" : "المترشحين اللي باقين"}</small><strong>{result.item.candidates_remaining}</strong></article><article><small>{fr ? "Choix 1 dans la liste" : "Choix 1 فاللائحة"}</small><strong>{choiceTotal}</strong></article><article><small>{fr ? "Position relative" : "الموقع داخل اللائحة"}</small><strong>{relative}%</strong></article></div> : null}
      <div className="rank-guidance"><b>{fr ? "Probabilité en cours de calibration" : "النسبة مازال كتراجع"}</b><p>{fr ? "Votre rang est enregistré dans le bon contexte. Le pourcentage sera affiché dès que le mouvement entre deux phases comparables sera vérifié; aucune valeur arbitraire n’est utilisée." : "الرتبة تحطات فالسياق الصحيح. النسبة غادي تبان ملي نثبتو الحركة بين جوج لوائح متشابهة؛ ما كنستعملوش رقم عشوائي."}</p>{catalog?.next_result && <small>{fr ? `Prochaine consultation annoncée : ${catalog.next_result}` : `الموعد المعلن للنتيجة الجاية: ${catalog.next_result}`}</small>}</div>
    </div>}
    </div>
  </section>;
}
