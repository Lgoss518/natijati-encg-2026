"use client";

import { useEffect,useState } from "react";

type SchoolModel={low:number;mid:number;high:number;seats:number};
type Model={version:string;next_list_date?:string;announcement?:string;schools:Record<string,SchoolModel>};
const labels:Record<string,string>={kenitra:"القنيطرة",settat:"سطات",casablanca:"الدار البيضاء",tanger:"طنجة",agadir:"أكادير",fes:"فاس",marrakech:"مراكش",oujda:"وجدة",eljadida:"الجديدة",benimellal:"بني ملال",elhajeb:"الحاجب",alhoceima:"الحسيمة",dakhla:"الداخلة"};

export default function AdminDashboard({email}:{email:string}){
  const [model,setModel]=useState<Model|null>(null);const [state,setState]=useState("loading");
  useEffect(()=>{fetch("/api/model",{cache:"no-store"}).then(r=>r.json()).then(m=>{setModel(m);setState("ready")}).catch(()=>setState("error"))},[]);
  const updateSchool=(key:string,field:keyof SchoolModel,value:number)=>setModel(current=>current?{...current,schools:{...current.schools,[key]:{...current.schools[key],[field]:value}}}:current);
  async function save(){if(!model)return;setState("saving");const next={...model,version:new Date().toISOString().slice(0,16).replace(/[-T:]/g,".")};const response=await fetch("/api/model",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(next)});if(response.ok){setState("saved");setModel(next)}else{const body=await response.json().catch(()=>({error:"Erreur inconnue"}));setState(`error:${body.error||response.status}`)}}
  if(!model)return <main className="admin-loading">Chargement…</main>;
  return <main className="admin-shell" dir="rtl"><header><div><span>ORIENTATION LGOSS</span><h1>لوحة إدارة التوقعات</h1><p>{email}</p></div><a href="/">← الموقع العام</a></header><section className="admin-settings"><label><span>تاريخ اللائحة المقبلة</span><input type="datetime-local" value={(model.next_list_date||"").slice(0,16)} onChange={e=>setModel({...model,next_list_date:`${e.target.value}:00+01:00`})}/></label><label><span>إعلان مختصر للطلبة</span><input value={model.announcement||""} placeholder="مثال: خرجات Iteration جديدة" onChange={e=>setModel({...model,announcement:e.target.value})}/></label></section><section className="admin-table"><div className="admin-row head"><b>المدينة</b><b>متشائم</b><b>مركزي</b><b>متفائل</b><b>المقاعد</b></div>{Object.entries(model.schools).map(([key,s])=><div className="admin-row" key={key}><strong>{labels[key]||key}</strong>{(["low","mid","high","seats"] as const).map(field=><input key={field} type="number" value={s[field]} onChange={e=>updateSchool(key,field,Number(e.target.value))}/>)}</div>)}</section><footer><div><span className={`save-state ${state}`}>{state==="saved"?"✓ تحفظات التغييرات":state==="saving"?"جاري الحفظ…":state.startsWith("error:")?state.slice(6):"النسخة: "+model.version}</span><small>الموقع العام كيراجع التحديثات كل 5 دقايق.</small></div><button onClick={save} disabled={state==="saving"}>حفظ ونشر التحديث</button></footer></main>;
}
