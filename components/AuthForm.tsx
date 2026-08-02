"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { BarChart3, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (register) {
        const result = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
        await updateProfile(result.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      }
      router.replace(searchParams.get("next") || "/");
    } catch (err) {
      const code = err instanceof Error ? err.message : "Authentication failed";
      setError(code.includes("invalid-credential") ? "Email or password is incorrect." : code.replace("Firebase: ", ""));
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      <section className="hidden lg:flex bg-[#11182b] text-white p-14 flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-28 top-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="flex items-center gap-3 relative"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 font-black">HR</span><div><strong>Daily Trax</strong><p className="text-xs text-slate-400">Habat Al Rimal workspace</p></div></div>
        <div className="relative max-w-lg"><BarChart3 className="h-10 w-10 text-indigo-400 mb-6"/><h1 className="text-4xl font-black leading-tight">Every day balanced.<br/>Every transaction clear.</h1><p className="mt-5 text-slate-400 leading-7">Securely manage daily ledgers, browse date-wise history, reconcile balances and prepare reports from one workspace.</p></div>
        <p className="relative text-xs text-slate-500">Financial workspace • Cloud synchronized</p>
      </section>
      <section className="grid place-items-center p-6">
        <div className="w-full max-w-md">
          <p className="text-sm font-bold text-indigo-600">{register ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">{register ? "Start using Daily Trax" : "Sign in to your workspace"}</h2>
          <p className="mt-2 text-sm text-slate-500">{register ? "Set up a secure account in less than a minute." : "Enter your registered account details to continue."}</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {register && <label className="block text-sm font-semibold text-slate-700">Full name<div className="relative mt-2"><UserRound className="absolute left-3 top-3 h-5 w-5 text-slate-400"/><input required value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-indigo-500" placeholder="Your name"/></div></label>}
            <label className="block text-sm font-semibold text-slate-700">Email address<div className="relative mt-2"><Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400"/><input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-indigo-500" placeholder="name@company.com"/></div></label>
            <label className="block text-sm font-semibold text-slate-700">Password<div className="relative mt-2"><LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-slate-400"/><input required minLength={6} type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-11 outline-none focus:border-indigo-500" placeholder="Minimum 6 characters"/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-3 text-slate-400" aria-label="Toggle password visibility">{showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}</button></div></label>
            {error && <p role="alert" className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{busy ? "Please wait…" : register ? "Create account" : "Sign in"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">{register ? "Already registered?" : "New to Daily Trax?"} <Link className="font-bold text-indigo-600" href={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link></p>
        </div>
      </section>
    </main>
  );
}
