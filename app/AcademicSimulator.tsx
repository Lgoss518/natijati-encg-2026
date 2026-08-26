"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Lang = "ar" | "fr";
type Network = "fst" | "est" | "ens";
type Historical = { historicalSeats: number; lateVacancies: number; vacancyRate: number; observedPhases: number; maxObservedRank?: number; waitlistLength?: number; evidence: "direct" | "city" | "network" };
type Program = { city: string; program: string; seats: number; group: string; historical?: Historical };
type Catalog = { network: Network; campaign: string; programs: Program[]; weights: Record<string, number> };

const bacTracks = [
  ["SMA", "Sciences Mathématiques A"], ["SMB", "Sciences Mathématiques B"],
  ["PC", "Sciences Physiques"], ["SVT", "Sciences de la Vie et de la Terre"],
  ["AGRI", "Sciences Agronomiques"], ["STE", "Sciences et Technologies Électriques"],
  ["STM", "Sciences et Technologies Mécaniques"], ["S_ECO", "Sciences Économiques"],
  ["S_GESTION_COMPTABLE", "Sciences de Gestion Comptable"],
];

const trackNames: Record<string, string> = {
  GB: "Génie Biologique", GEG: "Génie de l’Environnement et Géosciences",
  GMSI: "Génie Mécanique et Systèmes Industriels", GP: "Génie Physique",
  MSD: "Mathématiques et Sciences des Données", GI: "Génie Informatique",
  GESE: "Génie Électrique et Systèmes Embarqués", GC: "Génie Chimique",
};

function ensChance(score: number, seats: number) {
  const capacityBoost = Math.min(4, Math.max(-5, (seats - 1150) / 170));
  const preselection = Math.max(5, Math.min(96, Math.round(100 / (1 + Math.exp((18.5 - score) / 1.9)) + capacityBoost)));
  const final = Math.max(4, Math.min(94, Math.round(preselection * .78 + 8)));
  return { preselection, final };
}

function academicChance(network: Network, base: number, coefficient: number, item: Program) {
  if (network === "ens") return ensChance(base * coefficient, item.seats);
  const history = item.historical;
  const effective = base + (coefficient - 1) * 4;
  const capacityBoost = Math.max(-.45, Math.min(.65, Math.log2(Math.max(35, item.seats) / 75) * .28));
  const competitive = network === "fst" ? (item.program === "GI" || item.program === "MSD" ? .55 : 0) : (item.group === "it" ? .45 : item.group === "management" ? .2 : 0);
  const threshold = (network === "fst" ? 15.75 : 15.35) + competitive - capacityBoost;
  const logistic = (cut: number, slope: number) => 100 / (1 + Math.exp((cut - effective) / slope));
  const mobility = history?.evidence === "direct" ? Math.min(.72, .12 + history.vacancyRate * .72 + Math.min(.12, history.observedPhases * .05))
    : history?.evidence === "city" ? .27 : network === "fst" ? .22 : .3;
  const main = Math.max(2, Math.min(96, Math.round(logistic(threshold, 1.18))));
  const list2 = Math.max(main, Math.min(97, Math.round(main + (100 - main) * Math.min(.58, mobility * .62))));
  const list3 = Math.max(list2, Math.min(98, Math.round(main + (100 - main) * Math.min(.76, mobility * .86))));
  const overall = Math.max(list3, Math.min(99, Math.round(main + (100 - main) * Math.min(.84, mobility))));
  return { main, list2, list3, overall, effective };
}

export default function AcademicSimulator({ network, lang }: { network: Network; lang: Lang }) {
  const fr = lang === "fr";
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [city, setCity] = useState("");
  const [program, setProgram] = useState("");
  const [bac, setBac] = useState("PC");
  const [national, setNational] = useState("14");
  const [regional, setRegional] = useState("14");
  const [result, setResult] = useState<{ base: number; weighted: number; coefficient: number; item: Program; odds: { preselection?: number; final?: number; main?: number; list2?: number; list3?: number; overall?: number; effective?: number } } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    queueMicrotask(() => { setCatalog(null); setResult(null); setError(""); });
    fetch(`/api/catalog?network=${network}`).then((response) => {
      if (!response.ok) throw new Error();
      return response.json();
    }).then((data: Catalog) => {
      setCatalog(data);
      const first = data.programs[0];
      setCity(first?.city || "");
      setProgram(first?.program || "");
    }).catch(() => setError(fr ? "Le catalogue est momentanément indisponible." : "لائحة المسالك ما متوفراش مؤقتاً."));
  }, [network, fr]);

  const cities = useMemo(() => [...new Set(catalog?.programs.map((item) => item.city) || [])], [catalog]);
  const programs = useMemo(() => catalog?.programs.filter((item) => item.city === city) || [], [catalog, city]);

  useEffect(() => {
    if (programs.length && !programs.some((item) => item.program === program)) queueMicrotask(() => setProgram(programs[0].program));
  }, [programs, program]);

  function calculate(event: FormEvent) {
    event.preventDefault(); setError(""); setResult(null);
    const n = Number(national), r = Number(regional);
    if (![n, r].every((value) => Number.isFinite(value) && value >= 0 && value <= 20)) {
      setError(fr ? "Les notes doivent être comprises entre 0 et 20." : "النقط خاصها تكون بين 0 و20."); return;
    }
    const item = catalog?.programs.find((entry) => entry.city === city && entry.program === program);
    if (!item || !catalog) return;
    const coefficient = catalog.weights[`${item.group}:${bac}`];
    if (!coefficient) {
      setError(fr ? "Cette série du bac n’est pas éligible à cette filière selon la grille publiée." : "هاد شعبة الباك ما مؤهلاش لهاد المسلك حسب شبكة الترجيح المنشورة."); return;
    }
    const base = .75 * n + .25 * r;
    const weighted = base * coefficient;
    setResult({ base, weighted, coefficient, item, odds: academicChance(network, base, coefficient, item) });
  }

  return <section className="academic-simulator" id="academic-simulator">
    <div className="academic-intro">
      <span>{network.toUpperCase()} • 2026/2027</span>
      <h1>{fr ? (network === "ens" ? "Estimez votre sélection ENS" : "Calculez vos chances d’admission") : (network === "ens" ? "قدّر فرصتك فـENS" : "حسب فرص القبول ديالك")}</h1>
      <p>{fr ? (network === "ens" ? "Le calcul suit la formule de présélection ENS/ESEF : 75% national, 25% régional, puis coefficient de pondération. Le final reste lié à l’oral." : "Estimation calibrée par ville et filière : score pondéré, capacité 2026 et mouvement réellement observé dans les listes 2025.") : (network === "ens" ? "الحساب تابع لصيغة الانتقاء ديال ENS/ESEF: 75% الوطني، 25% الجهوي، ثم معامل الترجيح. القبول النهائي كيبقى مرتبط بالشفوي." : "تقدير مضبوط حسب المدينة والمسلك: النقطة المرجحة، مقاعد 2026، والحركة الحقيقية ديال لوائح 2025.")}</p>
    </div>
    <div className="academic-card">
      <form onSubmit={calculate}>
        <label><span>{fr ? "Série du baccalauréat" : "شعبة الباك"}</span><select value={bac} onChange={(event) => setBac(event.target.value)}>{bacTracks.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label><span>{fr ? "Note nationale" : "نقطة الوطني"}</span><input inputMode="decimal" value={national} onChange={(event) => setNational(event.target.value)} /></label>
        <label><span>{fr ? "Note régionale" : "نقطة الجهوي"}</span><input inputMode="decimal" value={regional} onChange={(event) => setRegional(event.target.value)} /></label>
        <label><span>{fr ? "Ville" : "المدينة"}</span><select value={city} onChange={(event) => setCity(event.target.value)} disabled={!catalog}>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="academic-program"><span>{fr ? (network === "fst" ? "Tronc commun" : "Filière") : (network === "fst" ? "الجذع المشترك" : "المسلك")}</span><select value={program} onChange={(event) => setProgram(event.target.value)} disabled={!catalog}>{programs.map((item) => <option key={item.program} value={item.program}>{network === "fst" ? `${item.program} — ${trackNames[item.program] || item.program}` : item.program}</option>)}</select></label>
        {error && <p className="academic-error">⚠ {error}</p>}
        <button type="submit" disabled={!catalog}>{fr ? "Calculer mon score" : "حسب النقطة ديالي"}</button>
      </form>
      {result && <div className="academic-result" aria-live="polite">
        <div><small>{fr ? "Score de base" : "النقطة الأساسية"}</small><strong>{result.base.toFixed(2)}</strong></div>
        <div className="primary"><small>{fr ? "Score pondéré" : "النقطة بعد الترجيح"}</small><strong>{result.weighted.toFixed(2)}</strong></div>
        <div><small>{fr ? "Coefficient appliqué" : "المعامل المطبق"}</small><strong>× {result.coefficient.toFixed(1)}</strong></div>
        <div><small>{fr ? "Capacité officielle" : "عدد المقاعد الرسمي"}</small><strong>{result.item.seats}</strong></div>
        <article className="academic-odds">
          <span>{fr ? `PROBABILITÉS ${network.toUpperCase()}` : `نسب ${network.toUpperCase()}`}</span>
          {network === "ens" ? <div><b>{result.odds.preselection}%</b><small>{fr ? "présélection" : "الانتقاء الأولي"}</small></div> : <>
            <div><b>{result.odds.main}%</b><small>{fr ? "liste principale" : "اللائحة الرئيسية"}</small></div>
            <div><b>{result.odds.list2}%</b><small>{fr ? "jusqu’à la liste 2" : "حتى اللائحة 2"}</small></div>
            <div><b>{result.odds.list3}%</b><small>{fr ? "jusqu’à la liste 3" : "حتى اللائحة 3"}</small></div>
            <div className="overall"><b>{result.odds.overall}%</b><small>{fr ? "chance globale" : "الحظ الإجمالي"}</small></div>
          </>}
          {network === "ens" && <div><b>{result.odds.final}%</b><small>{fr ? "final estimé" : "النهائي المتوقع"}</small></div>}
        </article>
        <article>
          <span>{fr ? `CONFIANCE ${result.item.historical?.evidence === "direct" ? "ÉLEVÉE" : result.item.historical?.evidence === "city" ? "MOYENNE" : "PRUDENTE"}` : `درجة الثقة: ${result.item.historical?.evidence === "direct" ? "مرتفعة" : result.item.historical?.evidence === "city" ? "متوسطة" : "حذرة"}`}</span>
          <p>{fr ? (result.item.historical?.evidence === "direct" ? `Modèle appuyé par ${result.item.historical.lateVacancies} place(s) vacante(s) observée(s) en 2025 pour cette filière, sur ${result.item.historical.historicalSeats} places.` : result.item.historical?.evidence === "city" ? "Aucune donnée complète pour cette filière : calibration fondée sur le mouvement observé dans la même ville." : "Aucune liste historique exploitable pour ce couple ville–filière : estimation fondée sur les capacités et le comportement global du réseau.") : (result.item.historical?.evidence === "direct" ? `الحساب مدعوم بـ${result.item.historical.lateVacancies} مقعد شاغر تسجل فـ2025 فهاد المسلك، من أصل ${result.item.historical.historicalSeats} مقعد.` : result.item.historical?.evidence === "city" ? "ما كايناش معطيات كاملة لهاد المسلك؛ الحساب مبني على الحركة اللي تسجلات فنفس المدينة." : "ما كايناش لائحة تاريخية كاملة لهاد المدينة والمسلك؛ التقدير مبني على المقاعد والحركة العامة ديال الشبكة.")}</p>
        </article>
      </div>}
    </div>
  </section>;
}
