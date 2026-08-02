"use client";

import { FormEvent, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Globe2,
  ImageIcon,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/components/AuthProvider";
import {
  CompanyProfile,
  fetchCompanyProfile,
  getFirebaseAuth,
  saveCompanyProfile,
} from "@/lib/firebase";

const EMPTY_PROFILE: CompanyProfile = {
  companyName: "",
  address: "",
  details: "",
  contact: "",
  email: "",
  logoUrl: "",
  website: "",
  registrationNumber: "",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    const localKey = `dailytrax_company_${user.uid}`;

    async function loadProfile() {
      try {
        const remote = await fetchCompanyProfile(user!.uid);
        if (active && remote) setProfile({ ...EMPTY_PROFILE, ...remote });
        if (active && !remote) {
          const cached = localStorage.getItem(localKey);
          if (cached) setProfile({ ...EMPTY_PROFILE, ...JSON.parse(cached) });
        }
      } catch {
        const cached = localStorage.getItem(localKey);
        if (active && cached) {
          try { setProfile({ ...EMPTY_PROFILE, ...JSON.parse(cached) }); } catch { /* Ignore invalid cache. */ }
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => { active = false; };
  }, [user]);

  const update = (field: keyof CompanyProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    localStorage.setItem(`dailytrax_company_${user.uid}`, JSON.stringify(profile));
    try {
      await saveCompanyProfile(user.uid, profile);
      setMessage("Company information saved successfully.");
    } catch {
      setMessage("Saved on this device. Cloud sync is currently unavailable.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell eyebrow="Account & workspace" title="Settings" description="Manage your company identity and signed-in account.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={handleSave} className="surface-card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Building2 className="h-5 w-5" /></span>
              <div><h2 className="font-black text-slate-900">Company profile</h2><p className="text-sm text-slate-500">This information identifies your business and workspace.</p></div>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <Field label="Company name" required icon={<Building2 />}>
              <input required value={profile.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Your company name" className="settings-input" />
            </Field>
            <Field label="Registration / tax number" icon={<Building2 />}>
              <input value={profile.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} placeholder="Trade license, TRN or registration no." className="settings-input" />
            </Field>
            <Field label="Contact number" icon={<Phone />}>
              <input type="tel" value={profile.contact} onChange={(e) => update("contact", e.target.value)} placeholder="+971 50 000 0000" className="settings-input" />
            </Field>
            <Field label="Company email" icon={<Mail />}>
              <input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} placeholder="hello@company.com" className="settings-input" />
            </Field>
            <Field label="Website" icon={<Globe2 />}>
              <input type="url" value={profile.website} onChange={(e) => update("website", e.target.value)} placeholder="https://company.com" className="settings-input" />
            </Field>
            <Field label="Company logo URL" icon={<ImageIcon />}>
              <input type="url" value={profile.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} placeholder="https://company.com/logo.png" className="settings-input" />
            </Field>
            <Field label="Company address" icon={<MapPin />} wide>
              <textarea value={profile.address} onChange={(e) => update("address", e.target.value)} placeholder="Office, street, city and country" rows={3} className="settings-input resize-y" />
            </Field>
            <Field label="Company details" icon={<Building2 />} wide hint="Briefly describe your services or business.">
              <textarea value={profile.details} onChange={(e) => update("details", e.target.value)} placeholder="Services, business hours, or other useful information" rows={4} className="settings-input resize-y" />
            </Field>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="flex items-center gap-2 text-sm font-semibold text-emerald-700">{message && <><CheckCircle2 className="h-4 w-4" />{message}</>}</p>
            <button disabled={saving || loading} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60">
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "Saving..." : "Save company profile"}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Logo preview</p>
            <div className="mt-4 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
              {profile.logoUrl ? <div role="img" aria-label={`${profile.companyName || "Company"} logo preview`} className="h-full w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${profile.logoUrl})` }} /> : <div className="text-center text-slate-400"><ImageIcon className="mx-auto h-8 w-8" /><p className="mt-2 text-xs font-semibold">Add a logo URL to preview it</p></div>}
            </div>
            <p className="mt-4 truncate font-black text-slate-900">{profile.companyName || "Your company"}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{profile.details || "Your company details will appear here."}</p>
          </div>
          <div className="surface-card p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Signed-in account</p>
            <p className="mt-2 font-black text-slate-900">{user?.displayName || "Daily Trax user"}</p>
            <p className="break-all text-sm text-slate-500">{user?.email}</p>
            <button onClick={async () => { await signOut(getFirebaseAuth()); router.replace("/login"); }} className="mt-5 flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4" />Sign out</button>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Field({ label, icon, hint, wide, required, children }: { label: string; icon: React.ReactNode; hint?: string; wide?: boolean; required?: boolean; children: React.ReactNode }) {
  return <label className={wide ? "md:col-span-2" : ""}><span className="flex items-center gap-2 text-sm font-bold text-slate-700"><span className="text-slate-400 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>{label}{required && <span className="text-rose-500">*</span>}</span>{hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}<span className="mt-2 block">{children}</span></label>;
}
