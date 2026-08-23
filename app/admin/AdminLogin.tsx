"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AdminLogin() {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.get("password") }) });
    if (response.ok) location.reload(); else { setError("كلمة السر غير صحيحة"); setLoading(false); }
  }
  return <main className="admin-login" dir="rtl"><form onSubmit={submit}><span>ORIENTATION LGOSS</span><h1>لوحة الإدارة</h1><p>دخل كلمة السر الخاصة بصاحب الموقع.</p><input name="password" type="password" placeholder="كلمة السر" required/>{error&&<small>{error}</small>}<button disabled={loading}>{loading?"جاري الدخول…":"الدخول"}</button><Link href="/">الرجوع للموقع</Link></form></main>;
}
