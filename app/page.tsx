"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AcademicSimulator from "./AcademicSimulator";
import RankSimulator from "./RankSimulator";

type Entry = [number, number];
type CandidateData = Record<string, Record<string, Entry>>;
type School = { key:string; name:string; low:number; mid:number; high:number; seats:number };
type Lang = "ar" | "fr";
type Network = "encg" | "est" | "fst" | "health";

const networks: Array<{ key: Network; icon: string; ar: string; fr: string; arHint: string; frHint: string }> = [
  { key:"encg", icon:"↗", ar:"ENCG", fr:"ENCG", arHint:"التجارة والتسيير", frHint:"Commerce & gestion" },
  { key:"health", icon:"✚", ar:"الصحة", fr:"Santé", arHint:"طب، صيدلة وأسنان", frHint:"Médecine, pharmacie, dentaire" },
  { key:"fst", icon:"∑", ar:"FST", fr:"FST", arHint:"العلوم والتقنيات", frHint:"Sciences & techniques" },
  { key:"est", icon:"⌘", ar:"EST", fr:"EST", arHint:"التكنولوجيا", frHint:"Technologie" },
];

const networkGuides: Record<Network, { arTitle:string; frTitle:string; arInput:string; frInput:string; arOutput:string; frOutput:string; arTip:string; frTip:string }> = {
  encg: { arTitle:"ENCG", frTitle:"ENCG", arInput:"Code Massar أو الرتبة، المدينة وترتيب الاختيار.", frInput:"Code Massar ou rang, ville et ordre du choix.", arOutput:"نسبة القبول فاللائحة الجاية، السيناريوهات الثلاثة والمنافسين الحقيقيين.", frOutput:"Chance pour la prochaine liste, trois scénarios et concurrents réels.", arTip:"الأفضل تستعمل Code Massar إلا كان عندك.", frTip:"Le Code Massar donne le résultat le plus confortable." },
  health: { arTitle:"Médecine / Pharmacie / Dentaire", frTitle:"Médecine / Pharmacie / Dentaire", arInput:"المدينة، الشعبة والرتبة ديال 4 غشت.", frInput:"Ville, filière et rang du 4 août.", arOutput:"نسبة القبول، stock restant، choix 1، prochaine liste وfinal estimé.", frOutput:"Admission, stock restant, choix 1, prochaine liste et final estimé.", arTip:"هنا المعطيات أقوى حيث كاينة لوائح 4 غشت.", frTip:"Les données sont plus solides grâce aux listes du 4 août." },
  fst: { arTitle:"FST", frTitle:"FST", arInput:"شعبة الباك، نقط الوطني/الجهوي، المدينة والجذع المشترك.", frInput:"Série du bac, notes national/régional, ville et tronc commun.", arOutput:"Score pondéré، liste principale، attente وfinal estimé.", frOutput:"Score pondéré, liste principale, attente et final estimé.", arTip:"بدل الجذع المشترك وقارن النتيجة.", frTip:"Changez de tronc commun pour comparer." },
  est: { arTitle:"EST", frTitle:"EST", arInput:"شعبة الباك، النقط، المدينة والفilière.", frInput:"Série du bac, notes, ville et filière.", arOutput:"Score pondéré، المقاعد، liste principale، attente وfinal estimé.", frOutput:"Score pondéré, places, liste principale, attente et final estimé.", arTip:"الفilières ماشي كلها بنفس الصعوبة.", frTip:"Toutes les filières n’ont pas la même pression." },
};

const schools: School[] = [
  {key:"kenitra",name:"ENCG القنيطرة",low:620,mid:660,high:720,seats:450},
  {key:"settat",name:"ENCG سطات",low:550,mid:690,high:825,seats:550},
  {key:"casablanca",name:"ENCG الدار البيضاء",low:450,mid:565,high:675,seats:580},
  {key:"tanger",name:"ENCG طنجة",low:475,mid:595,high:710,seats:500},
  {key:"agadir",name:"ENCG أكادير",low:400,mid:500,high:600,seats:500},
  {key:"fes",name:"ENCG فاس",low:395,mid:490,high:590,seats:430},
  {key:"marrakech",name:"ENCG مراكش",low:270,mid:340,high:410,seats:360},
  {key:"oujda",name:"ENCG وجدة",low:390,mid:490,high:590,seats:360},
  {key:"eljadida",name:"ENCG الجديدة",low:585,mid:730,high:875,seats:330},
  {key:"benimellal",name:"ENCG بني ملال",low:520,mid:650,high:780,seats:400},
  {key:"elhajeb",name:"ENCG الحاجب",low:245,mid:305,high:370,seats:200},
  {key:"alhoceima",name:"ENCG الحسيمة",low:210,mid:265,high:315,seats:140},
  {key:"dakhla",name:"ENCG الداخلة",low:760,mid:950,high:1140,seats:300},
];

const frenchSchools: Record<string,string> = {
  kenitra:"ENCG Kénitra", settat:"ENCG Settat", casablanca:"ENCG Casablanca",
  tanger:"ENCG Tanger", agadir:"ENCG Agadir", fes:"ENCG Fès",
  marrakech:"ENCG Marrakech", oujda:"ENCG Oujda", eljadida:"ENCG El Jadida",
  benimellal:"ENCG Béni Mellal", elhajeb:"ENCG El Hajeb",
  alhoceima:"ENCG Al Hoceima", dakhla:"ENCG Dakhla",
};
const encgAccessGroups = [
  ["kenitra","casablanca","settat","eljadida"],
  ["tanger","oujda","fes","elhajeb","alhoceima"],
  ["marrakech","benimellal","agadir","dakhla"],
];
const eligibleEncgKeys=(key:string)=>encgAccessGroups.find(group=>group.includes(key))||[key];

const copy = {
  ar: {
    navSim:"المحاكي", navSchools:"المدارس", navMethod:"المنهجية", updated:"آخر تحديث: 5 شتنبر 2026",
    eyebrow:"محاكي فرص القبول • TAFEM 2026", hero1:"واش عندك فرصة تدخل", hero2:"ENCG؟",
    intro:"دخل معلوماتك وخذ تقدير شخصي مبني على الرتبة، ترتيب الاختيار، المقاعد وحركة لوائح الانتظار.",
    schoolsCount:"مدرسة مشمولة", lines:"سطر محلّل", private:"معلوماتك ما كتتخزنش",
    oneStep:"خطوة واحدة فقط", calculate:"حسب فرصتك دابا", haveRank:"عندي الرتبة", haveMassar:"عندي Code Massar",
    rankLabel:"الرتبة فلائحة 5 شتنبر", rankExample:"مثال: 126", codeExample:"مثال: J142107012",
    city:"المدينة", choiceOrder:"ترتيب هاد المدينة عندك", choice:"الاختيار", auto:"غادي نجيبو الرتبة والاختيار أوتوماتيكياً من اللائحة.",
    analyze:"حلّل فرصتي", privacy:"التحليل كيوقع فالجهاز ديالك، بلا تسجيل وبلا تخزين",
    result:"نتيجتك الشخصية", rank:"الرتبة", central:"تقدير مركزي", prudent:"سيناريو متشائم",
    probable:"السيناريو الأقرب", optimistic:"سيناريو متفائل", listNear:"اللائحة توصل تقريباً لـ",
    real:"المنافسون الحقيقيون قبلك", realText:"تقدير موزون حسب choix، من أصل {raw} مترشح فالترتيب.",
    first:"اللي حاطينها Choix 1 قبلك", firstText:"هؤلاء هما المنافسون الأقوى على نفس المدينة.",
    practical:"الخلاصة العملية", disclaimer:"هاد النتيجة تقديرية وماشي ضمان رسمي للقبول.", reset:"حساب جديد",
    overview:"نظرة شاملة", howFar:"فين ممكن توصل كل لائحة؟", overviewText:"التقدير المركزي والمجال المحتمل للـIteration المقبلة، حسب المعطيات الحالية.",
    seats:"مقعد معلن", estimate:"التقدير", trustTitle:"علاش تقدر تثق فالتحليل؟", model1:"ماشي تخمين.", model2:"نموذج مبني على المعطيات.",
    methodText:"جمعنا بين لوائح الانتظار، عدد المقاعد، ترتيب اختيارات المترشحين وحركة Iterations ديال 2025. وكل سيناريو كيعكس مستوى مختلف ديال الانسحابات وتحسين الاختيارات.",
    step1:"كنقراو الرتبة والاختيار", step1Text:"Code Massar كيخلّينا نلقاو الوضعية الصحيحة مباشرة.",
    step2:"كنحسبو المنافسة الحقيقية", step2Text:"Choix 1 ماشي بحال Choix 4، لذلك كل واحد عندو وزن مختلف.",
    step3:"كنقارنو مع حركة 2025", step3Text:"كنخرجو مجال متشائم، مركزي ومتفائل بدل وعد غير دقيق.",
    footer:"أداة مستقلة للمساعدة على فهم لوائح الانتظار، وماشي موقع رسمي تابع للوزارة.", try:"جرّب المحاكي",
    notFound:"ما لقيناش هاد Code Massar فلائحة هاد المدينة. راجع الكود أو جرّب مدينة أخرى.", invalid:"دخل رتبة صحيحة أكبر من 0.",
  },
  fr: {
    navSim:"Simulateur", navSchools:"Écoles", navMethod:"Méthodologie", updated:"Mise à jour : 5 septembre 2026",
    eyebrow:"SIMULATEUR D’ADMISSION • TAFEM 2026", hero1:"Quelles sont vos chances", hero2:"d’intégrer une ENCG ?",
    intro:"Saisissez vos informations et obtenez une estimation personnalisée fondée sur le rang, l’ordre de choix, les places et le mouvement des listes d’attente.",
    schoolsCount:"écoles analysées", lines:"lignes étudiées", private:"aucune donnée stockée",
    oneStep:"UNE SEULE ÉTAPE", calculate:"Calculez vos chances", haveRank:"J’ai mon rang", haveMassar:"J’ai mon Code Massar",
    rankLabel:"Rang dans la liste du 5 septembre", rankExample:"Exemple : 126", codeExample:"Exemple : J142107012",
    city:"École / Ville", choiceOrder:"Ordre de cette ville dans vos choix", choice:"Choix", auto:"Le rang et le choix seront récupérés automatiquement depuis la liste.",
    analyze:"Analyser mes chances", privacy:"Analyse locale, sans inscription et sans stockage",
    result:"VOTRE RÉSULTAT PERSONNALISÉ", rank:"rang", central:"estimation centrale", prudent:"Scénario prudent",
    probable:"Scénario le plus probable", optimistic:"Scénario optimiste", listNear:"La liste atteindrait environ",
    real:"Concurrents réels devant vous", realText:"Estimation pondérée selon le choix, sur {raw} candidats classés avant vous.",
    first:"Candidats en Choix 1 devant vous", firstText:"Ce sont vos concurrents les plus forts pour la même ville.",
    practical:"CONSEIL PRATIQUE", disclaimer:"Cette estimation ne constitue pas une garantie officielle d’admission.", reset:"Nouveau calcul",
    overview:"VUE D’ENSEMBLE", howFar:"Jusqu’où peut aller chaque liste ?", overviewText:"Estimation centrale et intervalle probable pour la prochaine itération, selon les données actuelles.",
    seats:"places annoncées", estimate:"ESTIMATION", trustTitle:"POURQUOI FAIRE CONFIANCE À L’ANALYSE ?", model1:"Pas une intuition.", model2:"Un modèle fondé sur les données.",
    methodText:"Nous croisons les listes d’attente, le nombre de places, l’ordre des choix et les mouvements des itérations 2025. Chaque scénario reflète un niveau différent de désistements et d’améliorations de choix.",
    step1:"Lecture du rang et du choix", step1Text:"Le Code Massar permet de retrouver directement la bonne position.",
    step2:"Calcul de la concurrence réelle", step2Text:"Un Choix 1 n’équivaut pas à un Choix 4 : chaque ordre reçoit un poids différent.",
    step3:"Comparaison avec les mouvements 2025", step3Text:"Nous affichons une fourchette prudente, centrale et optimiste plutôt qu’une promesse imprécise.",
    footer:"Outil indépendant pour mieux comprendre les listes d’attente. Site non officiel et non affilié au ministère.", try:"Essayer le simulateur",
    notFound:"Ce Code Massar ne figure pas dans la liste de cette ville. Vérifiez le code ou choisissez une autre ville.", invalid:"Saisissez un rang valide supérieur à 0.",
  },
};

const choiceWeights = [0,1,.6,.35,.15];
const clamp=(n:number,min=4,max=96)=>Math.min(max,Math.max(min,Math.round(n)));
const chance=(rank:number,cutoff:number,choice:number)=>clamp(100/(1+Math.exp((rank-cutoff)/Math.max(45,cutoff*.16)))+[0,5,2,-4,-8][choice]);
const createVisitorId=()=>typeof globalThis.crypto?.randomUUID==="function"?globalThis.crypto.randomUUID():`visitor-${Date.now()}-${Math.random().toString(36).slice(2,12)}`;

export default function Home(){
  const [lang,setLang]=useState<Lang|null>(null);
  const [entered,setEntered]=useState(false);
  const [network,setNetwork]=useState<Network>("encg");
  const activeLang:Lang=lang||"ar"; const t=copy[activeLang]; const fr=activeLang==="fr";
  const [mode,setMode]=useState<"rank"|"massar"|"global">("rank"); const [schoolKey,setSchoolKey]=useState("kenitra");
  const [value,setValue]=useState("570"); const [choice,setChoice]=useState(1); const [data,setData]=useState<CandidateData|null>(null);
  const [result,setResult]=useState<{rank:number;choice:number;school:School;real:number;raw:number;first:number;code?:string}|null>(null);
  const [globalResults,setGlobalResults]=useState<Array<{rank:number;choice:number;school:School;real:number;raw:number;first:number;code:string}>>([]);
  const [liveSchools,setLiveSchools]=useState(schools); const [modelVersion,setModelVersion]=useState("2026.08.04");
  const [nextListDate,setNextListDate]=useState("2026-09-09T00:00:00+01:00"); const [announcement,setAnnouncement]=useState("");
  const [countdown,setCountdown]=useState({days:0,hours:0,minutes:0,seconds:0,done:false});
  const [notifications,setNotifications]=useState<NotificationPermission|"unsupported">("default"); const versionRef=useRef(""); const notificationRef=useRef("");
  const [sortMode,setSortMode]=useState<"movement"|"easy"|"seats">("movement");
  const [compareA,setCompareA]=useState("kenitra"); const [compareB,setCompareB]=useState("settat");
  const [compareRank,setCompareRank]=useState(570); const [compareChoice,setCompareChoice]=useState(1);
  const [error,setError]=useState(""); const school=liveSchools.find(s=>s.key===schoolKey)!;
  const schoolName=(s:School)=>fr?frenchSchools[s.key]:s.name;
  const guide=networkGuides[network];

  useEffect(()=>{
    let active=true;
    const refresh=()=>fetch(`/api/model?t=${Date.now()}`,{cache:"no-store"}).then(async r=>r.ok?r.json():Promise.reject()).catch(()=>fetch(`/model.json?t=${Date.now()}`,{cache:"no-store"}).then(r=>r.json())).then(model=>{
      if(!active)return;
      const notificationId=model.notification?.id||"";
      if(notificationId&&!notificationRef.current){notificationRef.current=notificationId}
      if(notificationId&&notificationRef.current&&notificationRef.current!==notificationId&&Notification.permission==="granted")navigator.serviceWorker?.ready.then(reg=>reg.active?.postMessage({type:"NOTIFY",title:"ORIENTATION LGOSS",body:model.notification?.body||model.announcement||(fr?"Une nouvelle mise à jour est disponible.":"كاين تحديث جديد فالموقع."),tag:`broadcast-${notificationId}`}));
      if(notificationId)notificationRef.current=notificationId;
      if(versionRef.current&&versionRef.current!==model.version&&Notification.permission==="granted"&&!notificationId)navigator.serviceWorker?.ready.then(reg=>reg.active?.postMessage({type:"NOTIFY",title:"ORIENTATION LGOSS",body:fr?"Les estimations viennent d’être actualisées.":"تحدّثات التوقعات دابا.",tag:`model-${model.version}`}));
      versionRef.current=model.version||"2026.08.04";setModelVersion(versionRef.current);setNextListDate(model.next_list_date||"2026-09-09T00:00:00+01:00");setAnnouncement(model.announcement||"");
      setLiveSchools(schools.map(s=>({...s,...(model.schools?.[s.key]||{})})));
    }).catch(()=>{});
    refresh(); const timer=setInterval(refresh,15000);
    return()=>{active=false;clearInterval(timer)};
  },[fr]);

  useEffect(()=>{
    if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});
    queueMicrotask(()=>setNotifications("Notification" in window?Notification.permission:"unsupported"));
  },[]);
  useEffect(()=>{
    let visitorId="";
    try{
      visitorId=localStorage.getItem("orientation-lgoss-visitor")||"";
      if(!visitorId){visitorId=createVisitorId();localStorage.setItem("orientation-lgoss-visitor",visitorId)}
    }catch{visitorId=createVisitorId()}
    const ping=()=>fetch("/api/visit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitor_id:visitorId}),keepalive:true}).catch(()=>{});
    ping();const timer=setInterval(ping,30000);return()=>clearInterval(timer);
  },[]);
  useEffect(()=>{const tick=()=>{const distance=new Date(nextListDate).getTime()-Date.now();const safe=Math.max(0,distance);setCountdown({days:Math.floor(safe/86400000),hours:Math.floor(safe/3600000)%24,minutes:Math.floor(safe/60000)%60,seconds:Math.floor(safe/1000)%60,done:distance<=0})};tick();const timer=setInterval(tick,1000);return()=>clearInterval(timer)},[nextListDate]);

  async function enableNotifications(){
    if(!("Notification" in window)){setNotifications("unsupported");return}
    const permission=await Notification.requestPermission();setNotifications(permission);
    if(permission==="granted")navigator.serviceWorker?.ready.then(reg=>reg.active?.postMessage({type:"NOTIFY",title:"ORIENTATION LGOSS",body:fr?"Les alertes sont activées. Vous serez informé des nouvelles mises à jour.":"تفعلات الإشعارات. غادي نعلموك بأي تحديث جديد.",tag:"welcome"}));
  }

  async function analyze(e:FormEvent){
    e.preventDefault(); setError(""); let all=data;
    if(!all){all=await fetch("/candidates.json").then(r=>r.json());setData(all)}
    let rank=Number(value),actualChoice=choice,code:string|undefined;
    if(mode==="global"){
      code=value.trim().toUpperCase(); const matches=[];
      for(const s of liveSchools){const found=all![s.key]?.[code];if(!found)continue;const [r,c]=found;const entries=Object.values(all![s.key]||{}).filter(([entryRank])=>entryRank<r);matches.push({rank:r,choice:c,school:s,real:Math.round(entries.reduce((sum,[,entryChoice])=>sum+(choiceWeights[entryChoice]||0),0)),raw:entries.length,first:entries.filter(([,entryChoice])=>entryChoice===1).length,code})}
      if(!matches.length){setError(t.notFound);setGlobalResults([]);return}setResult(null);setGlobalResults(matches.sort((a,b)=>chance(b.rank,b.school.mid,b.choice)-chance(a.rank,a.school.mid,a.choice)));setTimeout(()=>document.getElementById("global-result")?.scrollIntoView({behavior:"smooth",block:"start"}),50);return;
    }
    if(mode==="massar"){code=value.trim().toUpperCase();const found=all![schoolKey]?.[code];if(!found){setError(t.notFound);setResult(null);return}[rank,actualChoice]=found}
    if(!Number.isFinite(rank)||rank<1){setError(t.invalid);return}
    const entries=Object.values(all![schoolKey]||{}).filter(([r])=>r<rank);
    setGlobalResults([]);setResult({rank,choice:actualChoice,school,real:Math.round(entries.reduce((s,[,c])=>s+(choiceWeights[c]||0),0)),raw:entries.length,first:entries.filter(([,c])=>c===1).length,code});
    setTimeout(()=>document.getElementById("result")?.scrollIntoView({behavior:"smooth",block:"start"}),50);
  }
  const scores=useMemo(()=>result?{pessimistic:chance(result.rank,result.school.low,result.choice),central:chance(result.rank,result.school.mid,result.choice),optimistic:chance(result.rank,result.school.high,result.choice)}:null,[result]);
  const advice=scores?scores.central>=75?(fr?"Votre position est sérieuse et favorable. Gardez ce choix et suivez chaque itération sans manquer les délais d’inscription.":"وضعيتك مزيانة وجدّية. خليك محافظ على هاد الاختيار وتابع كل Iteration بلا ما تفوّت آجال التسجيل."):scores.central>=45?(fr?"Vous avez une chance réelle, mais elle dépend des désistements et des places vacantes. Gardez ce choix et préparez une alternative sûre.":"عندك فرصة حقيقية ولكن النتيجة مرتبطة بالانسحابات والمقاعد الشاغرة. احتافظ بالاختيار وحضّر بديل آمن."):(fr?"La chance reste limitée dans le scénario central. Gardez ce choix, mais sécurisez une alternative et suivez les listes jusqu’à la fin.":"الفرصة محدودة فالسيناريو العادي. ما تحيدش الاختيار، ولكن ضروري تعتمد على بديل وتراقب اللوائح حتى النهاية."):"";
  const confidence=scores?scores.central>=75?(fr?"Chance forte":"فرصة قوية"):scores.central>=45?(fr?"Chance réelle":"فرصة واقعية"):(fr?"À suivre":"خاص المتابعة"):"";
  const smartRecommendations=useMemo(()=>{
    const baseKey=result?.school.key||schoolKey;
    const eligible=new Set(eligibleEncgKeys(baseKey));
    return [...liveSchools].filter(s=>eligible.has(s.key)&&s.key!==baseKey).map(s=>({school:s,score:chance(result?.rank||compareRank,s.mid,result?.choice||compareChoice)})).sort((a,b)=>b.score-a.score).slice(0,3);
  },[liveSchools,result,schoolKey,compareRank,compareChoice]);
  const shareText=result&&scores?`ORIENTATION LGOSS\n${fr?"École":"المدرسة"}: ${schoolName(result.school)}\n${fr?"Rang":"الرتبة"}: ${result.rank}\nChoix: ${result.choice}\n${fr?"Scénario probable — prochaine liste":"السيناريو الأقرب — اللائحة الجاية"}: ${scores.central}%\nhttps://orientation-lgoss.vercel.app`:"";
  async function copyShare(kind:"copy"|"tiktok"|"whatsapp"){
    if(!shareText)return;
    const text=kind==="tiktok"?`${fr?"J’ai testé mon admission avec ORIENTATION LGOSS":"جربت نسبة القبول ديالي فـ ORIENTATION LGOSS"} 🎓\n${schoolName(result!.school)} • Rang ${result!.rank} • ${scores!.central}%\n#orientation_lgoss #encg #tawjih`:shareText;
    if(kind==="whatsapp"){window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank","noopener,noreferrer");return}
    await navigator.clipboard?.writeText(text).catch(()=>{});
  }

  return <main dir={fr?"ltr":"rtl"} className={`site-shell ${fr?"is-fr":"is-ar"} ${!entered?"is-locked":""} ${network!=="encg"?"network-academic":""}`}>
    {!entered&&<div className="language-overlay" dir={lang==="fr"?"ltr":"rtl"}>{!lang?<div className="language-card"><img src="/orientation-lgoss-logo.png" alt="Orientation LGOSS"/><span>BIENVENUE • مرحباً</span><h1>Choisissez votre langue</h1><p>اختار اللغة باش تبدا المحاكاة</p><div><button onClick={()=>setLang("ar")} dir="rtl"><b>العربية</b><small>استمر بالعربية</small><i>←</i></button><button onClick={()=>setLang("fr")} dir="ltr"><b>Français</b><small>Continuer en français</small><i>→</i></button></div></div>:<div className="language-card school-choice-card"><button className="onboarding-back" onClick={()=>setLang(null)} aria-label={fr?"Retour":"رجوع"}>{fr?"← Retour":"رجوع →"}</button><img src="/orientation-lgoss-logo.png" alt="Orientation LGOSS"/><span>{fr?"ÉTAPE 2 SUR 2":"المرحلة 2 من 2"}</span><h1>{fr?"Quelle école vous intéresse ?":"شنو هي المدرسة اللي كتهتم بها؟"}</h1><p>{fr?"Le site s’ouvrira directement avec les informations et le simulateur adaptés.":"الموقع غادي يتحل مباشرة بالمعلومات والمحاكي المناسب لاختيارك."}</p><div className="school-choice-grid">{networks.map(item=><button key={item.key} onClick={()=>{setNetwork(item.key);setEntered(true)}}><i>{item.icon}</i><b>{fr?item.fr:item.ar}</b><small>{fr?item.frHint:item.arHint}</small><em>{fr?"Ouvrir →":"فتح ←"}</em></button>)}</div></div>}</div>}
    <div className="site-content" aria-hidden={!entered}>
      <header className="nav"><Link className="brand brand-image" href="/"><img src="/orientation-lgoss-logo.png" alt="Orientation LGOSS"/></Link><nav><a href="#simulator">{t.navSim}</a><a href="#schools">{t.navSchools}</a><a href="#method">{t.navMethod}</a></nav><button className="language-switch" onClick={()=>setLang(fr?"ar":"fr")}>{fr?"العربية":"FR"}</button><div className="nav-note"><i/> {t.updated}</div></header>
      <section className="network-picker" aria-label={fr?"Choisir le réseau":"اختار المؤسسة"}>{networks.map(item=><button key={item.key} className={network===item.key?"active":""} onClick={()=>setNetwork(item.key)}><i>{item.icon}</i><b>{fr?item.fr:item.ar}</b><small>{item.key==="est"||item.key==="fst"?(fr?"Notes du bac":"نقط الباك"):(fr?"Rang & listes":"الرتبة واللوائح")}</small></button>)}</section>
      <section className="quick-guide" aria-label={fr?"Résumé de l’outil":"ملخص الأداة"}>
        <div className="guide-title"><span>{fr?"Vous avez choisi":"اختيارك"}</span><strong>{fr?guide.frTitle:guide.arTitle}</strong></div>
        <article><b>{fr?"À entrer":"شنو تدخل"}</b><p>{fr?guide.frInput:guide.arInput}</p></article>
        <article><b>{fr?"Résultat":"شنو يعطيك"}</b><p>{fr?guide.frOutput:guide.arOutput}</p></article>
        <article className="guide-tip"><b>{fr?"Conseil":"نصيحة"}</b><p>{fr?guide.frTip:guide.arTip}</p></article>
      </section>
      {(network==="est"||network==="fst")&&<AcademicSimulator network={network} lang={activeLang}/>}
      {network==="health"&&<RankSimulator network={network} lang={activeLang}/>}
      <section className="next-list-bar"><div className="next-list-copy"><span>{fr?"PROCHAINE LISTE":"اللائحة الجاية"}</span><strong>{fr?"9 septembre 2026":"9 شتنبر 2026"}</strong>{announcement&&<small>{announcement}</small>}</div><div className="countdown" aria-label={fr?"Compte à rebours":"العد التنازلي"}>{countdown.done?<b>{fr?"La date est arrivée":"وصل الموعد"}</b>:<>{[[countdown.days,fr?"Jours":"يوم"],[countdown.hours,fr?"Heures":"ساعة"],[countdown.minutes,fr?"Min":"دقيقة"],[countdown.seconds,fr?"Sec":"ثانية"]].map(([number,label])=><div key={String(label)}><b>{String(number).padStart(2,"0")}</b><small>{label}</small></div>)}</>}</div><button className={`notify-button ${notifications}`} onClick={enableNotifications}>{notifications==="granted"?(fr?"✓ Alertes activées":"✓ الإشعارات خدامة"):notifications==="denied"?(fr?"Alertes bloquées":"الإشعارات مرفوضة"):(fr?"Activer les alertes":"فعّل الإشعارات")}</button></section>
      <section className="hero"><div className="eyebrow">{t.eyebrow}</div><h1>{t.hero1}<br/><em>{t.hero2}</em></h1><p>{t.intro}</p><div className="trust"><span>4</span> {t.schoolsCount} <b>•</b> <span>+61 000</span> {t.lines} <b>•</b> {t.private}</div></section>
      <section id="simulator" className="simulator-card"><div className="card-heading"><div><small>{t.oneStep}</small><h2>{t.calculate}</h2></div><span className="step">01</span></div><div className="mode-tabs three"><button className={mode==="rank"?"active":""} onClick={()=>{setMode("rank");setValue("570")}}>{t.haveRank}</button><button className={mode==="massar"?"active":""} onClick={()=>{setMode("massar");setValue("")}}>{t.haveMassar}</button><button className={mode==="global"?"active":""} onClick={()=>{setMode("global");setValue("")}}>{fr?"Recherche globale":"بحث شامل"}</button></div><form className="form-grid" onSubmit={analyze}><label className="wide"><span>{mode==="rank"?t.rankLabel:mode==="global"?(fr?"Code Massar — recherche dans les 13 écoles":"Code Massar — البحث فـ13 مدرسة"):"Code Massar"}</span><input value={value} onChange={e=>setValue(e.target.value)} inputMode={mode==="rank"?"numeric":"text"} autoCapitalize="characters" placeholder={mode==="rank"?t.rankExample:t.codeExample}/></label>{mode!=="global"&&<label><span>{t.city}</span><select value={schoolKey} onChange={e=>setSchoolKey(e.target.value)}>{liveSchools.map(s=><option value={s.key} key={s.key}>{schoolName(s)}</option>)}</select></label>}{mode==="rank"?<label><span>{t.choiceOrder}</span><select value={choice} onChange={e=>setChoice(Number(e.target.value))}>{[1,2,3,4].map(n=><option value={n} key={n}>{t.choice} {n}</option>)}</select></label>:mode==="massar"?<div className="auto-note">{t.auto}</div>:<div className="global-note wide">◎ {fr?"Une seule recherche affiche toutes les villes où votre code apparaît.":"بحث واحد كيعرض جميع المدن اللي كيبان فيها الكود ديالك."}</div>}{error&&<div className="error wide">⚠ {error}</div>}<button className="submit wide">{mode==="global"?(fr?"Rechercher dans 13 ENCG":"قلب فـ13 ENCG"):t.analyze} <span>{fr?"→":"←"}</span></button></form><p className="privacy">🔒 {t.privacy}</p></section>
      {result&&scores&&<section id="result" className="results-wrap"><div className="result-top"><div><span className="mini">{t.result}</span><h2>{schoolName(result.school)} • {t.rank} <span className="ltr-inline">{result.rank}</span></h2><p><span className="ltr-inline">Choix {result.choice}{result.code?` • ${result.code}`:""}</span></p><span className="confidence-pill">{confidence}</span></div><div className="score-ring" style={{"--score":`${scores.central*3.6}deg`} as React.CSSProperties}><strong>{scores.central}%</strong><span>{fr?"Prochaine liste":"اللائحة الجاية"}</span></div></div><div className="chance-meter"><div className="meter-labels"><span>{fr?"Faible":"ضعيفة"}</span><span>{fr?"Moyenne":"متوسطة"}</span><span>{fr?"Bonne":"جيدة"}</span><span>{fr?"Forte":"قوية"}</span></div><div className="meter-track"><i style={{insetInlineStart:`calc(${scores.central}% - 8px)`}}/></div></div><div className="scenario-grid scenario-grid-two"><article className="main"><span>{t.probable}</span><strong>{scores.central}%</strong><small>{t.listNear} <span className="ltr-inline">{result.school.mid}</span></small></article><article><span>{t.optimistic}</span><strong>{scores.optimistic}%</strong><small>{t.listNear} <span className="ltr-inline">{result.school.high}</span></small></article></div><div className="insights"><article><span className="icon">◎</span><div><small>{t.real}</small><strong>{result.real}</strong><p>{t.realText.replace("{raw}",String(result.raw))}</p></div></article><article><span className="icon">1</span><div><small>{t.first}</small><strong>{result.first}</strong><p>{t.firstText}</p></div></article></div><div className="action-checklist"><article><b>{fr?"Que faire maintenant ?":"شنو ندير دابا؟"}</b><p>{scores.central>=70?(fr?"Gardez ce choix en priorité et activez les alertes avant la prochaine liste.":"خلي هاد الاختيار مهم وفعل الإشعارات قبل اللائحة الجاية."):scores.central>=45?(fr?"Gardez ce choix, mais préparez une option de sécurité au cas où.":"خلي هاد الاختيار، ولكن وجد بديل آمن احتياطياً."):fr?"Suivez la liste jusqu’au bout et sécurisez un autre plan réaliste.":"تابع اللائحة حتى للآخر ووجد خطة أخرى واقعية."}</p></article><article><b>{fr?"Alternatives autorisées ENCG":"البدائل المسموحة داخل ENCG"}</b><small className="eligibility-note">{fr?"Selon votre zone géographique officielle":"حسب الروافد الجغرافية الرسمية"}</small><div>{smartRecommendations.length?smartRecommendations.map(item=><span key={item.school.key}>{schoolName(item.school)} <em>{item.score}%</em></span>):<span>{fr?"Aucune autre ENCG dans cette zone":"ما كايناش ENCG أخرى فهاد الروافد"}</span>}</div></article></div><div className="share-panel"><span>{fr?"Partager le résultat":"شارك النتيجة"}</span><button onClick={()=>copyShare("whatsapp")}>WhatsApp</button><button onClick={()=>copyShare("copy")}>{fr?"Copier":"نسخ"}</button><button onClick={()=>copyShare("tiktok")}>TikTok caption</button></div><div className="advice"><span>{t.practical}</span><p>{advice}</p><small>{t.disclaimer}</small></div><button className="reset" onClick={()=>{setResult(null);document.getElementById("simulator")?.scrollIntoView({behavior:"smooth"})}}>{t.reset} ↻</button></section>}
      {globalResults.length>0&&<section id="global-result" className="global-results"><div className="section-head compact"><div><span>{fr?"RÉSULTAT DE LA RECHERCHE":"نتيجة البحث الشامل"}</span><h2>{fr?`${globalResults.length} école(s) trouvée(s)`: `لقينا الكود فـ${globalResults.length} مدرسة`}</h2></div><p>{fr?"Classées de la meilleure chance à la plus faible.":"مرتبين من أحسن فرصة للأضعف."}</p></div><div className="global-result-grid">{globalResults.map(item=>{const score=chance(item.rank,item.school.mid,item.choice);return <article key={item.school.key}><div><small>Choix {item.choice}</small><h3>{schoolName(item.school)}</h3><p>{t.rank} {item.rank} • {item.real} {fr?"concurrents réels":"منافس حقيقي"}</p></div><strong>{score}%</strong><span className={`status ${score>=70?"high":score>=40?"medium":"low"}`}>{score>=70?(fr?"Bonne chance":"فرصة جيدة"):score>=40?(fr?"À surveiller":"خاص المتابعة"):(fr?"Chance limitée":"فرصة محدودة")}</span></article>})}</div></section>}
      <section className="compare-section"><div className="section-head"><div><span>{fr?"COMPARAISON PERSONNALISÉE":"مقارنة شخصية"}</span><h2>{fr?"Comparez deux ENCG":"قارن بين جوج ENCG"}</h2></div><p>{fr?"Même rang et même ordre de choix, deux niveaux de concurrence différents.":"نفس الرتبة ونفس الاختيار، ولكن المنافسة كتختلف من مدينة لمدينة."}</p></div><div className="compare-panel"><div className="compare-inputs"><label><span>{fr?"Première école":"المدرسة الأولى"}</span><select value={compareA} onChange={e=>setCompareA(e.target.value)}>{liveSchools.map(s=><option key={s.key} value={s.key}>{schoolName(s)}</option>)}</select></label><label><span>{fr?"Deuxième école":"المدرسة الثانية"}</span><select value={compareB} onChange={e=>setCompareB(e.target.value)}>{liveSchools.map(s=><option key={s.key} value={s.key}>{schoolName(s)}</option>)}</select></label><label><span>{fr?"Votre rang":"الرتبة ديالك"}</span><input type="number" min="1" value={compareRank} onChange={e=>setCompareRank(Math.max(1,Number(e.target.value)))}/></label><label><span>{t.choiceOrder}</span><select value={compareChoice} onChange={e=>setCompareChoice(Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>{t.choice} {n}</option>)}</select></label></div><div className="compare-results">{[compareA,compareB].map(key=>{const s=liveSchools.find(item=>item.key===key)!;const score=chance(compareRank,s.mid,compareChoice);return <article key={key}><small>{schoolName(s)}</small><strong>{score}%</strong><div><i style={{width:`${score}%`}}/></div><p>{fr?`Rang central estimé : ${s.mid}`:`الرتبة المركزية المتوقعة: ${s.mid}`}</p></article>})}</div></div></section>
      <section id="schools" className="schools-section"><div className="section-head"><div><span>{t.overview}</span><h2>{t.howFar}</h2></div><p>{t.overviewText}</p></div><div className="sort-pills"><button className={sortMode==="movement"?"active":""} onClick={()=>setSortMode("movement")}>{fr?"Plus grand mouvement":"أكبر حركة"}</button><button className={sortMode==="easy"?"active":""} onClick={()=>setSortMode("easy")}>{fr?"Admission plus accessible":"أسهل قبول"}</button><button className={sortMode==="seats"?"active":""} onClick={()=>setSortMode("seats")}>{fr?"Plus de places":"أكثر مقاعد"}</button></div><div className="schools-grid">{[...liveSchools].sort((a,b)=>sortMode==="seats"?b.seats-a.seats:sortMode==="easy"?(b.mid/b.seats)-(a.mid/a.seats):b.mid-a.mid).map((s,i)=><article key={s.key}><span className="order">{String(i+1).padStart(2,"0")}</span><div><h3>{schoolName(s)}</h3><p>{s.seats} {t.seats}</p></div><div className="rank"><small>{t.estimate}</small><strong>{s.mid}</strong><span>{s.low} — {s.high}</span></div></article>)}</div></section>
      <section className="school-map-section"><div className="section-head compact"><div><span>{fr?"CARTE DES ÉCOLES":"خريطة المدارس"}</span><h2>{fr?"Choisissez vite votre réseau":"اختار الشبكة بسرعة"}</h2></div><p>{fr?"Une vue simple pour comprendre quelles écoles utilisent le rang et lesquelles utilisent les notes du bac.":"نظرة بسيطة باش تعرف شكون كيعتمد الرتبة وشكون كيعتمد نقط الباك."}</p></div><div className="school-map-grid">{networks.map(item=><button key={item.key} onClick={()=>{setNetwork(item.key);document.getElementById("simulator")?.scrollIntoView({behavior:"smooth"})}} className={network===item.key?"active":""}><i>{item.icon}</i><b>{fr?item.fr:item.ar}</b><small>{item.key==="est"||item.key==="fst"?(fr?"Bac + coefficient automatique":"نقطة الباك + معامل تلقائي"):(fr?"Rang + ville/filière":"الرتبة + المدينة/الشعبة")}</small></button>)}</div></section>
      <section className="network-info-section"><div className="section-head compact"><div><span>{fr?"FICHES RAPIDES":"بطاقات سريعة"}</span><h2>{fr?"Ce que chaque simulateur vous donne":"شنو كيقدم كل محاكي"}</h2></div></div><div className="network-info-grid">{networks.map(item=>{const g=networkGuides[item.key];return <article key={item.key}><span>{item.icon}</span><h3>{fr?item.fr:item.ar}</h3><p>{fr?g.frOutput:g.arOutput}</p><small>{fr?g.frTip:g.arTip}</small></article>})}</div></section>
      <section id="method" className="method"><div className="method-copy"><span>{t.trustTitle}</span><h2>{t.model1}<br/>{t.model2}</h2><p>{t.methodText}</p></div><div className="method-steps"><div><b>01</b><h3>{t.step1}</h3><p>{t.step1Text}</p></div><div><b>02</b><h3>{t.step2}</h3><p>{t.step2Text}</p></div><div><b>03</b><h3>{t.step3}</h3><p>{t.step3Text}</p></div></div></section>
      <section className="info-zone"><div className="update-card"><div className="update-icon">↻</div><div><span>{fr?"MISES À JOUR AUTOMATIQUES":"تحديثات أوتوماتيكية"}</span><h2>{fr?"Le modèle vérifie les nouvelles données toutes les 5 minutes":"النموذج كيراجع المعطيات الجديدة كل 5 دقايق"}</h2><p>{fr?"Dès qu’une nouvelle itération est ajoutée, les rangs et probabilités sont actualisés sans changer le fonctionnement du site.":"ملي كتزاد Iteration جديدة، الرتب والنسب كيتحدّثو بلا ما يتبدل استعمال الموقع."}</p></div><strong>v{modelVersion}<small>{fr?"Version active":"النسخة الحالية"}</small></strong></div><div className="faq"><div className="section-head compact"><div><span>FAQ</span><h2>{fr?"Questions fréquentes":"أسئلة كتعاود بزاف"}</h2></div></div>{(fr?[
        ["Le pourcentage garantit-il l’admission ?","Non. Il s’agit d’une estimation statistique fondée sur les listes disponibles, les choix et les mouvements historiques."],
        ["Quelle différence entre le rang et le Choix ?","Le rang indique votre position dans la liste d’une ville. Le Choix indique la priorité que vous avez donnée à cette ville."],
        ["Dois-je retirer une ville si la chance est faible ?","Non. Gardez vos choix tant qu’une meilleure option officielle ne vous est pas attribuée, et surveillez chaque délai."],
        ["Qu’est-ce qu’une amélioration de choix ?","C’est le passage automatique vers une école mieux classée dans vos préférences lorsqu’une place se libère."],
        ["Pourquoi certaines listes avancent-elles davantage ?","Le mouvement dépend des désistements, des places vacantes et du nombre de candidats qui préfèrent une autre ville."],
      ]:[
        ["واش النسبة ضمان للقبول؟","لا. هادي غير نتيجة إحصائية مبنية على اللوائح المتوفرة، الاختيارات والحركة التاريخية."],
        ["شنو الفرق بين rang وChoix؟","الـrang هو بلاصتك فلائحة المدينة، والـChoix هو الأولوية اللي عطيت لهاد المدينة."],
        ["واش نحيد المدينة إلا كانت الفرصة ضعيفة؟","لا. خليك محافظ على الاختيارات حتى تستافد رسمياً من اختيار أحسن، وراقب جميع الآجال."],
        ["شنو معنى amélioration de choix؟","هي أنك كتدوز أوتوماتيكياً لمدرسة حاطها أحسن فاختياراتك ملي كيتفرغ فيها مقعد."],
        ["علاش شي لوائح كيتحركو أكثر؟","الحركة مرتبطة بالانسحابات، المقاعد اللي كتفرغ، وعدد الناس اللي كيفضلو مدينة أخرى."],
      ]).map(([q,a],i)=><details key={i}><summary>{q}<i>+</i></summary><p>{a}</p></details>)}</div></section>
      <footer><Link className="brand brand-image" href="/"><img src="/orientation-lgoss-logo.png" alt="Orientation LGOSS"/></Link><p>{t.footer}</p><a href="#simulator">{t.try} ↑</a></footer>
    </div>
  </main>;
}




