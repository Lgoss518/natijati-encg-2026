"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Lang = "ar" | "fr";
type Network = "fst" | "est";
type Program = { city: string; program: string; seats: number; group: string };
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

export default function AcademicSimulator({ network, lang }: { network: Network; lang: Lang }) {
  const fr = lang === "fr";
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [city, setCity] = useState("");
  const [program, setProgram] = useState("");
  const [bac, setBac] = useState("PC");
  const [national, setNational] = useState("14");
  const [regional, setRegional] = useState("14");
  const [result, setResult] = useState<{ base: number; weighted: number; coefficient: number; item: Program } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setCatalog(null); setResult(null); setError("");
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
    if (programs.length && !programs.some((item) => item.program === program)) setProgram(programs[0].program);
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
    setResult({ base, weighted: base * coefficient, coefficient, item });
  }

  return <section className="academic-simulator" id="academic-simulator">
    <div className="academic-intro">
      <span>{network.toUpperCase()} • 2026/2027</span>
      <h1>{fr ? "Calculez votre score officiel" : "حسب النقطة الرسمية ديالك"}</h1>
      <p>{fr ? "La note, le coefficient et la capacité exacte sont vérifiés à partir de la note ministérielle. La probabilité sera activée après validation des seuils historiques." : "النقطة والمعامل وعدد المقاعد مأخوذين من المذكرة الوزارية. نسبة القبول غادي تتفعل من بعد ما نثبتو العتبات التاريخية."}</p>
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
        <article>
          <span>{fr ? "CONFIANCE EXPLORATOIRE" : "الثقة: استكشافية"}</span>
          <p>{fr ? "Le calcul officiel est exact. Le pourcentage d’admission n’est pas encore affiché car le dernier seuil vérifié de cette ville-filière manque." : "حساب النقطة صحيح. ما عرضناش نسبة القبول دابا حيث آخر عتبة مؤكدة لهاد المدينة والمسلك مازال ما توفراتش."}</p>
        </article>
      </div>}
    </div>
  </section>;
}
