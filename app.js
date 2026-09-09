const { useState, useEffect, useMemo, useRef, useId } = React;
const RC = window.Recharts || {};
const { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = RC;
const C = {
  bg: "#161311",
  surface: "#1e1a17",
  card: "#252019",
  border: "#3a322a",
  accent: "#e8622c",
  steel: "#7a8a94",
  white: "#f5f1ec",
  text: "#d8d0c6",
  muted: "#8f8578",
  green: "#5fb87a",
  red: "#e15c5c",
  yellow: "#d9a441",
  blue: "#5b8fc9",
  purple: "#a87fd0"
};
const TEMA_KOYU = { ...C };
const TEMA_ACIK = {
  bg: "#f3efe8",
  surface: "#ffffff",
  card: "#ffffff",
  border: "#ddd5c7",
  accent: "#e8622c",
  steel: "#5f6c76",
  white: "#221f1b",
  text: "#3f372f",
  muted: "#7a705f",
  green: "#2f9155",
  red: "#c94444",
  yellow: "#b6791b",
  blue: "#3d6fa8",
  purple: "#8457b8"
};
function temaCssUygula() {
  const kok = document.documentElement.style;
  kok.setProperty("--bg", C.bg);
  kok.setProperty("--surface", C.surface);
  kok.setProperty("--card", C.card);
  kok.setProperty("--border", C.border);
  kok.setProperty("--ember", C.accent);
  kok.setProperty("--ember-dim", C.accent + "22");
  kok.setProperty("--steel", C.steel);
  kok.setProperty("--white", C.white);
  kok.setProperty("--text", C.text);
  kok.setProperty("--muted", C.muted);
  kok.setProperty("--green", C.green);
  kok.setProperty("--red", C.red);
  kok.setProperty("--yellow", C.yellow);
  kok.setProperty("--blue", C.blue);
}
function temaUygula(mod) {
  const gercekMod = mod === "sistem" ? (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "koyu" : "acik") : mod;
  Object.assign(C, gercekMod === "acik" ? TEMA_ACIK : TEMA_KOYU);
  temaCssUygula();
}
function temaDegistir(mod) {
  saveSettings({ ...getSettings(), tema: mod });
  temaUygula(mod);
  window.location.reload();
}
if (typeof window !== "undefined" && window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if ((getSettings().tema || "koyu") === "sistem") window.location.reload();
  });
}
const HIZMET_TIP_SABIT = { egzoz_tamir: "\u{1F529} Egzoz Tamiri", chiptuning: "\u26A1 Chiptuning" };
const HIZMET_TIP_VARSAYILAN_DIGER = [
  { key: "egzoz_degisim", label: "\u{1F527} Egzoz De\u011Fi\u015Fimi" },
  { key: "egzoz_kaynak", label: "\u{1F525} Egzoz Kaynak/Onar\u0131m" },
  { key: "motor_bakim", label: "\u{1F6E0}\uFE0F Motor Bak\u0131m\u0131" },
  { key: "elektrik_ariza", label: "\u{1F50C} Elektrik Ar\u0131za" },
  { key: "akilli_makine_kurulum", label: "\u{1F916} Ak\u0131ll\u0131 Makine Kurulumu" },
  { key: "akilli_makine_bakim", label: "\u{1F916} Ak\u0131ll\u0131 Makine Bak\u0131m\u0131" },
  { key: "periyodik_bakim", label: "\u{1F9F0} Periyodik Bak\u0131m" },
  { key: "diger", label: "\u270F\uFE0F Di\u011Fer (\xF6zel)" }
];
const GIDER_KATEGORILERI_VARSAYILAN = ["Malzeme/Hammadde", "Kira", "Elektrik/Su", "Personel Maa\u015F\u0131", "Yak\u0131t", "Bak\u0131m-Onar\u0131m", "Vergi/SGK", "Di\u011Fer"];
let HIZMET_TIP_LABEL = { ...HIZMET_TIP_SABIT };
let HIZMET_TIP_DIGER_LISTESI = [];
function hizmetTurleriYenile() {
  const ayar = getSettings().hizmetTurleri;
  HIZMET_TIP_DIGER_LISTESI = Array.isArray(ayar) ? ayar : HIZMET_TIP_VARSAYILAN_DIGER;
  const yeni = { ...HIZMET_TIP_SABIT };
  HIZMET_TIP_DIGER_LISTESI.forEach((k) => { if (k && k.key) yeni[k.key] = k.label; });
  HIZMET_TIP_LABEL = yeni;
}
function giderKategorileriYenile() {
  const ayar = getSettings().giderKategorileri;
  GIDER_KATEGORILERI = Array.isArray(ayar) && ayar.length > 0 ? ayar : GIDER_KATEGORILERI_VARSAYILAN;
}
function asamaRenk(asama) {
  if (asama === "iptal") return C.muted;
  if (asama === "teslim_edildi") return C.green;
  if (asama === "onay_bekliyor" || asama === "parca_bekliyor") return C.yellow;
  if (asama === "alindi" || asama === "teshis") return C.blue;
  return C.accent;
}
function asamaEtiket(asama) {
  if (asama === "iptal") return "❌ İptal";
  if (asama === "teslim_edildi") return "✅ Teslim Edildi";
  return "\u{1F527} Serviste";
}
function asamaDurum(asama) {
  if (asama === "teslim_edildi") return "tamamlandi";
  if (asama === "iptal") return "iptal";
  if (asama === "alindi") return "bekliyor";
  return "devam";
}
function sonrakiIsEmriNo() {
  const mevcut = +(localStorage.getItem("fp_is_emri_sayac") || "0") + 1;
  localStorage.setItem("fp_is_emri_sayac", String(mevcut));
  return `IE-${String(mevcut).padStart(4, "0")}`;
}
const EL_ARABASI_TUR_LABEL = {
  kantarli_kasa: "Kantarl\u0131 Kasa Ta\u015F\u0131ma",
  kantarsiz_kasa: "Kantars\u0131z Kasa Ta\u015F\u0131ma",
  kantarli_bidon: "Kantarl\u0131 Bidon Ta\u015F\u0131ma",
  kantarsiz_bidon: "Kantars\u0131z Bidon Ta\u015F\u0131ma",
  bidon_devirme: "Bidon Devirme"
};
const FATURA_TUR_LABEL = { servis: "\u{1F527} Servis", el_arabasi: "\u{1F6D2} El Arabas\u0131", satis: "\u{1F4E4} Sat\u0131\u015f", alis: "\u{1F4E5} Al\u0131\u015f" };
const ECU_MARKALARI = ["Bosch", "Continental", "Siemens", "Delphi", "Denso", "Marelli", "Valeo", "Sagem", "Keihin", "Visteon", "Di\u011fer"];
const KESS_PROTOKOL_LISTESI = ["OBD", "Bench", "Boot/BDM", "Bench/Boot"];
const KESS_STAGE_LISTESI = ["Stage 1", "Stage 2", "Stage 3", "Stage 1+", "\u00d6zel (Custom)", "Orijinale D\u00f6n\u00fc\u015f (Stock)"];
const KESS_YARDIM_KATEGORILERI = ["Ba\u011flant\u0131 Sorunu", "Protokol Se\u00e7imi (OBD/Bench/Boot)", "Stage/Dosya Ayar\u0131", "Checksum Hatas\u0131", "Genel Kullan\u0131m", "Di\u011fer"];
const ODEME_YONTEMLERI = ["Nakit", "Kredi Kart\u0131", "Havale/EFT", "\u00c7ek/Senet", "Di\u011fer"];
const DURUM_LABEL = { bekliyor: "Bekliyor", devam: "Devam Ediyor", tamamlandi: "Tamamland\u0131", iptal: "\u0130ptal" };
const DURUM_RENK = { bekliyor: C.yellow, devam: C.blue, tamamlandi: C.green, iptal: C.red };
const ONCELIK_LABEL = { dusuk: "\u{1F7E2} D\xFC\u015f\xFCk", orta: "\u{1F7E1} Orta", yuksek: "\u{1F534} Y\xFCksek" };
const ONCELIK_RENK = { dusuk: C.green, orta: C.yellow, yuksek: C.red };
const SERVIS_ODEME_LABEL = { odendi: "\u00d6dendi", kismi: "K\u0131smi \u00d6dendi", odenmedi: "\u00d6denmedi" };
const SERVIS_ODEME_RENK = { odendi: C.green, kismi: C.yellow, odenmedi: C.red };
let GIDER_KATEGORILERI = [...GIDER_KATEGORILERI_VARSAYILAN];
const HESAP_TUR_LABEL = { kasa: "\u{1F4B5} Kasa", banka: "\u{1F3E6} Banka", kredi_karti: "\u{1F4B3} Kredi Kart\u0131", pos: "\u{1F5A5}\uFE0F POS" };
const ROL_LABEL = { patron: "\u{1F451} Patron / Y\xF6netici", usta: "\u{1F527} Usta / Teknisyen", kasiyer: "\u{1F4B0} Kasiyer / Muhasebe" };
const ROL_SAYFA_IZIN_VARSAYILAN = {
  patron: null,
  usta: ["dashboard", "servis", "takvim", "araclar", "yapilacaklar"],
  kasiyer: ["dashboard", "servis", "takvim", "araclar", "el_arabasi", "cariler", "muhasebe", "yapilacaklar", "cop_kutusu"]
};
let ROL_SAYFA_IZIN = { ...ROL_SAYFA_IZIN_VARSAYILAN };
function rolYetkileriYenile() {
  const ayar = getSettings().rolSayfaIzin;
  if (ayar && typeof ayar === "object") {
    ROL_SAYFA_IZIN = {
      patron: null,
      usta: Array.isArray(ayar.usta) ? ayar.usta : ROL_SAYFA_IZIN_VARSAYILAN.usta,
      kasiyer: Array.isArray(ayar.kasiyer) ? ayar.kasiyer : ROL_SAYFA_IZIN_VARSAYILAN.kasiyer
    };
  } else {
    ROL_SAYFA_IZIN = { ...ROL_SAYFA_IZIN_VARSAYILAN };
  }
}
const LS = {
  get: (k, d = []) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
    }
    bulutaGonder(k, v);
  }
};
function bulutHazirMi() {
  const s = getSettings();
  return !!(s.supabaseUrl && s.supabaseAnonKey);
}
function bulutTabloUrl() {
  const s = getSettings();
  return `${(s.supabaseUrl || "").replace(/\/$/, "")}/rest/v1/veri_kutusu`;
}
function bulutHeaders(ekstra) {
  const s = getSettings();
  return { apikey: s.supabaseAnonKey, Authorization: `Bearer ${s.supabaseAnonKey}`, "Content-Type": "application/json", ...ekstra };
}
async function bulutaYaz(anahtar, deger) {
  const r = await fetch(bulutTabloUrl(), {
    method: "POST",
    headers: bulutHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify([{ anahtar, deger, guncelleme_zamani: (/* @__PURE__ */ new Date()).toISOString() }])
  });
  if (!r.ok) throw new Error(`Bulut kutusuna yaz\u0131lamad\u0131 (${r.status}): ${(await r.text()).slice(0, 200)}`);
}
let _bulutGonderZamanlayici = {};
function bulutaGonder(anahtar, deger) {
  if (!bulutHazirMi()) return;
  clearTimeout(_bulutGonderZamanlayici[anahtar]);
  _bulutGonderZamanlayici[anahtar] = setTimeout(() => {
    const zamanDamgasi = Date.now();
    bulutaYaz(anahtar, deger).then(() => {
      localStorage.setItem("fp_son_senkron", (/* @__PURE__ */ new Date()).toISOString());
      localStorage.setItem("fp_son_yerel_degisim", String(zamanDamgasi));
      if (anahtar !== "_sonGuncelleme") bulutaYaz("_sonGuncelleme", zamanDamgasi).catch(() => {
      });
    }).catch(() => {
    });
  }, 600);
}
async function buluttanOku(anahtar) {
  const r = await fetch(`${bulutTabloUrl()}?anahtar=eq.${encodeURIComponent(anahtar)}&select=deger`, { headers: bulutHeaders() });
  if (!r.ok) throw new Error("Bulut kutusuna eri\u015Filemedi.");
  const veri = await r.json();
  if (!veri || veri.length === 0) return null;
  return veri[0].deger;
}
const bekle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const GOOGLE_TAKVIM_SCOPE = "https://www.googleapis.com/auth/calendar.events";
let _googleTakvimToken = null;
let _googleTakvimTokenBitis = 0;
let _googleTakvimTokenClient = null;
function googleTakvimHazirMi() {
  return !!(getSettings().googleClientId && getSettings().googleTakvimAktif);
}
function googleTakvimTokenAl() {
  return new Promise((resolve, reject) => {
    if (_googleTakvimToken && Date.now() < _googleTakvimTokenBitis) {
      resolve(_googleTakvimToken);
      return;
    }
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      reject(new Error("Google kimlik doğrulama kit\xFCphanesi y\xFCklenemedi."));
      return;
    }
    const clientId = getSettings().googleClientId;
    if (!clientId) {
      reject(new Error("\xD6nce Ayarlar'dan Google Client ID girin."));
      return;
    }
    try {
      if (!_googleTakvimTokenClient) {
        _googleTakvimTokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_TAKVIM_SCOPE,
          callback: () => {
          }
        });
      }
      _googleTakvimTokenClient.callback = (yanit) => {
        if (yanit.error) {
          reject(new Error(yanit.error));
          return;
        }
        _googleTakvimToken = yanit.access_token;
        _googleTakvimTokenBitis = Date.now() + (+yanit.expires_in || 3500) * 1e3;
        resolve(_googleTakvimToken);
      };
      _googleTakvimTokenClient.requestAccessToken({ prompt: "" });
    } catch (e) {
      reject(e);
    }
  });
}
async function googleTakvimIstek(yol, secenekler = {}) {
  const token = await googleTakvimTokenAl();
  const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events${yol}`, {
    ...secenekler,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...secenekler.headers || {} }
  });
  if (!r.ok && r.status !== 404) throw new Error(`Google Takvim isteği başarısız (${r.status})`);
  if (r.status === 204 || r.status === 404) return null;
  return r.json();
}
function servisTakvimEtkinligi(s, cariAdi, aracEtiket) {
  const tarih = s.tarih || today();
  const baslangicSaat = s.saat || "09:00";
  const [saat, dakika] = baslangicSaat.split(":").map(Number);
  const baslangic = /* @__PURE__ */ new Date(`${tarih}T${baslangicSaat}:00`);
  const bitis = new Date(baslangic.getTime() + 60 * 60 * 1e3);
  return {
    summary: `${s.isEmriNo || ""} — ${HIZMET_TIP_LABEL[s.hizmetTuru] || "Servis"}${cariAdi ? " — " + cariAdi : ""}`,
    description: `${aracEtiket ? "Ara\xE7: " + aracEtiket + "\\n" : ""}${s.aciklama || ""}`,
    start: { dateTime: baslangic.toISOString() },
    end: { dateTime: bitis.toISOString() }
  };
}
async function googleTakvimEtkinlikSenkronEt(s, cariAdi, aracEtiket) {
  if (!googleTakvimHazirMi() || !s.tarih) return null;
  try {
    const etkinlik = servisTakvimEtkinligi(s, cariAdi, aracEtiket);
    if (s.googleEtkinlikId) {
      const sonuc = await googleTakvimIstek(`/${s.googleEtkinlikId}`, { method: "PATCH", body: JSON.stringify(etkinlik) });
      return sonuc ? sonuc.id : s.googleEtkinlikId;
    }
    const sonuc = await googleTakvimIstek("", { method: "POST", body: JSON.stringify(etkinlik) });
    return sonuc ? sonuc.id : null;
  } catch {
    return s.googleEtkinlikId || null;
  }
}
async function googleTakvimEtkinlikSil(googleEtkinlikId) {
  if (!googleTakvimHazirMi() || !googleEtkinlikId) return;
  try {
    await googleTakvimIstek(`/${googleEtkinlikId}`, { method: "DELETE" });
  } catch {
  }
}
async function aiSor(promptMetni, denemeNo = 0) {
  const apiKey = getSettings().aiApiKey;
  if (!apiKey) throw new Error("\xD6nce Ayarlar \u2192 Yapay Zeka'dan bir API key girin.");
  const kontrolci = typeof AbortController !== "undefined" ? new AbortController() : null;
  const zamanAsimi = kontrolci ? setTimeout(() => kontrolci.abort(), 2e4) : null;
  let r;
  try {
    r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptMetni }] }]
        }),
        signal: kontrolci ? kontrolci.signal : void 0
      }
    );
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Zaman a\u015F\u0131m\u0131: Gemini'ye 20 saniyede yan\u0131t al\u0131namad\u0131. \u0130nternet ba\u011Flant\u0131n\u0131 kontrol edip tekrar dene.");
    throw new Error(`Ba\u011Flant\u0131 hatas\u0131: ${e.message}`);
  } finally {
    if (zamanAsimi) clearTimeout(zamanAsimi);
  }
  if (!r.ok) {
    if ((r.status === 503 || r.status === 429) && denemeNo < 2) {
      await bekle(1500 * (denemeNo + 1));
      return aiSor(promptMetni, denemeNo + 1);
    }
    const hata = await r.text();
    throw new Error(`AI iste\u011Fi ba\u015Far\u0131s\u0131z (${r.status}): ${hata.slice(0, 200)}`);
  }
  const veri = await r.json();
  return veri.candidates && veri.candidates[0] && veri.candidates[0].content && veri.candidates[0].content.parts && veri.candidates[0].content.parts[0] ? veri.candidates[0].content.parts[0].text : "";
}
async function aiSorGorsel(promptMetni, base64Veri, mimeType = "image/jpeg") {
  const apiKey = getSettings().aiApiKey;
  if (!apiKey) throw new Error("\xD6nce Ayarlar → Yapay Zeka'dan bir API key girin.");
  const kontrolci = typeof AbortController !== "undefined" ? new AbortController() : null;
  const zamanAsimi = kontrolci ? setTimeout(() => kontrolci.abort(), 25e3) : null;
  let r;
  try {
    r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptMetni }, { inline_data: { mime_type: mimeType, data: base64Veri } }] }]
        }),
        signal: kontrolci ? kontrolci.signal : void 0
      }
    );
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Zaman aşımı: Gemini'ye 25 saniyede yanıt alınamadı. İnternet bağlantını kontrol edip tekrar dene.");
    throw new Error(`Bağlantı hatası: ${e.message}`);
  } finally {
    if (zamanAsimi) clearTimeout(zamanAsimi);
  }
  if (!r.ok) {
    const hata = await r.text();
    throw new Error(`AI isteği başarısız (${r.status}): ${hata.slice(0, 200)}`);
  }
  const veri = await r.json();
  return veri.candidates && veri.candidates[0] && veri.candidates[0].content && veri.candidates[0].content.parts && veri.candidates[0].content.parts[0] ? veri.candidates[0].content.parts[0].text : "";
}
function aiJsonAyikla(metin) {
  const m = (metin || "").match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}
const ALL_DATA_KEYS =["cariler", "servisIsleri", "satislar", "faturalar", "giderler", "personel", "araclar", "hesaplar", "kasaHareketleri", "personelOdemeleri", "yapilacaklar", "copKutusu"];
const COP_KUTUSU_SAKLAMA_GUNU = 30;
const KOLEKSIYON_LABEL = { cariler: "Cari", servisIsleri: "İş Emri", satislar: "El Arabası Satışı", personel: "Personel", araclar: "Araç", yapilacaklar: "Görev", giderler: "Gider", faturalar: "Fatura" };
function coplendir(koleksiyon, kayit) {
  const cop = LS.get("copKutusu");
  LS.set("copKutusu", [...cop, { id: uid(), koleksiyon, kayit, silinmeTarihi: today() }]);
}
function copKutusuTemizle() {
  const cop = LS.get("copKutusu");
  const bugun = today();
  const kalan = cop.filter((c) => {
    const gecenGun = Math.floor((new Date(bugun) - new Date(c.silinmeTarihi)) / 864e5);
    return gecenGun < COP_KUTUSU_SAKLAMA_GUNU;
  });
  if (kalan.length !== cop.length) LS.set("copKutusu", kalan);
}
function copKutusundanGeriYukle(copId) {
  const cop = LS.get("copKutusu");
  const oge = cop.find((c) => c.id === copId);
  if (!oge) return;
  const mevcut = LS.get(oge.koleksiyon);
  LS.set(oge.koleksiyon, [...mevcut, oge.kayit]);
  LS.set("copKutusu", cop.filter((c) => c.id !== copId));
}
function copKutusundanKaliciSil(copId) {
  const cop = LS.get("copKutusu");
  LS.set("copKutusu", cop.filter((c) => c.id !== copId));
}
const sonKullanilanPersonelId = () => { try { return localStorage.getItem("fp_son_personelId") || ""; } catch { return ""; } };
const sonKullanilanHizmetTuru = () => { try { return localStorage.getItem("fp_son_hizmetTuru") || ""; } catch { return ""; } };
const sonKullanilanKaydet = (personelId, hizmetTuru) => {
  try {
    if (personelId) localStorage.setItem("fp_son_personelId", personelId);
    if (hizmetTuru) localStorage.setItem("fp_son_hizmetTuru", hizmetTuru);
  } catch {}
};
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
const nowTime = () => (/* @__PURE__ */ new Date()).toTimeString().slice(0, 5);
const birYilSonra = () => {
  const d = /* @__PURE__ */ new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};
function dosyaOku(dosya) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(dosya);
  });
}
function plakaNormalize(p) {
  return (p || "").toString().trim().toUpperCase().replace(/\s+/g, " ");
}
function plakaParcala(deger) {
  const norm = plakaNormalize(deger).replace(/\s+/g, "");
  const m = norm.match(/^(\d{2})([A-Z]{1,3})(\d{2,5})$/);
  return m ? { il: m[1], harf: m[2], rakam: m[3] } : { il: "", harf: "", rakam: "" };
}
function plakaBirlestir(il, harf, rakam) {
  return plakaNormalize(`${il || ""} ${harf || ""} ${rakam || ""}`);
}
function sesTanimaDesteklerMi() {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
function SesliGirisButonu({ deger, onDeger }) {
  const [dinliyor, setDinliyor] = useState(false);
  const taniyiciRef = useRef(null);
  if (!sesTanimaDesteklerMi()) return null;
  const baslatDurdur = () => {
    if (dinliyor) {
      taniyiciRef.current && taniyiciRef.current.stop();
      return;
    }
    const Taniyici = window.SpeechRecognition || window.webkitSpeechRecognition;
    const taniyici = new Taniyici();
    taniyici.lang = "tr-TR";
    taniyici.interimResults = false;
    taniyici.maxAlternatives = 1;
    taniyici.onresult = (e) => {
      const metin = e.results[0][0].transcript;
      onDeger(((deger || "").trim() ? deger.trim() + " " : "") + metin);
    };
    taniyici.onerror = () => setDinliyor(false);
    taniyici.onend = () => setDinliyor(false);
    taniyiciRef.current = taniyici;
    taniyici.start();
    setDinliyor(true);
  };
  return React.createElement("button", { type: "button", title: dinliyor ? "Dinlemeyi durdur" : "Konuşarak yaz", style: { ...S.btnO, padding: "6px 10px", background: dinliyor ? C.red + "22" : void 0, borderColor: dinliyor ? C.red : void 0, flexShrink: 0 }, onClick: baslatDurdur }, dinliyor ? "\u{1F534}" : "\u{1F3A4}");
}
function PlakaGirisi({ il, harf, rakam, onIl, onHarf, onRakam }) {
  const harfRef = useRef(null);
  const rakamRef = useRef(null);
  return /* @__PURE__ */ React.createElement(
    "div",
    { style: { display: "flex", gap: 8 } },
    /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, width: 56, textAlign: "center" }, placeholder: "34", maxLength: 2, value: il || "", onChange: (e) => {
      const deger = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
      onIl(deger);
      if (deger.length === 2 && harfRef.current) harfRef.current.focus();
    } }),
    /* @__PURE__ */ React.createElement("input", { ref: harfRef, style: { ...S.inp, flex: 1, textAlign: "center" }, placeholder: "ABC", maxLength: 3, value: harf || "", onChange: (e) => {
      const deger = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
      onHarf(deger);
      if (deger.length === 3 && rakamRef.current) rakamRef.current.focus();
    } }),
    /* @__PURE__ */ React.createElement("input", { ref: rakamRef, style: { ...S.inp, width: 100, textAlign: "center" }, placeholder: "12345", maxLength: 5, value: rakam || "", onChange: (e) => onRakam(e.target.value.replace(/[^0-9]/g, "").slice(0, 5)) })
  );
}
const ARAC_GRUP_LABEL = { otomobil: "\u{1F697} Otomobil / Ticari", motosiklet: "\u{1F3CD}\uFE0F Motosiklet", traktor: "\u{1F69C} Traktör" };
function MarkaModelSecici({ grup, marka, model, onGrup, onMarka, onModel }) {
  const markaListId = useId();
  const modelListId = useId();
  const g = grup || "otomobil";
  const markalar = g === "motosiklet" ? ARAC_MARKALARI_MOTOSIKLET : g === "traktor" ? ARAC_MARKALARI_TRAKTOR : ARAC_MARKALARI;
  const modelHaritasi = g === "motosiklet" ? ARAC_MODELLERI_MOTOSIKLET : g === "traktor" ? ARAC_MODELLERI_TRAKTOR : ARAC_MODELLERI;
  const modeller = modelHaritasi[marka] || [];
  return /* @__PURE__ */ React.createElement(
    React.Fragment,
    null,
    onGrup && /* @__PURE__ */ React.createElement(FG, { label: "Araç Grubu" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: g, onChange: (e) => onGrup(e.target.value) }, Object.entries(ARAC_GRUP_LABEL).map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l)))),
    /* @__PURE__ */ React.createElement(
      Grid2,
      null,
      /* @__PURE__ */ React.createElement(FG, { label: "Marka" }, /* @__PURE__ */ React.createElement("input", { list: markaListId, style: S.inp, value: marka || "", onChange: (e) => onMarka(e.target.value), placeholder: "\xD6rn: Renault" }), /* @__PURE__ */ React.createElement("datalist", { id: markaListId }, markalar.map((m) => /* @__PURE__ */ React.createElement("option", { key: m, value: m })))),
      /* @__PURE__ */ React.createElement(FG, { label: "Model" }, /* @__PURE__ */ React.createElement("input", { list: modelListId, style: S.inp, value: model || "", onChange: (e) => onModel(e.target.value), placeholder: "\xD6rn: Clio" }), /* @__PURE__ */ React.createElement("datalist", { id: modelListId }, modeller.map((m) => /* @__PURE__ */ React.createElement("option", { key: m, value: m }))))
    )
  );
}
const ARAC_MARKALARI = [
  "Alfa Romeo", "Anadol", "Aston Martin", "Audi", "Bentley", "BMC", "BMW", "Cadillac", "Chery", "Chevrolet",
  "Chrysler", "Citroën", "Cupra", "Dacia", "Daewoo", "DAF", "Daihatsu", "DFSK", "Dodge", "DS Automobiles",
  "Ferrari", "Fiat", "Ford", "Ford Trucks", "Honda", "Hyundai", "Ineos", "Infiniti", "Isuzu", "Iveco",
  "Jaguar", "Jeep", "Karsan", "Kia", "Lada", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lincoln",
  "Man", "Maserati", "Maxus", "Mazda", "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "Nissan", "Opel",
  "Otokar", "Peugeot", "Piaggio", "Porsche", "Proton", "Ram", "Renault", "Rolls-Royce", "Rover", "Saab",
  "Scania", "Seat", "Seres", "Skoda", "Smart", "Ssangyong", "Subaru", "Suzuki", "Tata", "Temsa",
  "Tesla", "Tofaş", "Toyota", "Volvo", "Volkswagen", "Diğer"
];
const ARAC_MODELLERI = {
  "Renault": ["Clio", "Megane", "Symbol", "Fluence", "Talisman", "Kadjar", "Captur", "Taliant", "Broadway", "Kangoo", "Master", "Trafic", "Twingo", "Scenic", "Laguna"],
  "Fiat": ["Egea", "Egea Cross", "Linea", "Punto", "Doblo", "Fiorino", "Tipo", "500", "500X", "Panda", "Ducato", "Albea", "Palio"],
  "Ford": ["Focus", "Fiesta", "Mondeo", "Kuga", "Puma", "Courier", "Connect", "Transit", "Transit Custom", "Ranger", "EcoSport", "Galaxy", "S-Max"],
  "Volkswagen": ["Passat", "Golf", "Polo", "Jetta", "Tiguan", "Caddy", "Transporter", "Crafter", "Bora", "Scirocco", "T-Roc", "T-Cross", "Arteon", "Amarok"],
  "Toyota": ["Corolla", "Yaris", "Auris", "C-HR", "RAV4", "Hilux", "Avensis", "Camry", "Land Cruiser", "Proace", "Corolla Cross"],
  "Hyundai": ["i20", "i10", "Accent", "Elantra", "Tucson", "Bayon", "Kona", "Santa Fe", "ix35", "i30", "Custin", "Staria"],
  "Peugeot": ["301", "308", "208", "3008", "2008", "508", "Partner", "Boxer", "5008", "Expert", "406", "407"],
  "Citroën": ["C-Elysee", "C3", "C4", "C4 Cactus", "C4 X", "Berlingo", "Jumpy", "Jumper", "C5", "C5 Aircross"],
  "Opel": ["Astra", "Corsa", "Insignia", "Mokka", "Combo", "Vectra", "Vivaro", "Grandland", "Crossland"],
  "Mercedes-Benz": ["A Serisi", "B Serisi", "C Serisi", "E Serisi", "S Serisi", "CLA", "GLA", "GLB", "GLC", "GLE", "Vito", "Sprinter", "Actros", "Axor", "Atego"],
  "BMW": ["1 Serisi", "2 Serisi", "3 Serisi", "4 Serisi", "5 Serisi", "7 Serisi", "X1", "X2", "X3", "X4", "X5", "X6"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8"],
  "Skoda": ["Octavia", "Fabia", "Superb", "Rapid", "Karoq", "Kodiaq", "Scala", "Kamiq"],
  "Dacia": ["Duster", "Sandero", "Logan", "Lodgy", "Dokker", "Jogger", "Spring"],
  "Nissan": ["Micra", "Qashqai", "Juke", "Note", "X-Trail", "Navara", "Primera", "NV200", "Almera"],
  "Honda": ["Civic", "City", "CR-V", "Jazz", "HR-V", "Accord", "e:Ny1"],
  "Kia": ["Rio", "Ceed", "Sportage", "Picanto", "Stonic", "Sorento", "Niro", "Sportage Plug-in", "Carnival"],
  "Chevrolet": ["Cruze", "Aveo", "Lacetti", "Captiva", "Spark", "Malibu", "Orlando"],
  "Seat": ["Ibiza", "Leon", "Toledo", "Ateca", "Arona", "Tarraco"],
  "Volvo": ["S60", "S40", "S80", "V40", "V60", "XC40", "XC60", "XC90", "FH", "FM", "FMX"],
  "Mazda": ["2", "3", "6", "CX-3", "CX-30", "CX-5", "CX-60"],
  "Mitsubishi": ["Lancer", "L200", "Outlander", "ASX", "Colt", "Space Star", "Eclipse Cross"],
  "Suzuki": ["Swift", "Vitara", "Baleno", "S-Cross", "Jimny", "Celerio"],
  "Isuzu": ["D-Max", "NPR", "NQR", "N-Serisi"],
  "Iveco": ["Daily", "Eurocargo", "Stralis", "S-Way", "Trakker"],
  "Man": ["TGX", "TGS", "TGL", "TGM", "TGE"],
  "Scania": ["R Serisi", "P Serisi", "G Serisi", "S Serisi"],
  "Ford Trucks": ["Cargo", "F-Max", "Transit", "Trakker"],
  "Karsan": ["Jest", "Atak", "Star", "Midi"],
  "Otokar": ["Sultan", "Territo", "Atlas", "Kent", "Vectio"],
  "Tofaş": ["Şahin", "Doğan", "Kartal", "Murat 131", "Serçe"],
  "Land Rover": ["Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar", "Defender", "Freelander"],
  "Jeep": ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Avenger"],
  "Mini": ["Cooper", "Cooper S", "Countryman", "Clubman", "Paceman"],
  "Lada": ["Niva", "Granta", "Vesta", "Kalina", "Priora"],
  "Cupra": ["Formentor", "Leon", "Ateca", "Born"],
  "DS Automobiles": ["DS3", "DS4", "DS7", "DS9"],
  "Alfa Romeo": ["Giulietta", "Giulia", "Stelvio", "Tonale", "MiTo", "146", "156", "159"],
  "Subaru": ["Impreza", "Forester", "XV", "Outback", "Legacy", "BRZ"],
  "Lexus": ["IS", "ES", "NX", "RX", "UX", "LS", "LX"],
  "Infiniti": ["Q30", "Q50", "QX70", "QX50", "FX"],
  "Jaguar": ["XE", "XF", "XJ", "F-Pace", "E-Pace", "I-Pace", "F-Type"],
  "Lancia": ["Ypsilon", "Delta", "Musa", "Thema"],
  "Chrysler": ["300C", "Voyager", "PT Cruiser", "Sebring"],
  "Cadillac": ["CTS", "Escalade", "XT4", "XT5"],
  "Rover": ["75", "45", "25", "Streetwise"],
  "Saab": ["9-3", "9-5", "900"],
  "Ssangyong": ["Korando", "Tivoli", "Rexton", "Musso", "Actyon"],
  "Tata": ["Xenon", "Indica", "Nano", "Tiago"],
  "Proton": ["Saga", "Persona", "X70"],
  "Rolls-Royce": ["Ghost", "Phantom", "Wraith", "Cullinan"],
  "Bentley": ["Continental GT", "Bentayga", "Flying Spur"],
  "Aston Martin": ["Vantage", "DB11", "DBX"],
  "Maserati": ["Ghibli", "Levante", "Quattroporte"],
  "Lamborghini": ["Huracán", "Urus", "Aventador"],
  "Ferrari": ["488", "Roma", "Portofino", "F8"],
  "Porsche": ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
  "Tesla": ["Model 3", "Model S", "Model X", "Model Y"],
  "Smart": ["Fortwo", "Forfour"],
  "MG": ["ZS", "HS", "5", "4"],
  "Chery": ["Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo 5"],
  "Seres": ["Seres 3", "Seres 5"],
  "Maxus": ["T60", "T90", "eDeliver3"],
  "DFSK": ["Glory 580", "K01", "K05"],
  "Ineos": ["Grenadier"],
  "Ram": ["1500", "2500", "3500"],
  "Dodge": ["Journey", "Caliber", "Charger"],
  "Lincoln": ["MKZ", "MKC", "Navigator"],
  "Daihatsu": ["Terios", "Sirion", "Charade"],
  "Daewoo": ["Matiz", "Nubira", "Lanos", "Espero"],
  "DAF": ["XF", "CF", "LF"],
  "BMC": ["Fatih", "Pro", "Neco"],
  "Temsa": ["Avenue", "Prestij", "Safir", "MD9"],
  "Anadol": ["A1", "A2", "SV-1636"]
};
const ARAC_MARKALARI_MOTOSIKLET = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "BMW Motorrad", "Ducati", "KTM", "Harley-Davidson",
  "Piaggio", "Vespa", "Aprilia", "Triumph", "Royal Enfield", "TVS", "Bajaj", "CFMoto",
  "Benelli", "Mondial", "Kanuni", "RKS", "Arora", "Moto Guzzi", "Husqvarna", "SYM", "Kymco", "Diğer"
];
const ARAC_MODELLERI_MOTOSIKLET = {
  "Honda": ["CBR 500R", "CBR 650R", "CB 125", "CB 500F", "PCX 125", "PCX 150", "Forza 125", "Africa Twin", "Transalp", "SH 150i"],
  "Yamaha": ["NMAX 125", "NMAX 155", "XMAX 250", "MT-03", "MT-07", "MT-09", "R25", "R3", "Tricity 125", "Tenere 700"],
  "Suzuki": ["GSX-R750", "GSX-S750", "V-Strom 650", "Address 110", "Burgman 125", "GSX-8S"],
  "Kawasaki": ["Ninja 400", "Ninja 650", "Z650", "Z900", "Versys 650", "Vulcan S"],
  "BMW Motorrad": ["R 1250 GS", "F 850 GS", "S 1000 RR", "G 310 R", "C 400 GT"],
  "Ducati": ["Monster", "Panigale V2", "Panigale V4", "Multistrada", "Scrambler"],
  "KTM": ["Duke 125", "Duke 200", "Duke 390", "Adventure 390", "RC 390"],
  "Harley-Davidson": ["Iron 883", "Street Bob", "Fat Boy", "Sportster S", "Road King"],
  "Piaggio": ["Liberty 125", "Beverly 300", "MP3 300"],
  "Vespa": ["Primavera 150", "GTS 300", "Sprint 150", "LX 125"],
  "Aprilia": ["RS 125", "RS 660", "Tuono 660", "SR 150"],
  "Triumph": ["Street Triple", "Tiger 900", "Bonneville T100", "Speed Twin"],
  "Royal Enfield": ["Classic 350", "Meteor 350", "Himalayan", "Interceptor 650"],
  "TVS": ["Apache RTR 160", "Apache RR 310", "Ntorq 125"],
  "Bajaj": ["Pulsar 150", "Pulsar NS200", "Dominar 400"],
  "CFMoto": ["300NK", "650NK", "450MT"],
  "Benelli": ["TRK 502", "Leoncino 500", "302S"],
  "Mondial": ["170 MK", "250 RR", "125 HPS"],
  "SYM": ["Jet 14 125", "Symphony 125"],
  "Kymco": ["Agility 125", "People S 125"]
};
const ARAC_MARKALARI_TRAKTOR = [
  "New Holland", "John Deere", "Massey Ferguson", "Case IH", "Fendt", "Same", "Landini",
  "Deutz-Fahr", "Kubota", "Türk Traktör", "Tümosan", "Erkunt", "Başak", "Claas", "Valtra",
  "McCormick", "Steyr", "Zetor", "Diğer"
];
const ARAC_MODELLERI_TRAKTOR = {
  "New Holland": ["TD5", "T5", "T6", "T7", "TT75", "TT4"],
  "John Deere": ["5075E", "5090E", "6110M", "6130M", "3038E"],
  "Massey Ferguson": ["MF 240", "MF 265", "MF 285", "MF 375", "MF 3070", "MF 6712"],
  "Case IH": ["Farmall 55", "Farmall 75", "Puma 165", "Maxxum 110"],
  "Fendt": ["Farmer 300", "Vario 700", "Vario 900"],
  "Same": ["Explorer 70", "Argon 3", "Frutteto"],
  "Landini": ["Landpower", "Vision", "Rex"],
  "Deutz-Fahr": ["Agroplus", "Agrotron", "5D Serisi"],
  "Kubota": ["M5001", "M7001", "L Serisi"],
  "Türk Traktör": ["New Holland TT75", "Case Farmall"],
  "Tümosan": ["8095", "9115", "6110"],
  "Erkunt": ["ARMOTRAC", "STAR"],
  "Başak": ["2035", "2095", "3110"],
  "Claas": ["Arion 420", "Axos 340"],
  "Valtra": ["A Serisi", "N Serisi", "T Serisi"],
  "McCormick": ["X4", "X5", "X6"]
};
function googleKullanici() {
  try {
    const v = sessionStorage.getItem("fp_google_kullanici");
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
async function htmlBelgeIndir(html, dosyaAdi) {
  if (!window.html2canvas || !window.jspdf) {
    alert("PDF kütüphaneleri yüklenemedi, internet bağlantınızı kontrol edip tekrar deneyin.");
    return;
  }
  const kapsayici = document.createElement("div");
  kapsayici.style.position = "fixed";
  kapsayici.style.left = "-99999px";
  kapsayici.style.top = "0";
  kapsayici.style.width = "700px";
  kapsayici.style.background = "#ffffff";
  kapsayici.innerHTML = html;
  document.body.appendChild(kapsayici);
  try {
    const canvas = await window.html2canvas(kapsayici, { scale: 2, backgroundColor: "#ffffff" });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const kenarBosluk = 10;
    const sayfaGenislik = pdf.internal.pageSize.getWidth() - kenarBosluk * 2;
    const sayfaYukseklik = pdf.internal.pageSize.getHeight() - kenarBosluk * 2;
    const oran = sayfaGenislik / canvas.width;
    const resimYukseklik = canvas.height * oran;
    const resimVerisi = canvas.toDataURL("image/png");
    let kalanYukseklik = resimYukseklik;
    let pozisyon = kenarBosluk;
    pdf.addImage(resimVerisi, "PNG", kenarBosluk, pozisyon, sayfaGenislik, resimYukseklik);
    kalanYukseklik -= sayfaYukseklik;
    while (kalanYukseklik > 0) {
      pozisyon = kenarBosluk - (resimYukseklik - kalanYukseklik);
      pdf.addPage();
      pdf.addImage(resimVerisi, "PNG", kenarBosluk, pozisyon, sayfaGenislik, resimYukseklik);
      kalanYukseklik -= sayfaYukseklik;
    }
    pdf.save(dosyaAdi);
  } catch (e) {
    alert("PDF oluşturulamadı: " + e.message);
  } finally {
    document.body.removeChild(kapsayici);
  }
}
const DOSYA_DB_ADI = "atolyeproDosyalar";
function dosyaDbAc() {
  return new Promise((resolve, reject) => {
    const istek = indexedDB.open(DOSYA_DB_ADI, 1);
    istek.onupgradeneeded = () => {
      if (!istek.result.objectStoreNames.contains("dosyalar")) istek.result.createObjectStore("dosyalar");
    };
    istek.onsuccess = () => resolve(istek.result);
    istek.onerror = () => reject(istek.error);
  });
}
async function dosyaKaydet(id, veri) {
  const db = await dosyaDbAc();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("dosyalar", "readwrite");
    tx.objectStore("dosyalar").put(veri, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function dosyaGetir(id) {
  const db = await dosyaDbAc();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("dosyalar", "readonly");
    const istek = tx.objectStore("dosyalar").get(id);
    istek.onsuccess = () => resolve(istek.result || null);
    istek.onerror = () => reject(istek.error);
  });
}
async function dosyaSil(id) {
  const db = await dosyaDbAc();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("dosyalar", "readwrite");
    tx.objectStore("dosyalar").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
const OTOMATIK_YEDEK_SAYISI = 7;
async function otomatikYedekAl() {
  const sonYedek = +(localStorage.getItem("fp_son_otomatik_yedek") || 0);
  const simdi = Date.now();
  if (simdi - sonYedek < 24 * 60 * 60 * 1e3) return;
  try {
    const veri = {};
    [...ALL_DATA_KEYS, "ayarlar"].forEach((k) => veri[k] = k === "ayarlar" ? getSettings() : LS.get(k));
    const slot = Math.floor(simdi / 864e5) % OTOMATIK_YEDEK_SAYISI;
    await dosyaKaydet(`otomatik_yedek_${slot}`, { tarih: today(), zaman: simdi, veri });
    localStorage.setItem("fp_son_otomatik_yedek", String(simdi));
  } catch {
  }
}
async function otomatikYedekleriGetir() {
  const sonuclar = [];
  for (let i = 0; i < OTOMATIK_YEDEK_SAYISI; i++) {
    try {
      const kayit = await dosyaGetir(`otomatik_yedek_${i}`);
      if (kayit) sonuclar.push({ slot: i, ...kayit });
    } catch {
    }
  }
  return sonuclar.sort((a, b) => b.zaman - a.zaman);
}
function otomatikYedekGeriYukle(yedek) {
  if (!confirm(`${fmtDate(yedek.tarih)} tarihli yedeğe geri d\xF6n\xFCl\xFCnce bu cihazdaki mevcut veriler \xFCzerine yazılacak. Devam edilsin mi?`)) return;
  Object.entries(yedek.veri).forEach(([k, v]) => k === "ayarlar" ? saveSettings(v) : LS.set(k, v));
  alert("Yedek geri y\xFCklendi. Sayfa yenilenecek.");
  window.location.reload();
}
function otomatikYedekIndir(yedek) {
  const blob = new Blob([JSON.stringify(yedek.veri, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `atolyepro-otomatik-yedek-${yedek.tarih}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function bildirimlerDesteklerMi() {
  return typeof Notification !== "undefined";
}
function bildirimIzniIste() {
  if (!bildirimlerDesteklerMi()) return Promise.resolve("desteklenmiyor");
  return Notification.requestPermission();
}
function bildirimGoster(baslik, govde) {
  if (!bildirimlerDesteklerMi() || Notification.permission !== "granted") return;
  const goster = () => {
    try {
      new Notification(baslik, { body: govde, icon: "icons/icon-192.png" });
    } catch {
    }
  };
  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready.then((reg) => reg.showNotification(baslik, { body: govde, icon: "icons/icon-192.png", badge: "icons/icon-192.png" })).catch(goster);
  } else {
    goster();
  }
}
function bildirimleriKontrolEt() {
  if (!bildirimlerDesteklerMi() || Notification.permission !== "granted") return;
  const bugun = today();
  const gonderildiKey = "fp_bildirim_gonderildi_" + bugun;
  if (localStorage.getItem(gonderildiKey)) return;
  const servisler = LS.get("servisIsleri");
  const yarin = (() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();
  const yarinRandevu = servisler.filter((s) => s.tarih === yarin && s.durum !== "iptal");
  if (yarinRandevu.length > 0) {
    bildirimGoster("\u{1F4C5} Yarının Randevuları", `${yarinRandevu.length} randevunuz var.`);
  }
  const tahsilatHatirlatmaGunu = Math.max(0, +getSettings().tahsilatHatirlatmaGunu || 0);
  const gecikmisTahsilat = servisler.filter((s) => {
    if (servisOdemeDurumu(s) === "odendi" || s.durum !== "tamamlandi" || !s.tarih) return false;
    const gecenGun = Math.floor((new Date(bugun) - new Date(s.tarih)) / 864e5);
    return gecenGun >= tahsilatHatirlatmaGunu;
  });
  if (gecikmisTahsilat.length > 0) {
    const kismiSayisi = gecikmisTahsilat.filter((s) => servisOdemeDurumu(s) === "kismi").length;
    bildirimGoster("⏰ Tahsilat Hatırlatması", `${gecikmisTahsilat.length} iş i\xE7in \xF6deme bekleniyor${kismiSayisi > 0 ? ` (${kismiSayisi} tanesi kısmi \xF6denmiş)` : ""}.`);
  }
  const yaklasanGaranti = servisler.filter((s) => s.garantili && s.garantiBitis && s.garantiBitis >= bugun).map((s) => ({ ...s, kalanGun: Math.ceil((new Date(s.garantiBitis) - new Date(bugun)) / 864e5) })).filter((s) => s.kalanGun <= 7);
  if (yaklasanGaranti.length > 0) {
    bildirimGoster("\u{1F6E1}️ Garanti Bitişi Yaklaşıyor", `${yaklasanGaranti.length} işin garantisi 7 g\xFCn i\xE7inde bitiyor.`);
  }
  const bugunGun = /* @__PURE__ */ new Date().getDate();
  resmiHatirlaticilarGetir().forEach((r) => {
    const kalanGun = r.gun - bugunGun;
    if (kalanGun === 3 || kalanGun === 0) {
      bildirimGoster("\u{1F4C4} Resmi Ödeme Hatırlatması", `${r.ad}${kalanGun === 0 ? " bug\xFCn" : ` ${kalanGun} g\xFCn sonra`} (her ayın ${r.gun}ı).`);
    }
  });
  const gorevler = LS.get("yapilacaklar");
  const acikGorevler = gorevler.filter((g) => !g.tamamlandi && g.bitisTarihi);
  const gecikenGorevler = acikGorevler.filter((g) => g.bitisTarihi < bugun);
  const bugunGorevler = acikGorevler.filter((g) => g.bitisTarihi === bugun);
  if (gecikenGorevler.length > 0) {
    bildirimGoster("⚠️ Gecikmiş Görevler", `${gecikenGorevler.length} görevin son tarihi ge\xE7ti.`);
  }
  if (bugunGorevler.length > 0) {
    bildirimGoster("✅ Bugün Bitecek Görevler", `${bugunGorevler.length} g\xF6revin son tarihi bug\xFCn.`);
  }
  localStorage.setItem(gonderildiKey, "1");
}
async function gununOzetiBildirimiGonder() {
  if (!bildirimlerDesteklerMi() || Notification.permission !== "granted") return;
  const ayar = getSettings();
  if (ayar.gununOzetiAktif === false) return;
  if (!ayar.aiApiKey) return;
  const su = /* @__PURE__ */ new Date();
  const secilenGunler = Array.isArray(ayar.gununOzetiGunler) && ayar.gununOzetiGunler.length > 0 ? ayar.gununOzetiGunler : null;
  if (secilenGunler && !secilenGunler.includes(su.getDay())) return;
  const [saatH, saatDk] = (ayar.gununOzetiSaati || "08:00").split(":").map((x) => +x || 0);
  const hedefDk = saatH * 60 + saatDk;
  const suAnDk = su.getHours() * 60 + su.getMinutes();
  if (suAnDk < hedefDk) return;
  const bugun = today();
  const gonderildiKey = "fp_bildirim_ozet_" + bugun;
  if (localStorage.getItem(gonderildiKey)) return;
  try {
    const prompt = `Sen "AS" isimli bir oto egzoz/chiptuning/el arabası \xFCretim atölyesi y\xF6netim asistanısın. Aşağıdaki g\xFCncel duruma bakarak atölye sahibine g\xFCn\xFCn \xF6ncelikli konularını \xF6zetleyen, en fazla 2 c\xFCmlelik kısa bir bildirim metni yaz (T\xFCrk\xE7e, bilgilendirici, abartısız).

${asBaglamOlustur()}`;
    const cevap = await aiSor(prompt);
    if (cevap && cevap.trim()) {
      bildirimGoster("☀️ Günün Özeti", cevap.trim());
      localStorage.setItem(gonderildiKey, "1");
    }
  } catch {
  }
}
async function dosyaMigrasyonuYap() {
  if (localStorage.getItem("fp_dosya_migrasyon_v1")) return;
  try {
    const araclar = LS.get("araclar");
    let degisti = false;
    for (const a of araclar) {
      for (const alan of ["fotograflar", "belgeler"]) {
        if (Array.isArray(a[alan])) {
          for (const item of a[alan]) {
            if (item.veri) {
              await dosyaKaydet(item.id, item.veri);
              delete item.veri;
              degisti = true;
            }
          }
        }
      }
    }
    if (degisti) LS.set("araclar", araclar);
  } catch {
  }
  localStorage.setItem("fp_dosya_migrasyon_v1", "1");
}
const fmtDate = (d) => {
  if (!d) return "\u2014";
  const [y, m, g] = d.split("-");
  return g ? `${g}.${m}.${y}` : d;
};
const fmtTL = (n) => `${(+n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} \u20BA`;
const DEFAULT_SETTINGS = {
  firmaAdi: "As Egzoz & Makine",
  firmaAdres: "",
  firmaTel: "",
  kdvOrani: 20,
  kdvOranlari: null,
  supabaseUrl: "",
  supabaseAnonKey: "",
  aiApiKey: "",
  googleClientId: "",
  googleTakvimAktif: false,
  tema: "koyu",
  hizmetTurleri: null,
  giderKategorileri: null,
  resmiHatirlaticilar: null,
  tahsilatHatirlatmaGunu: 3,
  mesajSablonlari: null,
  gununOzetiAktif: true,
  gununOzetiGunler: null,
  gununOzetiSaati: "08:00"
};
const RESMI_HATIRLATICI_VARSAYILAN = [
  { id: "kdv", ad: "KDV Beyannamesi", gun: 26 },
  { id: "muhtasar", ad: "Muhtasar Beyanname", gun: 26 },
  { id: "sgk", ad: "SGK Prim Ödemesi", gun: 30 }
];
function resmiHatirlaticilarGetir() {
  const ayar = getSettings().resmiHatirlaticilar;
  return Array.isArray(ayar) ? ayar : RESMI_HATIRLATICI_VARSAYILAN;
}
const KDV_ORANLARI_VARSAYILAN = [0, 10, 20];
function kdvOranlariGetir() {
  const ayar = getSettings().kdvOranlari;
  return Array.isArray(ayar) && ayar.length > 0 ? ayar : KDV_ORANLARI_VARSAYILAN;
}
const VARSAYILAN_MESAJ_SABLONLARI = {
  teslimBildir: "Merhaba {musteri}, {isEmriNo} numaralı işleminiz tamamlandı ve teslime hazır. Tutar: {tutar}.{kisisellestirme} — As Egzoz & Makine",
  anket: "Merhaba {musteri}, {isEmriNo} numaralı işleminizle ilgili görüşünüz bizim için çok değerli. Kısa bir değerlendirme yapabilir misiniz? {link} — As Egzoz & Makine",
  tahsilat: "Merhaba {musteri}, {isEmriNo} numaralı işleminize ait {tutar} tutarındaki {kismiEtiket}ödemeniz henüz alınmamış görünüyor. Müsait olduğunuzda tahsilatı tamamlayabilir misiniz? — As Egzoz & Makine",
  randevu: "Merhaba {musteri}, {tarih}{saatEtiket} tarihindeki {aracEtiket}randevunuzu hatırlatmak isteriz. — As Egzoz & Makine",
  durumBildirim: "Merhaba {musteri}, {isEmriNo} numaralı {arac} işleminizin durumu: {durum}.{tutarEtiket} — As Egzoz & Makine",
  gorev: "Merhaba {personel}, size yeni bir görev atandı:\n📋 {baslik}\n{aciklamaSatiri}{oncelikSatiri}{sonTarihSatiri}— As Egzoz & Makine"
};
const MESAJ_SABLONU_LABEL = {
  teslimBildir: "✅ İş Teslim Bildirimi",
  anket: "⭐ Memnuniyet Anketi",
  tahsilat: "💰 Tahsilat Hatırlatması",
  randevu: "📅 Randevu Hatırlatması",
  durumBildirim: "🔧 İş Durumu Bildirimi",
  gorev: "📋 Personel Görev Ataması"
};
const MESAJ_SABLONU_DEGISKENLERI = {
  teslimBildir: ["musteri", "isEmriNo", "tutar", "kisisellestirme"],
  anket: ["musteri", "isEmriNo", "link"],
  tahsilat: ["musteri", "isEmriNo", "tutar", "kismiEtiket"],
  randevu: ["musteri", "tarih", "saatEtiket", "aracEtiket"],
  durumBildirim: ["musteri", "isEmriNo", "arac", "durum", "tutarEtiket"],
  gorev: ["personel", "baslik", "aciklamaSatiri", "oncelikSatiri", "sonTarihSatiri"]
};
function mesajSablonlariGetir() {
  const ayar = getSettings().mesajSablonlari;
  return { ...VARSAYILAN_MESAJ_SABLONLARI, ...(ayar && typeof ayar === "object" ? ayar : {}) };
}
function sablonDoldur(sablon, degiskenler) {
  return (sablon || "").replace(/\{(\w+)\}/g, (m, k) => degiskenler[k] !== void 0 && degiskenler[k] !== null ? degiskenler[k] : "");
}
const getSettings = () => ({ ...DEFAULT_SETTINGS, ...LS.get("ayarlar", {}) });
const saveSettings = (s) => LS.set("ayarlar", s);
temaUygula(getSettings().tema || "koyu");
hizmetTurleriYenile();
giderKategorileriYenile();
rolYetkileriYenile();
function seedVeri() {
  if (localStorage.getItem("fp_seed_v1")) return;
  LS.set("cariler", [
    { id: "c1", ad: "Mehmet Y\u0131lmaz", tel: "0532 111 22 33", adres: "Akhisar, Manisa" },
    { id: "c2", ad: "Kaya Nakliyat Ltd.", tel: "0533 222 33 44", adres: "Salihli, Manisa" },
    { id: "c3", ad: "\xD6zt\xFCrk Tar\u0131m", tel: "0534 333 44 55", adres: "Turgutlu, Manisa" }
  ]);
  LS.set("servisIsleri", [
    { id: "s1", tarih: today(), musteriId: "c1", aracPlaka: "45 ABC 123", aracModel: "Ford Transit", hizmetTuru: "egzoz_degisim", aciklama: "Arka egzoz komple de\u011Fi\u015Fim", tutar: 3200, durum: "tamamlandi", odendi: true },
    { id: "s2", tarih: today(), musteriId: "c2", aracPlaka: "35 XYZ 456", aracModel: "Mercedes Actros", hizmetTuru: "chiptuning", aciklama: "Stage 1 chiptuning", tutar: 8500, durum: "devam", odendi: false }
  ]);
  LS.set("satislar", []);
  LS.set("giderler", []);
  LS.set("personel", [
    { id: "p1", ad: "Ayta\xE7 Sadeer", pozisyon: "Usta", telefon: "", maas: 0 },
    { id: "p2", ad: "Ayhan Sadeer", pozisyon: "Usta", telefon: "", maas: 0 },
    { id: "p3", ad: "Halil Abi", pozisyon: "Teknisyen", telefon: "", maas: 0 },
    { id: "p4", ad: "Personel 4 (ad\u0131n\u0131 Personel ekran\u0131ndan de\u011Fi\u015Ftirin)", pozisyon: "", telefon: "", maas: 0 }
  ]);
  LS.set("araclar", []);
  LS.set("hesaplar", [
    { id: "h1", ad: "Kasa (Nakit)", tur: "kasa", bakiye: 0 },
    { id: "h2", ad: "Banka Hesab\u0131", tur: "banka", bakiye: 0 }
  ]);
  LS.set("kasaHareketleri", []);
  LS.set("faturalar", []);
  localStorage.setItem("fp_seed_v1", "1");
}
const S = {
  app: { display: "flex", minHeight: "100vh" },
  get sidebar() { return { width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "18px 12px", flexShrink: 0 }; },
  main: { flex: 1, padding: "24px 28px", maxWidth: 1200, margin: "0 auto", width: "100%" },
  get card() { return { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16, overflowX: "auto", WebkitOverflowScrolling: "touch" }; },
  navBtn: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13.5, marginBottom: 2, color: active ? C.white : C.muted, background: active ? C.accent + "22" : "transparent", border: active ? `1px solid ${C.accent}55` : "1px solid transparent", fontWeight: active ? 600 : 400 }),
  btn: (bg = C.accent) => ({ background: bg, color: "#161311", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }),
  get btnO() { return { background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer" }; },
  get btnR() { return { background: "transparent", color: C.red, border: `1px solid ${C.red}55`, borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer" }; },
  get inp() { return { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.white, fontSize: 13.5 }; },
  get sel() { return { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.white, fontSize: 13.5 }; },
  get th() { return { textAlign: "left", padding: "9px 10px", fontSize: 11.5, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `1px solid ${C.border}` }; },
  get td() { return { padding: "11px 10px", fontSize: 13.5, borderBottom: `1px solid ${C.border}55`, color: C.text }; },
  tbl: { width: "100%", borderCollapse: "collapse" },
  get secTitle() { return { fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 14 }; },
  modal: { position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 700, padding: 16 },
  get mbox() { return { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, maxHeight: "88vh", overflowY: "auto", overflowX: "auto" }; },
  badge: (c) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: c + "22", color: c })
};
function FG({ label, children }) {
  return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: 12, color: C.muted, marginBottom: 6 } }, label), children);
}
function KatlanirKart({ title, children, varsayilanAcik, baslikRenk, kartStil }) {
  const [acik, setAcik] = useState(!!varsayilanAcik);
  return React.createElement(
    "div",
    { style: kartStil || S.card },
    React.createElement(
      "div",
      { style: { ...S.secTitle, ...(baslikRenk ? { color: baslikRenk } : {}), marginBottom: acik ? 14 : 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", userSelect: "none" }, onClick: () => setAcik((v) => !v) },
      React.createElement("span", null, title),
      React.createElement("span", { style: { fontSize: 13, color: C.muted, transform: acik ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0, marginLeft: 10 } }, "▼")
    ),
    acik && children
  );
}
function StatCard({ color, value, label, sub, icon }) {
  return /* @__PURE__ */ React.createElement("div", { style: { ...S.card, marginBottom: 0, borderTop: `3px solid ${color}` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: C.white } }, value), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginTop: 4 } }, label), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 } }, sub)), icon && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, opacity: 0.8 } }, icon)));
}
function Badge({ d, map = DURUM_LABEL, renk = DURUM_RENK }) {
  return /* @__PURE__ */ React.createElement("span", { style: S.badge(renk[d] || C.muted) }, map[d] || d);
}
function Modal({ title, onClose, width = 520, children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "fp-modal-overlay", style: S.modal, onClick: (e) => e.target === e.currentTarget && onClose() }, /* @__PURE__ */ React.createElement("div", { className: "fp-mbox", style: { ...S.mbox, width: `min(${width}px,94vw)` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 18 } }, title), children));
}
function Grid2({ children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "fp-grid2", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } }, children);
}
function Grid4({ children }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 } }, children);
}
function TabBar({ tabs, active, onChange }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" } }, tabs.map(
    ([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => onChange(k), style: { ...S.btn(active === k ? C.accent : "transparent"), color: active === k ? "#161311" : C.muted, border: `1px solid ${active === k ? C.accent : C.border}` } }, l)
  ));
}
function csvIndir(columns, rows, dosyaAdi) {
  const csvKolonlari = columns.filter((c) => c.sirala);
  const kacis = (deger) => {
    const s = deger == null ? "" : String(deger);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const satirlar = [
    csvKolonlari.map((c) => kacis(c.baslik)).join(";"),
    ...rows.map((row) => csvKolonlari.map((c) => kacis(c.sirala(row))).join(";"))
  ];
  const blob = new Blob(["﻿" + satirlar.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${dosyaAdi || "liste"}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function excelIndir(columns, rows, dosyaAdi) {
  if (!window.XLSX) {
    alert("Excel kütüphanesi yüklenemedi, internet bağlantınızı kontrol edip tekrar deneyin.");
    return;
  }
  const disaKolonlari = columns.filter((c) => c.sirala);
  const veri = rows.map((row) => {
    const satir = {};
    disaKolonlari.forEach((c) => satir[c.baslik] = c.sirala(row));
    return satir;
  });
  const sayfa = window.XLSX.utils.json_to_sheet(veri);
  const kitap = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(kitap, sayfa, "Liste");
  window.XLSX.writeFile(kitap, `${dosyaAdi || "liste"}.xlsx`);
}
function pdfIndir(columns, rows, dosyaAdi, baslik) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF kütüphanesi yüklenemedi, internet bağlantınızı kontrol edip tekrar deneyin.");
    return;
  }
  const disaKolonlari = columns.filter((c) => c.sirala);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: disaKolonlari.length > 5 ? "landscape" : "portrait", unit: "mm", format: "a4" });
  pdf.setFontSize(13);
  pdf.text(baslik || dosyaAdi || "Liste", 14, 12);
  pdf.autoTable({
    startY: 18,
    head: [disaKolonlari.map((c) => c.baslik)],
    body: rows.map((row) => disaKolonlari.map((c) => { const v = c.sirala(row); return v == null ? "" : String(v); })),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [232, 98, 44] }
  });
  pdf.save(`${dosyaAdi || "liste"}.pdf`);
}
async function dosyadanKayitlariOku(dosya, alanlar) {
  if (!window.XLSX) throw new Error("Excel/CSV kütüphanesi yüklenemedi, internet bağlantınızı kontrol edip tekrar deneyin.");
  const ab = await dosya.arrayBuffer();
  const kitap = window.XLSX.read(ab, { type: "array" });
  const sayfa = kitap.Sheets[kitap.SheetNames[0]];
  const satirlar = window.XLSX.utils.sheet_to_json(sayfa, { defval: "" });
  return satirlar.map((satir) => {
    const kayit = {};
    alanlar.forEach((a) => {
      const bulunanBaslik = Object.keys(satir).find((k) => k.trim().toLocaleLowerCase("tr-TR") === a.baslik.trim().toLocaleLowerCase("tr-TR"));
      const ham = bulunanBaslik ? satir[bulunanBaslik] : "";
      kayit[a.key] = a.donustur ? a.donustur(ham) : typeof ham === "string" ? ham.trim() : ham;
    });
    return kayit;
  }).filter((k) => alanlar.some((a) => !a.zorunlu || (k[a.key] !== "" && k[a.key] != null)));
}
function IceAktarButonu({ alanlar, onIceAktar, ornekAdi }) {
  const [devam, setDevam] = useState(false);
  const dosyaSec = async (e) => {
    const dosya = e.target.files[0];
    e.target.value = "";
    if (!dosya) return;
    setDevam(true);
    try {
      const kayitlar = await dosyadanKayitlariOku(dosya, alanlar);
      if (kayitlar.length === 0) {
        alert(`Dosyada okunabilir kayıt bulunamadı. İlk satır (başlıklar) şu isimleri i\xE7ermeli: ${alanlar.map((a) => a.baslik).join(", ")}`);
        return;
      }
      if (!confirm(`${kayitlar.length} kayıt bulundu. İ\xE7e aktarılsın mı?`)) return;
      onIceAktar(kayitlar);
    } catch (err) {
      alert("Dosya okunamadı: " + err.message);
    } finally {
      setDevam(false);
    }
  };
  return React.createElement("label", { title: `Beklenen s\xFCtunlar: ${alanlar.map((a) => a.baslik).join(", ")}`, style: { ...S.btnO, padding: "5px 10px", cursor: devam ? "default" : "pointer", opacity: devam ? 0.6 : 1 } }, devam ? "⏳ Okunuyor…" : "⬆️ İçe Aktar (CSV/Excel)", React.createElement("input", { type: "file", accept: ".csv,.xlsx,.xls", disabled: devam, style: { display: "none" }, onChange: dosyaSec }));
}
function SiraliTablo({ columns, rows, rowKey, bosMesaj = "Kayıt yok.", className, dosyaAdi, baslik, topluIslem }) {
  const [sayfa, setSayfa] = useState(1);
  const [sayfaBoyutu, setSayfaBoyutu] = useState(20);
  const [siralamaKey, setSiralamaKey] = useState(null);
  const [siralamaYon, setSiralamaYon] = useState("asc");
  const [secilenler, setSecilenler] = useState(() => /* @__PURE__ */ new Set());
  const [whatsappIndex, setWhatsappIndex] = useState(null);
  const basligaTikla = (col) => {
    if (!col.sirala) return;
    if (siralamaKey === col.key) {
      setSiralamaYon((y) => y === "asc" ? "desc" : "asc");
    } else {
      setSiralamaKey(col.key);
      setSiralamaYon("asc");
    }
  };
  const siraliSatirlar = useMemo(() => {
    if (!siralamaKey) return rows;
    const col = columns.find((c) => c.key === siralamaKey);
    if (!col || !col.sirala) return rows;
    const kopya = [...rows];
    kopya.sort((a, b) => {
      const va = col.sirala(a);
      const vb = col.sirala(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return va - vb;
      return String(va).localeCompare(String(vb), "tr-TR");
    });
    if (siralamaYon === "desc") kopya.reverse();
    return kopya;
  }, [rows, columns, siralamaKey, siralamaYon]);
  const toplamSayfa = Math.max(1, Math.ceil(siraliSatirlar.length / sayfaBoyutu));
  const gecerliSayfa = Math.min(sayfa, toplamSayfa);
  useEffect(() => {
    if (sayfa !== gecerliSayfa) setSayfa(gecerliSayfa);
  }, [gecerliSayfa]);
  const sayfalanmisSatirlar = siraliSatirlar.slice((gecerliSayfa - 1) * sayfaBoyutu, gecerliSayfa * sayfaBoyutu);
  const ilkKayit = rows.length === 0 ? 0 : (gecerliSayfa - 1) * sayfaBoyutu + 1;
  const sonKayit = Math.min(gecerliSayfa * sayfaBoyutu, siraliSatirlar.length);
  if (rows.length === 0) {
    return React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, bosMesaj);
  }
  const secilenSatirlar = topluIslem ? rows.filter((r) => secilenler.has(rowKey(r))) : [];
  const sayfaKeyleri = sayfalanmisSatirlar.map(rowKey);
  const sayfaHepsiSecili = sayfaKeyleri.length > 0 && sayfaKeyleri.every((k) => secilenler.has(k));
  const satirSecToggle = (key) => setSecilenler((prev) => {
    const yeni = new Set(prev);
    if (yeni.has(key)) yeni.delete(key); else yeni.add(key);
    return yeni;
  });
  const sayfaHepsiniSecToggle = () => setSecilenler((prev) => {
    const yeni = new Set(prev);
    if (sayfaHepsiSecili) sayfaKeyleri.forEach((k) => yeni.delete(k));
    else sayfaKeyleri.forEach((k) => yeni.add(k));
    return yeni;
  });
  const topluWhatsappBaslat = () => {
    if (secilenSatirlar.length === 0) return;
    setWhatsappIndex(0);
    const bilgi = topluIslem.whatsapp(secilenSatirlar[0]);
    if (bilgi) whatsappLinkAc(bilgi.telefon, bilgi.mesaj);
  };
  const topluWhatsappSonraki = () => {
    const sonraki = whatsappIndex + 1;
    if (sonraki >= secilenSatirlar.length) {
      setWhatsappIndex(null);
      return;
    }
    setWhatsappIndex(sonraki);
    const bilgi = topluIslem.whatsapp(secilenSatirlar[sonraki]);
    if (bilgi) whatsappLinkAc(bilgi.telefon, bilgi.mesaj);
  };
  const topluSilTikla = () => {
    if (secilenSatirlar.length === 0) return;
    topluIslem.onSil(secilenSatirlar);
    setSecilenler(/* @__PURE__ */ new Set());
    setWhatsappIndex(null);
  };
  return React.createElement(
    React.Fragment,
    null,
    topluIslem && secilenSatirlar.length > 0 && React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "8px 14px", background: C.accent + "18", borderRadius: 8, marginBottom: 10 } },
      React.createElement("span", { style: { fontSize: 12.5, color: C.text } }, secilenSatirlar.length, " kayıt seçili"),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } },
        whatsappIndex !== null && React.createElement("span", { style: { fontSize: 11.5, color: C.muted } }, "WhatsApp: ", whatsappIndex + 1, "/", secilenSatirlar.length),
        topluIslem.whatsapp && (whatsappIndex === null
          ? React.createElement("button", { type: "button", style: { ...S.btnO, padding: "5px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }, onClick: topluWhatsappBaslat }, React.createElement(WhatsAppIkon, null), "WhatsApp Gönder")
          : React.createElement("button", { type: "button", style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: topluWhatsappSonraki }, "Sonraki ▶")),
        topluIslem.onSil && React.createElement("button", { type: "button", style: S.btnR, onClick: topluSilTikla }, "🗑️ Seçilenleri Sil"),
        React.createElement("button", { type: "button", style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => { setSecilenler(/* @__PURE__ */ new Set()); setWhatsappIndex(null); } }, "Seçimi Temizle")
      )
    ),
    React.createElement(
      "table",
      { className, style: S.tbl },
      React.createElement("thead", null, React.createElement("tr", null,
        topluIslem && React.createElement("th", { style: { ...S.th, width: 30 } }, React.createElement("input", { type: "checkbox", checked: sayfaHepsiSecili, onChange: sayfaHepsiniSecToggle, style: { cursor: "pointer" } })),
        columns.map((col) => React.createElement(
          "th",
          { key: col.key, style: { ...S.th, cursor: col.sirala ? "pointer" : "default", userSelect: "none" }, onClick: () => basligaTikla(col) },
          col.baslik,
          col.sirala ? (siralamaKey === col.key ? (siralamaYon === "asc" ? " ▲" : " ▼") : " ⇅") : ""
        ))
      )),
      React.createElement("tbody", null, sayfalanmisSatirlar.map((row) => React.createElement("tr", { key: rowKey(row) },
        topluIslem && React.createElement("td", { style: S.td }, React.createElement("input", { type: "checkbox", checked: secilenler.has(rowKey(row)), onChange: () => satirSecToggle(rowKey(row)), style: { cursor: "pointer" } })),
        columns.map((col) => React.createElement("td", { key: col.key, style: S.td }, col.render(row)))
      )))
    ),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 12, fontSize: 12, color: C.muted } },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        "Sayfa başı:",
        React.createElement("select", { style: { ...S.sel, width: "auto", padding: "4px 8px" }, value: sayfaBoyutu, onChange: (e) => { setSayfaBoyutu(+e.target.value); setSayfa(1); } }, [20, 50, 100].map((n) => React.createElement("option", { key: n, value: n }, n))),
        React.createElement("button", { type: "button", style: { ...S.btnO, padding: "5px 10px" }, title: "CSV olarak indir", onClick: () => csvIndir(columns, siraliSatirlar, dosyaAdi) }, "⬇️ CSV"),
        React.createElement("button", { type: "button", style: { ...S.btnO, padding: "5px 10px" }, title: "Excel olarak indir", onClick: () => excelIndir(columns, siraliSatirlar, dosyaAdi) }, "⬇️ Excel"),
        React.createElement("button", { type: "button", style: { ...S.btnO, padding: "5px 10px" }, title: "PDF olarak indir", onClick: () => pdfIndir(columns, siraliSatirlar, dosyaAdi, baslik) }, "⬇️ PDF")
      ),
      React.createElement("div", null, `${ilkKayit}–${sonKayit} / ${siraliSatirlar.length} kayıt`),
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("button", { type: "button", style: { ...S.btnO, padding: "5px 10px", opacity: gecerliSayfa <= 1 ? 0.4 : 1 }, disabled: gecerliSayfa <= 1, onClick: () => setSayfa((s) => Math.max(1, s - 1)) }, "‹"),
        `Sayfa ${gecerliSayfa} / ${toplamSayfa}`,
        React.createElement("button", { type: "button", style: { ...S.btnO, padding: "5px 10px", opacity: gecerliSayfa >= toplamSayfa ? 0.4 : 1 }, disabled: gecerliSayfa >= toplamSayfa, onClick: () => setSayfa((s) => Math.min(toplamSayfa, s + 1)) }, "›")
      )
    )
  );
}
function cariAd(cariler, id) {
  return (cariler.find((c) => c.id === id) || {}).ad || "\u2014";
}
function aracSahibiAd(cariler, id) {
  return (cariler.find((c) => c.id === id) || {}).ad || "Bilinmiyor";
}
function cariRiskDurumu(musteriId, servisler) {
  const bugun = today();
  const isler = servisler.filter((s) => s.musteriId === musteriId && s.durum !== "iptal");
  if (isler.length === 0) return null;
  const gecikmis = isler.filter((s) => s.durum === "tamamlandi" && servisOdemeDurumu(s) !== "odendi" && s.tarih && Math.floor((new Date(bugun) - new Date(s.tarih)) / 864e5) >= 7);
  if (gecikmis.length > 0) return { etiket: "🔴 Riskli", renk: C.red, aciklama: `${gecikmis.length} işte gecikmiş \xF6deme` };
  if (isler.length >= 3) return { etiket: "🟢 G\xFCvenilir", renk: C.green, aciklama: `${isler.length} işin hepsi zamanında \xF6dendi` };
  return { etiket: "🟡 Yeni", renk: C.yellow, aciklama: "Yeterli ge\xE7miş yok" };
}
function aracSadakatDurumu(aracId, servisler) {
  const isler = servisler.filter((s) => s.aracId === aracId && s.durum !== "iptal");
  if (isler.length >= 5) return { etiket: "⭐ Sadık Araç", renk: C.accent, aciklama: `${isler.length} servis ziyareti` };
  if (isler.length >= 2) return { etiket: "🔁 Tekrar Gelen", renk: C.blue, aciklama: `${isler.length} servis ziyareti` };
  return null;
}
function benzerCarileriBul(cariler, ad, tel, haricId) {
  const adNorm = (ad || "").trim().toLocaleLowerCase("tr-TR");
  const telNorm = String(tel || "").replace(/[^0-9]/g, "");
  if (adNorm.length < 2 && telNorm.length < 6) return [];
  return cariler.filter((c) => {
    if (c.id === haricId) return false;
    const cAdNorm = (c.ad || "").trim().toLocaleLowerCase("tr-TR");
    if (!cAdNorm || cAdNorm === "bilinmiyor") return false;
    const cTelNorm = String(c.tel || "").replace(/[^0-9]/g, "");
    const adEslesiyor = adNorm.length >= 2 && cAdNorm.includes(adNorm);
    const telEslesiyor = telNorm.length >= 6 && cTelNorm.length >= 6 && cTelNorm === telNorm;
    return adEslesiyor || telEslesiyor;
  });
}
function BenzerCariUyarisi({ cariler, ad, tel, haricId }) {
  const benzerler = benzerCarileriBul(cariler, ad, tel, haricId);
  if (benzerler.length === 0) return null;
  return /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.yellow, marginTop: -8, marginBottom: 12, lineHeight: 1.6 } }, "⚠️ Benzer kayıt bulundu — aynı cariyi tekrar eklemediğinden emin ol: ", benzerler.map((c) => `${c.ad}${c.tel ? " (" + c.tel + ")" : ""}`).join(", "));
}
function urunAd(urunler, id) {
  return (urunler.find((u) => u.id === id) || {}).ad || "\u2014";
}
function urunBul(urunler, id) {
  return urunler.find((u) => u.id === id) || null;
}
function aracBilgi(araclar, id) {
  return araclar.find((a) => a.id === id) || null;
}
function servisOdenenTutar(s) {
  if (Array.isArray(s.odemeler) && s.odemeler.length > 0) return s.odemeler.reduce((t, o) => t + (+o.tutar || 0), 0);
  return s.odendi ? +s.tutar || 0 : 0;
}
function servisKalanTutar(s) {
  return Math.max(0, Math.round(((+s.tutar || 0) - servisOdenenTutar(s)) * 100) / 100);
}
function servisOdemeDurumu(s) {
  if (servisKalanTutar(s) <= 0) return "odendi";
  return servisOdenenTutar(s) > 0 ? "kismi" : "odenmedi";
}
function whatsappLinkOlustur(telefon, mesaj) {
  const temiz = String(telefon || "").replace(/[^0-9]/g, "");
  const numara = temiz.startsWith("0") ? "90" + temiz.slice(1) : temiz.startsWith("90") ? temiz : "90" + temiz;
  return `https://wa.me/${numara}?text=${encodeURIComponent(mesaj)}`;
}
function WhatsAppIkon({ boyut = 15 } = {}) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    { width: boyut, height: boyut, viewBox: "0 0 32 32", style: { display: "block" } },
    /* @__PURE__ */ React.createElement("path", { fill: "#25D366", d: "M16 2C8.28 2 2 8.28 2 16c0 2.62.72 5.08 1.98 7.18L2 30l7.02-1.94A13.9 13.9 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2z" }),
    /* @__PURE__ */ React.createElement("path", { fill: "#fff", d: "M23.4 19.5c-.35-.18-2.1-1.04-2.43-1.15-.33-.12-.57-.18-.8.18-.24.35-.92 1.15-1.13 1.39-.2.24-.42.26-.77.09-.35-.18-1.48-.55-2.82-1.75-1.04-.93-1.75-2.08-1.95-2.43-.2-.35-.02-.54.15-.72.16-.16.35-.42.53-.62.18-.2.24-.35.36-.59.12-.24.06-.44-.03-.62-.09-.18-.8-1.94-1.1-2.66-.29-.7-.58-.6-.8-.61-.2-.01-.44-.01-.68-.01-.24 0-.62.09-.95.44-.33.35-1.24 1.21-1.24 2.96 0 1.75 1.27 3.44 1.45 3.68.18.24 2.5 3.82 6.06 5.35.85.37 1.51.59 2.02.75.85.27 1.63.23 2.24.14.68-.1 2.1-.86 2.4-1.68.3-.83.3-1.54.21-1.68-.09-.15-.32-.24-.68-.42z" })
  );
}
function whatsappLinkAc(telefon, mesaj) {
  if (!telefon || !String(telefon).replace(/[^0-9]/g, "")) {
    alert("Bu m\xFC\u015Fterinin telefon numaras\u0131 kay\u0131tl\u0131 de\u011Fil.");
    return;
  }
  window.open(whatsappLinkOlustur(telefon, mesaj), "_blank");
}
function whatsappTeslimBildir(s, cariler, servisler) {
  const musteri = cariler.find((c) => c.id === s.musteriId);
  if (!musteri || !musteri.tel) return;
  if (!confirm(`İş "${s.isEmriNo || ""}" teslim edildi olarak işaretlendi. Müşteriye (${musteri.ad}) WhatsApp ile bilgi mesajı gönderilsin mi?`)) return;
  const tamamlananSayisi = servisler ? servisler.filter((x) => x.musteriId === s.musteriId && x.durum === "tamamlandi").length : 0;
  const kisisellestirme = tamamlananSayisi >= 5 ? " Bizi tercih ettiğiniz için teşekkür ederiz, değerli müşterimizsiniz! 🙏" : tamamlananSayisi <= 1 ? " Bizi tercih ettiğiniz için teşekkürler, umarız memnun kalmışsınızdır." : "";
  const mesaj = sablonDoldur(mesajSablonlariGetir().teslimBildir, { musteri: musteri.ad, isEmriNo: s.isEmriNo || "", tutar: fmtTL(s.tutar), kisisellestirme });
  whatsappLinkAc(musteri.tel, mesaj);
}
function anketLinkOlustur(isEmriNo) {
  const s = getSettings();
  if (!s.supabaseUrl || !s.supabaseAnonKey) return null;
  const taban = location.origin + location.pathname;
  const params = new URLSearchParams({ anket: isEmriNo, db: s.supabaseUrl, key: s.supabaseAnonKey });
  return `${taban}?${params.toString()}`;
}
function whatsappAnketGonder(s, cariler) {
  const musteri = cariler.find((c) => c.id === s.musteriId);
  const link = anketLinkOlustur(s.isEmriNo);
  if (!link) {
    alert("Anket g\xF6nderebilmek i\xE7in \xF6nce Ayarlar → Bağlantılar'dan Bulut Senkronizasyonu (Supabase) kurulmalı.");
    return;
  }
  const mesaj = sablonDoldur(mesajSablonlariGetir().anket, { musteri: musteri ? musteri.ad : "", isEmriNo: s.isEmriNo || "", link });
  whatsappLinkAc(musteri ? musteri.tel : "", mesaj);
}
async function anketKaydet(supabaseUrl, anonKey, isEmriNo, puan, yorum) {
  const tabloUrl = `${(supabaseUrl || "").replace(/\/$/, "")}/rest/v1/veri_kutusu`;
  const r = await fetch(tabloUrl, {
    method: "POST",
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([{ anahtar: `anket_${isEmriNo}_${Date.now()}`, deger: { isEmriNo, puan, yorum: yorum || "", tarih: today() }, guncelleme_zamani: (/* @__PURE__ */ new Date()).toISOString() }])
  });
  if (!r.ok) throw new Error(`Gönderilemedi (${r.status})`);
}
async function anketleriGetir() {
  if (!bulutHazirMi()) return [];
  const r = await fetch(`${bulutTabloUrl()}?anahtar=like.anket_*&select=anahtar,deger&order=guncelleme_zamani.desc`, { headers: bulutHeaders() });
  if (!r.ok) return [];
  const veri = await r.json();
  return veri.map((v) => v.deger);
}
function whatsappTahsilatHatirlat(s, cariler) {
  const musteri = cariler.find((c) => c.id === s.musteriId);
  const kalan = servisKalanTutar(s);
  const durum = servisOdemeDurumu(s);
  const mesaj = sablonDoldur(mesajSablonlariGetir().tahsilat, { musteri: musteri ? musteri.ad : "", isEmriNo: s.isEmriNo || "", tutar: fmtTL(kalan), kismiEtiket: durum === "kismi" ? "kalan " : "" });
  whatsappLinkAc(musteri ? musteri.tel : "", mesaj);
}
function whatsappRandevuHatirlat(s, cariler, aracEtiket) {
  const musteri = cariler.find((c) => c.id === s.musteriId);
  const mesaj = sablonDoldur(mesajSablonlariGetir().randevu, { musteri: musteri ? musteri.ad : "", tarih: fmtDate(s.tarih), saatEtiket: s.saat ? " saat " + s.saat : "", aracEtiket: aracEtiket ? aracEtiket + " ile ilgili " : "" });
  whatsappLinkAc(musteri ? musteri.tel : "", mesaj);
}
function whatsappGorevGonder(gorev, personel) {
  if (!personel || !personel.telefon) {
    alert("Bu personelin telefon numarası kayıtlı değil.");
    return;
  }
  const oncelikMetni = ONCELIK_LABEL[gorev.oncelik] || "";
  const mesaj = sablonDoldur(mesajSablonlariGetir().gorev, {
    personel: personel.ad,
    baslik: gorev.baslik,
    aciklamaSatiri: gorev.aciklama ? gorev.aciklama + "\n" : "",
    oncelikSatiri: oncelikMetni ? `Öncelik: ${oncelikMetni}\n` : "",
    sonTarihSatiri: gorev.bitisTarihi ? `Son Tarih: ${fmtDate(gorev.bitisTarihi)}\n` : ""
  });
  whatsappLinkAc(personel.telefon, mesaj);
}
function hesapHareketiKaydet(hesapId, yon, tutar, tarih, aciklama, kaynak, yontem) {
  if (!hesapId || !(+tutar > 0)) return;
  const hesaplar = LS.get("hesaplar");
  const hareketler = LS.get("kasaHareketleri");
  const yeniHareket = { id: uid(), hesapId, tur: yon, tutar: +tutar, tarih: tarih || today(), aciklama: aciklama || "", kaynak: kaynak || "otomatik", yontem: yontem || "" };
  LS.set("kasaHareketleri", [...hareketler, yeniHareket]);
  const yeniHesaplar = hesaplar.map((h) => h.id === hesapId ? { ...h, bakiye: (+h.bakiye || 0) + (yon === "giris" ? +tutar : -tutar) } : h);
  LS.set("hesaplar", yeniHesaplar);
}
function fisYazdir(baslik, satirlar, toplam, musteriAdi, kdvOrani) {
  const settings = getSettings();
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>${baslik}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:40px;color:#111;max-width:640px;margin:0 auto;}
    .head{display:flex;justify-content:space-between;border-bottom:3px solid #e8622c;padding-bottom:16px;margin-bottom:16px;}
    .firma{font-size:20px;font-weight:800;}
    .muted{color:#666;font-size:13px;}
    table{width:100%;border-collapse:collapse;margin-top:10px;}
    th{text-align:left;padding:8px;border-bottom:2px solid #333;font-size:12px;}
    td{padding:8px;border-bottom:1px solid #eee;font-size:13px;}
    .toplam{text-align:right;font-size:18px;font-weight:800;margin-top:16px;}
  </style></head><body>
  <div class="head"><div><div class="firma">${settings.firmaAdi || "At\xF6lye"}</div><div class="muted">${settings.firmaAdres || ""} ${settings.firmaTel ? " \xB7 " + settings.firmaTel : ""}</div></div>
  <div class="muted">${fmtDate(today())}</div></div>
  <h2 style="font-size:18px;">${baslik}</h2>
  ${musteriAdi ? `<div style="margin-bottom:10px;font-size:14px;"><strong>M\xFC\u015Fteri:</strong> ${musteriAdi}</div>` : ""}
  <table><thead><tr><th>A\xE7\u0131klama</th><th style="text-align:right;">Tutar</th></tr></thead>
  <tbody>${satirlar.map((s) => `<tr><td>${s.aciklama}</td><td style="text-align:right;">${fmtTL(s.tutar)}</td></tr>`).join("")}</tbody></table>
  ${(+kdvOrani || 0) > 0 ? `<div style="text-align:right;font-size:13px;color:#666;">KDV (%${kdvOrani}) dahil: ${fmtTL(Math.round((+toplam || 0) * (+kdvOrani || 0) / (100 + (+kdvOrani || 0)) * 100) / 100)}</div>` : ""}
  <div class="toplam">Toplam: ${fmtTL(toplam)}</div>
  </body></html>`;
  htmlBelgeIndir(html, `${baslik.replace(/[^\wÀ-ſ ]+/g, "").trim() || "fis"}.pdf`);
}
function isEmriYazdir(s, musteriAdi, aracEtiket) {
  const settings = getSettings();
  const kalemler = s.kalemler && s.kalemler.length > 0 ? s.kalemler : [{ ad: HIZMET_TIP_LABEL[s.hizmetTuru] || s.aciklama || "Hizmet", adet: 1, birimFiyat: s.tutar, tutar: s.tutar }];
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>${s.isEmriNo || "\u0130\u015F Emri"}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:40px;color:#111;max-width:680px;margin:0 auto;}
    .head{display:flex;justify-content:space-between;border-bottom:3px solid #e8622c;padding-bottom:16px;margin-bottom:16px;}
    .firma{font-size:20px;font-weight:800;}
    .muted{color:#666;font-size:13px;}
    .etiket{display:inline-block;padding:4px 10px;border-radius:6px;background:#eee;font-size:12px;font-weight:700;margin-bottom:14px;}
    table{width:100%;border-collapse:collapse;margin-top:10px;}
    th{text-align:left;padding:8px;border-bottom:2px solid #333;font-size:12px;}
    td{padding:8px;border-bottom:1px solid #eee;font-size:13px;}
    .toplam{text-align:right;font-size:18px;font-weight:800;margin-top:16px;}
    .satir{margin-bottom:6px;font-size:13px;}
  </style></head><body>
  <div class="head"><div><div class="firma">${settings.firmaAdi || "At\xF6lye"}</div><div class="muted">${settings.firmaAdres || ""} ${settings.firmaTel ? " \xB7 " + settings.firmaTel : ""}</div></div>
  <div class="muted">${fmtDate(s.tarih)}${s.saat ? " \xB7 " + s.saat : ""}</div></div>
  <div class="etiket">${s.isEmriNo || ""}</div>
  <h2 style="font-size:18px;margin:0 0 10px;">${HIZMET_TIP_LABEL[s.hizmetTuru] || "Servis \u0130\u015Fi"}</h2>
  <div class="satir"><strong>M\xFC\u015Fteri:</strong> ${musteriAdi || ""}</div>
  <div class="satir"><strong>Ara\xE7/\xDCr\xFCn:</strong> ${aracEtiket || ""}</div>
  ${s.aciklama ? `<div class="satir"><strong>A\xE7\u0131klama:</strong> ${s.aciklama}</div>` : ""}
  ${s.hizmetTuru === "chiptuning" && (s.kessEcuMarka || s.kessProtokol || s.kessStage) ? `<div class="satir"><strong>KESS V3:</strong> ${[s.kessEcuMarka && `ECU: ${s.kessEcuMarka}`, s.kessProtokol && `Protokol: ${s.kessProtokol}`, s.kessStage && `Stage: ${s.kessStage}`, s.kessChecksum && "Checksum d\xFCzeltildi"].filter(Boolean).join(" \xB7 ")}${s.kessDosyaNotu ? ` (${s.kessDosyaNotu})` : ""}</div>` : ""}
  <table><thead><tr><th>Kalem</th><th>Adet</th><th style="text-align:right;">Birim</th><th style="text-align:right;">Tutar</th></tr></thead>
  <tbody>${kalemler.map((k) => `<tr><td>${k.ad}</td><td>${k.adet || 1}</td><td style="text-align:right;">${fmtTL(k.birimFiyat)}</td><td style="text-align:right;">${fmtTL(k.tutar)}</td></tr>`).join("")}</tbody></table>
  ${(+s.kdvOrani || 0) > 0 ? `<div class="satir" style="text-align:right;">KDV (%${s.kdvOrani}) dahil: ${fmtTL(Math.round((+s.tutar || 0) * (+s.kdvOrani || 0) / (100 + (+s.kdvOrani || 0)) * 100) / 100)}</div>` : ""}
  <div class="toplam">Toplam: ${fmtTL(s.tutar)}</div>
  ${s.garantili ? `<div class="satir" style="margin-top:14px;">\u{1F6E1}\uFE0F Bu i\u015Flem ${s.garantiBitis ? fmtDate(s.garantiBitis) + " tarihine kadar" : ""} garanti kapsam\u0131ndad\u0131r.</div>` : ""}
  </body></html>`;
  htmlBelgeIndir(html, `${s.isEmriNo || "is-emri"}.pdf`);
}
function ozetRaporuIndir(servisler, satislar, giderler, personelListesi) {
  const ayStr = today().slice(0, 7);
  const ayServisler = servisler.filter((s) => s.tarih && s.tarih.startsWith(ayStr) && s.durum === "tamamlandi");
  const aySatislar = satislar.filter((s) => s.tarih && s.tarih.startsWith(ayStr));
  const ayGiderler = giderler.filter((g) => g.tarih && g.tarih.startsWith(ayStr));
  const gelir = ayServisler.reduce((t, s) => t + (+s.tutar || 0), 0) + aySatislar.reduce((t, s) => t + (+s.toplam || 0), 0);
  const gider = ayGiderler.reduce((t, g) => t + (+g.tutar || 0), 0);
  const netKar = gelir - gider;
  const hizmetSayaci = {};
  ayServisler.forEach((s) => {
    const l = HIZMET_TIP_LABEL[s.hizmetTuru] || s.hizmetTuru;
    hizmetSayaci[l] = (hizmetSayaci[l] || 0) + 1;
  });
  const hizmetSiralanmis = Object.entries(hizmetSayaci).sort((a, b) => b[1] - a[1]);
  const teknisyenSatirlari = personelListesi.map((p) => {
    const isler = ayServisler.filter((s) => s.personelId === p.id);
    return { ad: p.ad, sayi: isler.length, ciro: isler.reduce((t, s) => t + (+s.tutar || 0), 0) };
  }).filter((t) => t.sayi > 0).sort((a, b) => b.ciro - a.ciro);
  const settings = getSettings();
  const [, ayNo] = ayStr.split("-");
  const ayAdi = AY_ADLARI[+ayNo - 1];
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Özet Rapor — ${ayAdi}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:40px;color:#111;max-width:680px;margin:0 auto;}
    .head{display:flex;justify-content:space-between;border-bottom:3px solid #e8622c;padding-bottom:16px;margin-bottom:16px;}
    .firma{font-size:20px;font-weight:800;}
    .muted{color:#666;font-size:13px;}
    table{width:100%;border-collapse:collapse;margin-top:10px;margin-bottom:20px;}
    th{text-align:left;padding:8px;border-bottom:2px solid #333;font-size:12px;}
    td{padding:8px;border-bottom:1px solid #eee;font-size:13px;}
    .kutular{display:flex;gap:14px;margin-bottom:20px;}
    .kutu{flex:1;border:1px solid #ddd;border-radius:8px;padding:12px;}
    .kutu .lbl{font-size:11px;color:#666;}
    .kutu .val{font-size:18px;font-weight:800;}
  </style></head><body>
  <div class="head"><div><div class="firma">${settings.firmaAdi || "Atölye"}</div><div class="muted">${settings.firmaAdres || ""} ${settings.firmaTel ? " · " + settings.firmaTel : ""}</div></div>
  <div class="muted">${ayAdi} Aylık Özet Raporu</div></div>
  <div class="kutular">
    <div class="kutu"><div class="lbl">Toplam Gelir</div><div class="val" style="color:#1a9e4f;">${fmtTL(gelir)}</div></div>
    <div class="kutu"><div class="lbl">Toplam Gider</div><div class="val" style="color:#c0392b;">${fmtTL(gider)}</div></div>
    <div class="kutu"><div class="lbl">Net Kâr</div><div class="val" style="color:${netKar >= 0 ? "#1a9e4f" : "#c0392b"};">${fmtTL(netKar)}</div></div>
  </div>
  <h3 style="font-size:14px;">🔧 Hizmet Türü Dağılımı (${ayServisler.length} tamamlanan iş)</h3>
  <table><thead><tr><th>Hizmet Türü</th><th style="text-align:right;">Adet</th></tr></thead>
  <tbody>${hizmetSiralanmis.length === 0 ? `<tr><td colspan="2">Bu ay tamamlanan iş yok.</td></tr>` : hizmetSiralanmis.map(([ad, sayi]) => `<tr><td>${ad}</td><td style="text-align:right;">${sayi}</td></tr>`).join("")}</tbody></table>
  <h3 style="font-size:14px;">🧑‍🔧 Teknisyen Performansı</h3>
  <table><thead><tr><th>Teknisyen</th><th style="text-align:right;">İş Sayısı</th><th style="text-align:right;">Ciro</th></tr></thead>
  <tbody>${teknisyenSatirlari.length === 0 ? `<tr><td colspan="3">Bu ay veriye rastlanmadı.</td></tr>` : teknisyenSatirlari.map((t) => `<tr><td>${t.ad}</td><td style="text-align:right;">${t.sayi}</td><td style="text-align:right;">${fmtTL(t.ciro)}</td></tr>`).join("")}</tbody></table>
  </body></html>`;
  htmlBelgeIndir(html, `Ozet-Rapor-${ayStr}.pdf`);
}
function sonrakiFaturaNo() {
  const mevcut = +(localStorage.getItem("fp_fatura_sayac") || "0") + 1;
  localStorage.setItem("fp_fatura_sayac", String(mevcut));
  return `FTR-${String(mevcut).padStart(4, "0")}`;
}
function faturaOlustur(tur, kaynakId, musteriId, tarih, aciklama, kalemler, toplam, kdvOraniSecili) {
  const mevcut = LS.get("faturalar");
  if (mevcut.some((f) => f.kaynakId === kaynakId)) return null;
  const kdvOrani = kdvOraniSecili != null ? +kdvOraniSecili : +getSettings().kdvOrani || 0;
  const kdvTutari = Math.round(+toplam * kdvOrani / (100 + kdvOrani) * 100) / 100;
  const araToplam = Math.round((+toplam - kdvTutari) * 100) / 100;
  const kayit = { id: uid(), faturaNo: sonrakiFaturaNo(), tarih: tarih || today(), tur, kaynakId, musteriId, aciklama, kalemler: kalemler || [], araToplam, kdvOrani, kdvTutari, toplam: +toplam || 0 };
  LS.set("faturalar", [...mevcut, kayit]);
  return kayit;
}
function faturaYazdir(f, musteriAdi) {
  const settings = getSettings();
  const kalemler = f.kalemler && f.kalemler.length > 0 ? f.kalemler : [{ ad: f.aciklama, adet: 1, birimFiyat: f.toplam, tutar: f.toplam }];
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>${f.faturaNo}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:40px;color:#111;max-width:680px;margin:0 auto;}
    .head{display:flex;justify-content:space-between;border-bottom:3px solid #e8622c;padding-bottom:16px;margin-bottom:16px;}
    .firma{font-size:20px;font-weight:800;}
    .muted{color:#666;font-size:13px;}
    .etiket{display:inline-block;padding:4px 10px;border-radius:6px;background:#eee;font-size:12px;font-weight:700;margin-bottom:14px;}
    table{width:100%;border-collapse:collapse;margin-top:10px;}
    th{text-align:left;padding:8px;border-bottom:2px solid #333;font-size:12px;}
    td{padding:8px;border-bottom:1px solid #eee;font-size:13px;}
    .satir{margin-bottom:6px;font-size:13px;}
    .ozet{margin-top:16px;text-align:right;}
    .ozet div{font-size:13px;margin-bottom:4px;}
    .toplam{font-size:18px;font-weight:800;}
  </style></head><body>
  <div class="head"><div><div class="firma">${settings.firmaAdi || "At\xF6lye"}</div><div class="muted">${settings.firmaAdres || ""} ${settings.firmaTel ? " \xB7 " + settings.firmaTel : ""}</div></div>
  <div class="muted">${fmtDate(f.tarih)}</div></div>
  <div class="etiket">${f.faturaNo}</div>
  <div class="satir"><strong>M\xFC\u015Fteri:</strong> ${musteriAdi || ""}</div>
  ${f.aciklama ? `<div class="satir"><strong>A\xE7\u0131klama:</strong> ${f.aciklama}</div>` : ""}
  <table><thead><tr><th>Kalem</th><th>Adet</th><th style="text-align:right;">Birim</th><th style="text-align:right;">Tutar</th></tr></thead>
  <tbody>${kalemler.map((k) => `<tr><td>${k.ad}</td><td>${k.adet || 1}</td><td style="text-align:right;">${fmtTL(k.birimFiyat)}</td><td style="text-align:right;">${fmtTL(k.tutar)}</td></tr>`).join("")}</tbody></table>
  <div class="ozet">
    <div>Ara Toplam: ${fmtTL(f.araToplam)}</div>
    <div>KDV (%${f.kdvOrani}): ${fmtTL(f.kdvTutari)}</div>
    <div class="toplam">Genel Toplam: ${fmtTL(f.toplam)}</div>
  </div>
  </body></html>`;
  htmlBelgeIndir(html, `${f.faturaNo || "fatura"}.pdf`);
}
function MusteriMemnuniyetiKarti() {
  const [anketler, setAnketler] = useState(null);
  const [servisler] = useState(LS.get("servisIsleri"));
  const [cariler] = useState(LS.get("cariler"));
  const [taslaklar, setTaslaklar] = useState({});
  const yanitTaslagiOlustur = async (a, idx) => {
    setTaslaklar((t) => ({ ...t, [idx]: { devam: true, metin: "", hata: "" } }));
    try {
      const prompt = `Bir m\xFCşteri, tamamlanan bir servis işi i\xE7in ${a.puan}/5 yıldız verdi${a.yorum ? ` ve şu yorumu yazdı: "${a.yorum}"` : " (yorum yazmadı)"}. Bu m\xFCşteriye WhatsApp'tan g\xF6nderilecek, samimi, \xF6z\xFCr dileyici ama abartısız, kısa (2-3 c\xFCmle) bir takip mesajı taslağı yaz. T\xFCrk\xE7e yaz, sadece mesaj metnini d\xF6nd\xFCr, başka bir şey yazma.`;
      const cevap = await aiSor(prompt);
      setTaslaklar((t) => ({ ...t, [idx]: { devam: false, metin: (cevap || "").trim(), hata: "" } }));
    } catch (e) {
      setTaslaklar((t) => ({ ...t, [idx]: { devam: false, metin: "", hata: e.message } }));
    }
  };
  const anketiWhatsappaGonder = (a, metin) => {
    const s = servisler.find((x) => x.isEmriNo === a.isEmriNo);
    const musteri = s ? cariler.find((c) => c.id === s.musteriId) : null;
    if (!musteri || !musteri.tel) {
      alert("Bu m\xFCşterinin telefon numarası bulunamadı.");
      return;
    }
    whatsappLinkAc(musteri.tel, metin);
  };
  useEffect(() => {
    let iptal = false;
    if (!bulutHazirMi()) {
      setAnketler([]);
      return;
    }
    anketleriGetir().then((v) => {
      if (!iptal) setAnketler(v);
    }).catch(() => {
      if (!iptal) setAnketler([]);
    });
    return () => {
      iptal = true;
    };
  }, []);
  if (!bulutHazirMi()) return null;
  const ortalama = anketler && anketler.length > 0 ? anketler.reduce((t, a) => t + (+a.puan || 0), 0) / anketler.length : 0;
  return React.createElement(
    "div",
    { style: S.card },
    React.createElement("div", { style: S.secTitle }, "⭐ Müşteri Memnuniyeti"),
    !anketler ? React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Yükleniyor…") : anketler.length === 0 ? React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Henüz anket yanıtı yok. Teslim edilen işlerde ⭐ butonuyla müşteriden değerlendirme isteyebilirsiniz.") : React.createElement(React.Fragment, null,
      React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 } }, React.createElement("span", { style: { fontSize: 28, fontWeight: 800, color: C.white } }, ortalama.toFixed(1)), React.createElement("span", { style: { color: C.muted, fontSize: 12.5 } }, "/ 5 · ", anketler.length, " yanıt")),
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" } }, anketler.slice(0, 10).map((a, i) => React.createElement(
        "div",
        { key: i, style: { padding: "8px 12px", background: C.surface, borderRadius: 8 } },
        React.createElement("div", { style: { fontSize: 12.5, color: C.white } }, "⭐".repeat(a.puan), " ", React.createElement("span", { style: { color: C.muted, fontSize: 11 } }, a.isEmriNo, " · ", fmtDate(a.tarih))),
        a.yorum && React.createElement("div", { style: { fontSize: 12, color: C.text, marginTop: 4 } }, a.yorum),
        (+a.puan || 0) <= 3 && React.createElement("div", { style: { marginTop: 8 } },
          !taslaklar[i] && React.createElement("button", { type: "button", style: { ...S.btnO, padding: "4px 10px", fontSize: 11 }, onClick: () => yanitTaslagiOlustur(a, i) }, "\u{1F916} Yanıt Taslağı Hazırla"),
          taslaklar[i] && taslaklar[i].devam && React.createElement("span", { style: { fontSize: 11.5, color: C.muted } }, "⏳ Hazırlanıyor..."),
          taslaklar[i] && taslaklar[i].hata && React.createElement("div", { style: { fontSize: 11.5, color: C.red } }, "⚠️ ", taslaklar[i].hata),
          taslaklar[i] && taslaklar[i].metin && React.createElement(React.Fragment, null,
            React.createElement("div", { style: { fontSize: 11.5, color: C.text, background: C.card, padding: "6px 10px", borderRadius: 6, marginBottom: 6, whiteSpace: "pre-wrap" } }, taslaklar[i].metin),
            React.createElement("button", { type: "button", style: { ...S.btnO, padding: "4px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }, onClick: () => anketiWhatsappaGonder(a, taslaklar[i].metin) }, React.createElement(WhatsAppIkon, null), "G\xF6nder")
          )
        )
      )))
    )
  );
}
function Dashboard() {
  const [servisler] = useState(LS.get("servisIsleri"));
  const [satislar] = useState(LS.get("satislar"));
  const [faturalar] = useState(LS.get("faturalar"));
  const [giderler] = useState(LS.get("giderler"));
  const [cariler] = useState(LS.get("cariler"));
  const [araclar] = useState(LS.get("araclar"));
  const [personelListesi] = useState(LS.get("personel"));
  const [topluHatirlatIndex, setTopluHatirlatIndex] = useState(null);
  const aracLabel = (s) => {
    const a = araclar.find((x) => x.id === s.aracId);
    return a ? a.plaka : s.aracPlaka || "—";
  };
  const bugunkuRandevular = servisler.filter((s) => s.tarih === today() && s.durum !== "iptal");
  const hatirlatilabilenBugunku = bugunkuRandevular.filter((s) => { const m = cariler.find((c) => c.id === s.musteriId); return m && m.tel; });
  const topluHatirlatBaslat = () => {
    if (hatirlatilabilenBugunku.length === 0) return;
    setTopluHatirlatIndex(0);
    whatsappRandevuHatirlat(hatirlatilabilenBugunku[0], cariler, aracLabel(hatirlatilabilenBugunku[0]));
  };
  const topluHatirlatSonraki = () => {
    const sonraki = topluHatirlatIndex + 1;
    if (sonraki >= hatirlatilabilenBugunku.length) {
      setTopluHatirlatIndex(null);
      return;
    }
    setTopluHatirlatIndex(sonraki);
    whatsappRandevuHatirlat(hatirlatilabilenBugunku[sonraki], cariler, aracLabel(hatirlatilabilenBugunku[sonraki]));
  };
  const acikServisSayisi = servisler.filter((s) => s.durum !== "tamamlandi" && s.durum !== "iptal").length;
  const manuelSatisToplam = (ay) => faturalar.filter((f) => f.tur === "satis" && f.tarih && f.tarih.startsWith(ay)).reduce((t, f) => t + (+f.toplam || 0), 0);
  const manuelAlisToplam = (ay) => faturalar.filter((f) => f.tur === "alis" && f.tarih && f.tarih.startsWith(ay)).reduce((t, f) => t + (+f.toplam || 0), 0);
  const buAy = today().slice(0, 7);
  const buAyGelir = servisler.filter((s) => s.tarih && s.tarih.startsWith(buAy) && s.durum === "tamamlandi").reduce((t, s) => t + (+s.tutar || 0), 0) + satislar.filter((s) => s.tarih && s.tarih.startsWith(buAy)).reduce((t, s) => t + (+s.toplam || 0), 0) + manuelSatisToplam(buAy);
  const buAyGider = giderler.filter((g) => g.tarih && g.tarih.startsWith(buAy)).reduce((t, g) => t + (+g.tutar || 0), 0) + manuelAlisToplam(buAy);
  const buAyNetKar = buAyGelir - buAyGider;
  const odenmemis = servisler.filter((s) => !s.odendi && s.durum === "tamamlandi").reduce((t, s) => t + servisKalanTutar(s), 0);
  const teknisyenYuku = personelListesi.map((p) => ({
    ad: p.ad,
    acikIsSayisi: servisler.filter((s) => s.personelId === p.id && s.durum !== "tamamlandi" && s.durum !== "iptal").length
  })).sort((a, b) => a.acikIsSayisi - b.acikIsSayisi);
  const atanmamisIsSayisi = servisler.filter((s) => !s.personelId && s.durum !== "tamamlandi" && s.durum !== "iptal").length;
  const buAySatisSayisi = satislar.filter((s) => s.tarih && s.tarih.startsWith(buAy)).length;
  const sonSatislar = [...satislar].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).slice(0, 5);
  const hizmetDagilimi = Object.entries(
    servisler.reduce((acc, s) => {
      const l = HIZMET_TIP_LABEL[s.hizmetTuru] || s.hizmetTuru;
      acc[l] = (acc[l] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
  const renkler = [C.accent, C.blue, C.green, C.yellow, C.purple];
  const son6Ay = Array.from({ length: 6 }, (_, i) => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });
  const aylikOzet = son6Ay.map((ayStr) => {
    const gelir = servisler.filter((s) => s.tarih && s.tarih.startsWith(ayStr) && s.durum === "tamamlandi").reduce((t, s) => t + (+s.tutar || 0), 0) + satislar.filter((s) => s.tarih && s.tarih.startsWith(ayStr)).reduce((t, s) => t + (+s.toplam || 0), 0) + manuelSatisToplam(ayStr);
    const gider = giderler.filter((g) => g.tarih && g.tarih.startsWith(ayStr)).reduce((t, g) => t + (+g.tutar || 0), 0) + manuelAlisToplam(ayStr);
    const [yilStr, ayNo] = ayStr.split("-");
    return { ay: `${AY_ADLARI[+ayNo - 1].slice(0, 3)} '${yilStr.slice(2)}`, Gelir: gelir, Gider: gider };
  });
  const giderKategoriDagilimi = Object.entries(
    giderler.reduce((acc, g) => {
      const k = g.kategori || "Diğer";
      acc[k] = (acc[k] || 0) + (+g.tutar || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const yaklasanGarantiler = servisler.filter((s) => s.garantili && s.garantiBitis && s.garantiBitis >= today()).map((s) => ({ ...s, kalanGun: Math.ceil((new Date(s.garantiBitis) - new Date(today())) / 864e5) })).filter((s) => s.kalanGun <= 30).sort((a, b) => a.kalanGun - b.kalanGun);
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "Genel Bakış"), /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => ozetRaporuIndir(servisler, satislar, giderler, personelListesi) }, "📊 Bu Ayın Özet Raporunu İndir (PDF)")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.muted, marginBottom: 20 } }, (/* @__PURE__ */ new Date()).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })), /* @__PURE__ */ React.createElement(Grid4, null, /* @__PURE__ */ React.createElement(StatCard, { color: C.accent, icon: "\u{1F527}", value: acikServisSayisi, label: "Açık Servis İşi" }), /* @__PURE__ */ React.createElement(StatCard, { color: buAyNetKar >= 0 ? C.green : C.red, icon: "\u{1F4B0}", value: fmtTL(buAyNetKar), label: "Bu Ay Net Kâr", sub: `Gelir ${fmtTL(buAyGelir)} − Gider ${fmtTL(buAyGider)}` }), /* @__PURE__ */ React.createElement(StatCard, { color: C.red, icon: "⏳", value: fmtTL(odenmemis), label: "Tahsil Edilecek" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.blue, icon: "\u{1F6D2}", value: buAySatisSayisi, label: "Bu Ay El Arabası Satışı" })), bugunkuRandevular.length > 0 && React.createElement(
    "div",
    { style: { ...S.card, borderTop: `3px solid ${C.accent}` } },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 } },
      React.createElement("div", { style: S.secTitle }, "📅 Bugünkü Randevular (", bugunkuRandevular.length, ")"),
      hatirlatilabilenBugunku.length > 0 && topluHatirlatIndex === null && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }, onClick: topluHatirlatBaslat }, React.createElement(WhatsAppIkon, null), "Tümüne Hatırlat (", hatirlatilabilenBugunku.length, ")")
    ),
    React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 12 } }, "Bugün planlı işler için müşterilere WhatsApp ile randevu hatırlatması gönderebilirsiniz."),
    topluHatirlatIndex !== null && React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "8px 14px", background: C.accent + "18", borderRadius: 8, marginBottom: 12 } },
      React.createElement("span", { style: { fontSize: 12, color: C.text } }, "WhatsApp sekmesi açıldı (", topluHatirlatIndex + 1, "/", hatirlatilabilenBugunku.length, ") — gönderdikten sonra buraya dönüp devam edin."),
      React.createElement("div", { style: { display: "flex", gap: 8 } },
        React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: topluHatirlatSonraki }, "Sonraki ▶"),
        React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => setTopluHatirlatIndex(null) }, "Durdur")
      )
    ),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, bugunkuRandevular.map((s) => React.createElement(
      "div",
      { key: s.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: C.surface, borderRadius: 8, flexWrap: "wrap", gap: 6 } },
      React.createElement("span", { style: { fontSize: 12.5, color: C.text } }, React.createElement("strong", { style: { color: C.white } }, aracLabel(s)), " — ", cariAd(cariler, s.musteriId), " — ", HIZMET_TIP_LABEL[s.hizmetTuru]),
      React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => whatsappRandevuHatirlat(s, cariler, aracLabel(s)) }, React.createElement(WhatsAppIkon, null)), React.createElement(Badge, { d: s.durum }))
    )))
  ), yaklasanGarantiler.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { ...S.card, borderTop: `3px solid ${C.yellow}` } }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "🛡️ Yaklaşan Garanti Bitişleri (", yaklasanGarantiler.length, ")"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, yaklasanGarantiler.map((s) => /* @__PURE__ */ React.createElement(
    "div",
    { key: s.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: C.surface, borderRadius: 8, flexWrap: "wrap", gap: 6 } },
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.text } }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, s.aracPlaka || "—"), " — ", cariAd(cariler, s.musteriId), " — ", HIZMET_TIP_LABEL[s.hizmetTuru]),
    /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(s.kalanGun <= 7 ? C.red : C.yellow) } }, s.kalanGun, " gün kaldı")
  )))), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F6D2} Son El Arabası Satışları"), sonSatislar.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Henüz satış yok.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, sonSatislar.map(
    (s) => /* @__PURE__ */ React.createElement("div", { key: s.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderRadius: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.text } }, EL_ARABASI_TUR_LABEL[s.tur] || s.tur), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 } }, cariAd(cariler, s.musteriId))), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: C.accent } }, fmtTL(s.toplam)))
  ))), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4CA} Hizmet Türü Dağılımı"), RC.PieChart && hizmetDagilimi.length > 0 ? /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 200 }, /* @__PURE__ */ React.createElement(PieChart, null, /* @__PURE__ */ React.createElement(Pie, { data: hizmetDagilimi, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 78, paddingAngle: 3, label: ({ name, value }) => `${name}: ${value}` }, hizmetDagilimi.map((e, i) => /* @__PURE__ */ React.createElement(Cell, { key: i, fill: renkler[i % renkler.length] }))), /* @__PURE__ */ React.createElement(Tooltip, { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 } }))) : /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Henüz veri yok."))), /* @__PURE__ */ React.createElement(
      Grid2,
      null,
      /* @__PURE__ */ React.createElement(
        "div",
        { style: S.card },
        /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4C8} Son 6 Ay Gelir/Gider"),
        RC.BarChart ? /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 220 }, /* @__PURE__ */ React.createElement(
          BarChart,
          { data: aylikOzet },
          /* @__PURE__ */ React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: C.border }),
          /* @__PURE__ */ React.createElement(XAxis, { dataKey: "ay", tick: { fill: C.muted, fontSize: 11 } }),
          /* @__PURE__ */ React.createElement(YAxis, { tick: { fill: C.muted, fontSize: 11 } }),
          /* @__PURE__ */ React.createElement(Tooltip, { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }, formatter: (v) => fmtTL(v) }),
          /* @__PURE__ */ React.createElement(Bar, { dataKey: "Gelir", fill: C.green, radius: [4, 4, 0, 0] }),
          /* @__PURE__ */ React.createElement(Bar, { dataKey: "Gider", fill: C.red, radius: [4, 4, 0, 0] })
        )) : /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Henüz veri yok.")
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { style: S.card },
        /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4B8} Gider Kategorisi Dağılımı"),
        RC.PieChart && giderKategoriDagilimi.length > 0 ? /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 220 }, /* @__PURE__ */ React.createElement(PieChart, null, /* @__PURE__ */ React.createElement(Pie, { data: giderKategoriDagilimi, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 78, paddingAngle: 3, label: ({ name, value }) => `${name}: ${fmtTL(value)}` }, giderKategoriDagilimi.map((e, i) => /* @__PURE__ */ React.createElement(Cell, { key: i, fill: renkler[i % renkler.length] }))), /* @__PURE__ */ React.createElement(Tooltip, { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }, formatter: (v) => fmtTL(v) }))) : /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Henüz veri yok.")
      )
    ), React.createElement(MusteriMemnuniyetiKarti, null), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F9D1}‍\u{1F527} Teknisyen İş Yükü"), personelListesi.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Henüz personel eklenmedi.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, teknisyenYuku.map(
    (t) => /* @__PURE__ */ React.createElement("div", { key: t.ad, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderRadius: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text } }, t.ad), /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(t.acikIsSayisi === 0 ? C.green : t.acikIsSayisi <= 2 ? C.blue : C.yellow) } }, t.acikIsSayisi, " açık iş"))
  ), atanmamisIsSayisi > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, padding: "10px 14px", background: C.red + "18", borderRadius: 8, fontSize: 12, color: C.red } }, "⚠️ ", atanmamisIsSayisi, " iş henüz kimseye atanmamış — en boşta olan ", teknisyenYuku[0]?.ad || "bir teknisyen", " önerilir."))), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F552} Son Servis İşleri"), servisler.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Henüz kayıt yok.") : /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Müşteri"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Araç"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Hizmet"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tutar"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Durum"))), /* @__PURE__ */ React.createElement("tbody", null, [...servisler].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).slice(0, 6).map(
    (s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(s.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, cariAd(cariler, s.musteriId)), /* @__PURE__ */ React.createElement("td", { style: S.td }, s.aracPlaka), /* @__PURE__ */ React.createElement("td", { style: S.td }, HIZMET_TIP_LABEL[s.hizmetTuru]), /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtTL(s.tutar)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement(Badge, { d: s.durum })))
  )))));
}
const AY_ADLARI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUN_ADLARI = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
function Takvim({ sayfayaGit } = {}) {
  const [servisler] = useState(LS.get("servisIsleri"));
  const [cariler] = useState(LS.get("cariler"));
  const [araclar] = useState(LS.get("araclar"));
  const su = /* @__PURE__ */ new Date();
  const [yil, setYil] = useState(su.getFullYear());
  const [ay, setAy] = useState(su.getMonth());
  const [seciliGun, setSeciliGun] = useState(today());
  const [topluHatirlatIndex, setTopluHatirlatIndex] = useState(null);

  const gunStr = (y, a, g) => `${y}-${String(a + 1).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
  const ilkGun = new Date(yil, ay, 1);
  const gunSayisi = new Date(yil, ay + 1, 0).getDate();
  const bosluk = (ilkGun.getDay() + 6) % 7;
  const gunler = [];
  for (let i = 0; i < bosluk; i++) gunler.push(null);
  for (let g = 1; g <= gunSayisi; g++) gunler.push(g);

  const aracLabel = (s) => {
    const a = araclar.find((x) => x.id === s.aracId);
    return a ? a.plaka : s.aracPlaka || "—";
  };
  const resmiHatirlaticilar = resmiHatirlaticilarGetir();
  const gununResmiHatirlaticilari = (gun) => resmiHatirlaticilar.filter((r) => r.gun === gun);
  const gununIsleri = (tarih) => servisler.filter((s) => s.tarih === tarih && s.durum !== "iptal");
  const bugunIsleri = gununIsleri(today());
  const seciliIsleri = gununIsleri(seciliGun);
  const seciliHatirlatilabilenler = seciliIsleri.filter((s) => { const m = cariler.find((c) => c.id === s.musteriId); return m && m.tel; });
  const topluHatirlatBaslat = () => {
    if (seciliHatirlatilabilenler.length === 0) {
      alert("Telefon numarası kayıtlı müşteri bulunamadı.");
      return;
    }
    setTopluHatirlatIndex(0);
    whatsappRandevuHatirlat(seciliHatirlatilabilenler[0], cariler, aracLabel(seciliHatirlatilabilenler[0]));
  };
  const topluHatirlatSonraki = () => {
    const sonraki = topluHatirlatIndex + 1;
    if (sonraki >= seciliHatirlatilabilenler.length) {
      setTopluHatirlatIndex(null);
      return;
    }
    setTopluHatirlatIndex(sonraki);
    whatsappRandevuHatirlat(seciliHatirlatilabilenler[sonraki], cariler, aracLabel(seciliHatirlatilabilenler[sonraki]));
  };

  const oncekiAy = () => {
    if (ay === 0) {
      setAy(11);
      setYil((y) => y - 1);
    } else setAy((a) => a - 1);
  };
  const sonrakiAy = () => {
    if (ay === 11) {
      setAy(0);
      setYil((y) => y + 1);
    } else setAy((a) => a + 1);
  };
  const buguneGit = () => {
    setYil(su.getFullYear());
    setAy(su.getMonth());
    setSeciliGun(today());
  };

  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "fp-fade" },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } },
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "📅 Randevu Takvimi"),
      sayfayaGit && /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => sayfayaGit("servis") }, "◀ İş Emri'ne Dön")
    ),
    bugunIsleri.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { ...S.card, borderTop: `3px solid ${C.accent}` } }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "Bugün Planlı Araçlar (", bugunIsleri.length, ")"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, bugunIsleri.map((s) => /* @__PURE__ */ React.createElement(
      "div",
      { key: s.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: C.surface, borderRadius: 8, flexWrap: "wrap", gap: 6 } },
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.text } }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, aracLabel(s)), " — ", cariAd(cariler, s.musteriId), " — ", HIZMET_TIP_LABEL[s.hizmetTuru]),
      /* @__PURE__ */ React.createElement(Badge, { d: s.durum })
    )))),
    /* @__PURE__ */ React.createElement(
      "div",
      { style: S.card },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: oncekiAy }, "◀"), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, color: C.white } }, AY_ADLARI[ay], " ", yil), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: buguneGit }, "Bugün"), /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: sonrakiAy }, "▶"))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 } }, GUN_ADLARI.map((g) => /* @__PURE__ */ React.createElement("div", { key: g, style: { textAlign: "center", fontSize: 11, color: C.muted, fontWeight: 700 } }, g))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 } }, gunler.map((g, i) => {
        if (g === null) return /* @__PURE__ */ React.createElement("div", { key: "b" + i });
        const tarih = gunStr(yil, ay, g);
        const isler = gununIsleri(tarih);
        const resmiler = gununResmiHatirlaticilari(g);
        const bugunMu = tarih === today();
        const seciliMi = tarih === seciliGun;
        return /* @__PURE__ */ React.createElement(
          "div",
          { key: tarih, title: resmiler.map((r) => r.ad).join(", "), onClick: () => setSeciliGun(tarih), style: { padding: "8px 4px", borderRadius: 8, textAlign: "center", cursor: "pointer", minHeight: 52, background: seciliMi ? C.accent + "33" : bugunMu ? C.surface : "transparent", border: `1px solid ${seciliMi ? C.accent : bugunMu ? C.border : "transparent"}` } },
          /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: bugunMu ? C.accent : C.text, fontWeight: bugunMu ? 800 : 400 } }, g),
          isler.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(C.blue), fontSize: 9.5, padding: "1px 6px" } }, isler.length)),
          resmiler.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(C.yellow), fontSize: 9.5, padding: "1px 6px" } }, "\u{1F4C4}"))
        );
      }))
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      { style: S.card },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 } },
        /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, fmtDate(seciliGun), " Tarihli İşler (", seciliIsleri.length, ")", gununResmiHatirlaticilari(+seciliGun.slice(8, 10)).length > 0 && /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(C.yellow), fontSize: 10.5, marginLeft: 8 } }, "\u{1F4C4} ", gununResmiHatirlaticilari(+seciliGun.slice(8, 10)).map((r) => r.ad).join(", "))),
        seciliHatirlatilabilenler.length > 0 && topluHatirlatIndex === null && /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }, onClick: topluHatirlatBaslat }, /* @__PURE__ */ React.createElement(WhatsAppIkon, null), "T\xFCm\xFCne Hatırlat (", seciliHatirlatilabilenler.length, ")")
      ),
      topluHatirlatIndex !== null && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "8px 14px", background: C.accent + "18", borderRadius: 8, marginBottom: 12 } },
        /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.text } }, "WhatsApp sekmesi a\xE7ıldı (", topluHatirlatIndex + 1, "/", seciliHatirlatilabilenler.length, ") — g\xF6nderdikten sonra buraya d\xF6n\xFCp devam edin."),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } },
          /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: topluHatirlatSonraki }, "Sonraki ▶"),
          /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => setTopluHatirlatIndex(null) }, "Durdur")
        )
      ),
      seciliIsleri.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Bu tarihte kayıtlı iş yok.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, seciliIsleri.map((s) => /* @__PURE__ */ React.createElement(
        "div",
        { key: s.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderRadius: 8, flexWrap: "wrap", gap: 6 } },
        /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text } }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, s.isEmriNo), " — ", aracLabel(s), " — ", cariAd(cariler, s.musteriId), " — ", HIZMET_TIP_LABEL[s.hizmetTuru]),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => whatsappRandevuHatirlat(s, cariler, aracLabel(s)) }, /* @__PURE__ */ React.createElement(WhatsAppIkon, null)), /* @__PURE__ */ React.createElement(Badge, { d: s.durum }))
      )))
    )
  );
}
function ServisIsleri({ hedef, hedefTemizle, sayfayaGit } = {}) {
  const [cariler, setCariler] = useState(LS.get("cariler"));
  const [araclar, setAraclar] = useState(LS.get("araclar"));
  const [personelListesi] = useState(LS.get("personel"));
  const [hesaplar] = useState(LS.get("hesaplar"));
  const [liste, setListe] = useState(LS.get("servisIsleri"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [hata, setHata] = useState("");
  const [yeniAracAcik, setYeniAracAcik] = useState(false);
  const [sahipDuzenAcik, setSahipDuzenAcik] = useState(false);
  const [sahipForm, setSahipForm] = useState({});
  const [arama, setArama] = useState("");
  const [odemeModal, setOdemeModal] = useState(null);
  const [odemeHesapId, setOdemeHesapId] = useState("");
  const [odemeYontemi, setOdemeYontemi] = useState("Nakit");
  const [odemeTutari, setOdemeTutari] = useState(0);
  const [aciklamaOneriDevam, setAciklamaOneriDevam] = useState(false);
  const [aciklamaOneriHata, setAciklamaOneriHata] = useState("");
  const [gecmisModal, setGecmisModal] = useState(null);
  const [detayAracId, setDetayAracId] = useState(null);
  const [personelFiltre, setPersonelFiltre] = useState("");
  const [sadeceBenim, setSadeceBenim] = useState(false);
  const [kessOneriDevam, setKessOneriDevam] = useState(false);
  const [kessOneriMetni, setKessOneriMetni] = useState("");
  const [kessDetayAcik, setKessDetayAcik] = useState(false);
  const [kessYardimAcik, setKessYardimAcik] = useState(false);
  const [kessYardimAdim, setKessYardimAdim] = useState(1);
  const [kessYardimKategori, setKessYardimKategori] = useState("");
  const [kessYardimSoru, setKessYardimSoru] = useState("");
  const [kessYardimCevap, setKessYardimCevap] = useState("");
  const [kessYardimDevam, setKessYardimDevam] = useState(false);
  const [kessHataAcik, setKessHataAcik] = useState(false);
  const [kessHataMetni, setKessHataMetni] = useState("");
  const [kessHataCevap, setKessHataCevap] = useState("");
  const [kessHataDevam, setKessHataDevam] = useState(false);
  const benimPersonelim = (() => {
    const k = googleKullanici();
    if (!k || !k.ad) return null;
    return personelListesi.find((p) => (p.ad || "").trim().toLocaleLowerCase("tr-TR") === k.ad.trim().toLocaleLowerCase("tr-TR")) || null;
  })();

  const fiyatOnerisiHesapla = () => {
    if (!form.hizmetTuru) return null;
    const benzerIsler = liste.filter((s) => s.hizmetTuru === form.hizmetTuru && s.durum !== "iptal" && (+s.tutar || 0) > 0 && s.id !== form.id);
    if (benzerIsler.length === 0) return null;
    const sonIs = [...benzerIsler].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""))[0];
    return { tutar: +sonIs.tutar || 0, tarih: sonIs.tarih, sayisi: benzerIsler.length };
  };
  const aciklamadanOner = async () => {
    if (!(form.aciklama || "").trim()) {
      setAciklamaOneriHata("\xD6nce a\xE7ıklama girin (sesle veya yazarak).");
      return;
    }
    setAciklamaOneriDevam(true);
    setAciklamaOneriHata("");
    try {
      const prompt = `Bir oto egzoz/chiptuning at\xF6lyesinde teknisyen bir işi sesli olarak şöyle anlattı: "${form.aciklama}". Hizmet t\xFCr\xFC: ${HIZMET_TIP_LABEL[form.hizmetTuru] || "belirtilmemiş"}.
Bunu SADECE şu JSON formatında d\xF6nd\xFCr, başka hi\xE7bir metin yazma:
{"temizAciklama":"d\xFCzg\xFCn, kısa, iş emrine yazılacak temiz a\xE7ıklama metni","tutarOnerisi":sayı veya null}
Tutar hakkında yeterli bilgi yoksa tutarOnerisi'ni null yap.`;
      const cevap = await aiSor(prompt);
      const veri = aiJsonAyikla(cevap);
      if (!veri) {
        setAciklamaOneriHata("Yanıt yorumlanamadı, tekrar deneyin.");
        return;
      }
      setForm((f) => ({ ...f, aciklama: veri.temizAciklama || f.aciklama, tutar: veri.tutarOnerisi > 0 ? Math.round(veri.tutarOnerisi) : f.tutar }));
    } catch (e) {
      setAciklamaOneriHata(e.message);
    } finally {
      setAciklamaOneriDevam(false);
    }
  };

  const kessOner = async () => {
    setKessOneriDevam(true);
    setKessOneriMetni("");
    try {
      const arac = form.aracId ? araclar.find((a) => a.id === form.aracId) : null;
      const aracBilgisi = arac ? `${arac.marka || "bilinmiyor"} ${arac.model || ""} ${arac.yil || ""}`.trim() : "belirtilmedi";
      const gecmisIsler = arac ? liste.filter((s) => {
        if (s.id === form.id || s.hizmetTuru !== "chiptuning") return false;
        if (!(s.kessStage || s.kessProtokol || s.kessEcuMarka)) return false;
        const a2 = araclar.find((x) => x.id === s.aracId);
        return a2 && a2.marka === arac.marka && a2.model === arac.model;
      }) : [];
      const gecmisMetin = gecmisIsler.slice(0, 3).map((s) => `- ECU: ${s.kessEcuMarka || "belirtilmemiş"} · Protokol: ${s.kessProtokol || "belirtilmemiş"} · Stage: ${s.kessStage || "belirtilmemiş"}${s.kessDosyaNotu ? ` · Not: ${s.kessDosyaNotu}` : ""}`).join("\n");
      const prompt = `Bir oto chiptuning atölyesinde KESS V3 (Alientech) cihazıyla ECU chiptuning yapılacak. Araç: ${aracBilgisi}.${gecmisMetin ? `\n\nAtölyemizde daha önce aynı marka/modelde yapılan işler:\n${gecmisMetin}\nBu geçmiş kayıtları da dikkate alarak öneride bulun.` : ""}\n\nBu araç i\xE7in kısaca (en fazla 4-5 satır, madde madde): 1) muhtemel ECU markası, 2) KESS V3 i\xE7in önerilen bağlantı protokol\xFC (OBD / Bench / Boot-BDM), 3) g\xFCvenli başlangı\xE7 stage önerisi ve dikkat edilmesi gereken 1-2 nokta yaz. Emin olmadığın teknik detaylarda "aracı/ECU'y\xFC kontrol edin" diye belirt. Başka hi\xE7bir şey ekleme.`;
      const cevap = await aiSor(prompt);
      setKessOneriMetni(cevap.trim());
    } catch (e) {
      setKessOneriMetni("Hata: " + e.message);
    }
    setKessOneriDevam(false);
  };
  const kessYardimSor = async () => {
    if (!kessYardimSoru.trim()) return;
    setKessYardimDevam(true);
    setKessYardimCevap("");
    try {
      const kategoriMetni = kessYardimKategori ? `Konu kategorisi: ${kessYardimKategori}. ` : "";
      const prompt = `Sen Alientech KESS V3 ECU chiptuning cihazı konusunda uzman bir teknik destek asistanısın. ${kategoriMetni}Bir oto tamir/chiptuning ustasının aşağıdaki sorusunu kısa, pratik, adım adım ve T\xFCrk\xE7e yanıtla. Emin olmadığın konularda resmi KESS V3 kılavuzuna veya yetkili servise y\xF6nlendir. \n\nSoru: "${kessYardimSoru.trim()}"`;
      const cevap = await aiSor(prompt);
      setKessYardimCevap(cevap.trim());
    } catch (e) {
      setKessYardimCevap("Hata: " + e.message);
    }
    setKessYardimDevam(false);
  };
  const kessHataSor = async () => {
    if (!kessHataMetni.trim()) return;
    setKessHataDevam(true);
    setKessHataCevap("");
    try {
      const prompt = `Sen Alientech KESS V3 ECU chiptuning cihazında görülen hata kodları ve checksum sorunları konusunda uzman bir teknik destek asistanısın. Aşağıdaki hata mesajını veya belirtiyi analiz et; muhtemel sebeplerini ve çözüm adımlarını kısa, madde madde ve Türkçe yaz. Emin olmadığın konularda resmi KESS V3 kılavuzuna veya yetkili servise yönlendir.\n\nHata/Belirti: "${kessHataMetni.trim()}"`;
      const cevap = await aiSor(prompt);
      setKessHataCevap(cevap.trim());
    } catch (e) {
      setKessHataCevap("Hata: " + e.message);
    }
    setKessHataDevam(false);
  };

  const kaydet = () => {
    if (!form.aracId) {
      setHata("Ara\xE7 se\xE7imi zorunludur.");
      return;
    }
    if (!form.hizmetTuru) {
      setHata("Hizmet t\xFCr\xFC se\xE7imi zorunludur.");
      return;
    }
    setHata("");
    const yeniKayit = !form.id;
    const asama = form.asama || "tamirde";
    const kayit = {
      ...form,
      id: form.id || uid(),
      tarih: form.tarih || today(),
      saat: form.saat || nowTime(),
      isEmriNo: form.isEmriNo || sonrakiIsEmriNo(),
      tutar: +form.tutar || 0,
      asama,
      durum: asamaDurum(asama)
    };
    if (yeniKayit) {
      kayit.durumGecmisi = [{ tarih: today(), asama, not: "\u0130\u015F emri olu\u015Fturuldu." }];
    } else {
      const eski = liste.find((x) => x.id === form.id);
      if (eski && eski.asama !== asama) {
        kayit.durumGecmisi = [...(eski.durumGecmisi || []), { tarih: today(), asama, not: "A\u015Fama g\xFCncellendi." }];
      } else {
        kayit.durumGecmisi = eski ? eski.durumGecmisi : kayit.durumGecmisi;
      }
    }
    const eskiKayit = form.id ? liste.find((x) => x.id === form.id) : null;
    const yeni = form.id ? liste.map((x) => x.id === form.id ? kayit : x) : [...liste, kayit];
    LS.set("servisIsleri", yeni);
    setListe(yeni);
    sonKullanilanKaydet(kayit.personelId, kayit.hizmetTuru);
    setModalAcik(false);
    if (kayit.asama === "teslim_edildi") {
      faturaOlustur("servis", kayit.id, kayit.musteriId, kayit.tarih, `${kayit.isEmriNo} \u2014 ${HIZMET_TIP_LABEL[kayit.hizmetTuru] || ""}`, kayit.kalemler, kayit.tutar);
      if (!eskiKayit || eskiKayit.asama !== "teslim_edildi") whatsappTeslimBildir(kayit, cariler, liste);
    }
    if (googleTakvimHazirMi()) {
      googleTakvimEtkinlikSenkronEt(kayit, cariAd(cariler, kayit.musteriId), aracEtiket(kayit)).then((eventId) => {
        if (eventId && eventId !== kayit.googleEtkinlikId) {
          const guncel = LS.get("servisIsleri").map((x) => x.id === kayit.id ? { ...x, googleEtkinlikId: eventId } : x);
          LS.set("servisIsleri", guncel);
          setListe(guncel);
        }
      });
    }
  };

  const sil = (id) => {
    if (!confirm("Bu servis kayd\u0131 silinsin mi? (\xC7\xF6p kutusundan geri y\xFCkleyebilirsiniz)")) return;
    const silinen = liste.find((x) => x.id === id);
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("servisIsleri", yeni);
    setListe(yeni);
    if (silinen) coplendir("servisIsleri", silinen);
    if (silinen && silinen.googleEtkinlikId) googleTakvimEtkinlikSil(silinen.googleEtkinlikId);
  };
  const topluSil = (secilenler) => {
    if (secilenler.length === 0) return;
    if (!confirm(`${secilenler.length} kay\u0131t silinsin mi? (\xC7\xF6p kutusundan geri y\xFCkleyebilirsiniz)`)) return;
    const secilenIdler = new Set(secilenler.map((x) => x.id));
    secilenler.forEach((x) => {
      coplendir("servisIsleri", x);
      if (x.googleEtkinlikId) googleTakvimEtkinlikSil(x.googleEtkinlikId);
    });
    const yeni = liste.filter((x) => !secilenIdler.has(x.id));
    LS.set("servisIsleri", yeni);
    setListe(yeni);
  };

  const teslimEt = (s) => {
    const yeni = liste.map((x) => x.id === s.id ? { ...x, asama: "teslim_edildi", durum: "tamamlandi", durumGecmisi: [...(x.durumGecmisi || []), { tarih: today(), asama: "teslim_edildi", not: "Teslim edildi olarak i\u015faretlendi." }] } : x);
    LS.set("servisIsleri", yeni);
    setListe(yeni);
    faturaOlustur("servis", s.id, s.musteriId, today(), `${s.isEmriNo} \u2014 ${HIZMET_TIP_LABEL[s.hizmetTuru] || ""}`, s.kalemler, s.tutar);
    whatsappTeslimBildir({ ...s, asama: "teslim_edildi" }, cariler, liste);
  };

  const iptalEt = (s) => {
    if (!confirm("Bu i\u015F emri iptal edilsin mi?")) return;
    const yeni = liste.map((x) => x.id === s.id ? { ...x, asama: "iptal", durum: "iptal", durumGecmisi: [...(x.durumGecmisi || []), { tarih: today(), asama: "iptal", not: "\u0130ptal edildi." }] } : x);
    LS.set("servisIsleri", yeni);
    setListe(yeni);
  };

  const garantiTekrarAc = (s) => {
    setForm({
      tarih: today(),
      musteriId: s.musteriId,
      aracId: s.aracId,
      aracPlaka: s.aracPlaka,
      hizmetTuru: s.hizmetTuru,
      personelId: s.personelId,
      aciklama: `\u{1F6E1}\uFE0F Garanti kapsam\u0131nda tekrar i\u015F \u2014 kaynak: ${s.isEmriNo || ""}`,
      garantiKaynakIsId: s.id,
      tutar: 0,
      asama: "teslim_edildi"
    });
    setHata("");
    setModalAcik(true);
  };

  const odendiIsaretle = (id) => {
    const yeni = liste.map((x) => x.id === id ? { ...x, odendi: true } : x);
    LS.set("servisIsleri", yeni);
    setListe(yeni);
  };
  const odemeOnayla = () => {
    if (!odemeHesapId) {
      alert("Hesap se\xE7imi zorunludur.");
      return;
    }
    const s = odemeModal;
    const kalan = servisKalanTutar(s);
    const girilenTutar = Math.min(+odemeTutari || 0, kalan);
    if (!(girilenTutar > 0)) {
      alert("Tutar 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    hesapHareketiKaydet(odemeHesapId, "giris", girilenTutar, today(), `Servis \xF6demesi \u2014 ${s.isEmriNo || ""} ${HIZMET_TIP_LABEL[s.hizmetTuru] || ""} (${cariAd(cariler, s.musteriId)})`, "servis", odemeYontemi);
    const yeniOdemeler = [...(s.odemeler || []), { id: uid(), tarih: today(), tutar: girilenTutar, yontem: odemeYontemi, hesapId: odemeHesapId }];
    const tamOdendi = servisKalanTutar({ ...s, odemeler: yeniOdemeler }) <= 0;
    const yeni = liste.map((x) => x.id === s.id ? { ...x, odemeler: yeniOdemeler, odendi: tamOdendi, odemeHesapId, odemeYontemi } : x);
    LS.set("servisIsleri", yeni);
    setListe(yeni);
    setOdemeModal(null);
    setOdemeHesapId("");
    setOdemeYontemi("Nakit");
    setOdemeTutari(0);
  };

  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const aracEtiket = (s) => {
    const a = aracBilgi(araclar, s.aracId);
    return a ? `${a.plaka}${a.marka ? " \xB7 " + a.marka + " " + (a.model || "") : ""}` : s.aracPlaka || "\u2014";
  };
  const detayArac = detayAracId ? araclar.find((a) => a.id === detayAracId) : null;
  const detayAracServisleri = detayAracId ? liste.filter((s) => s.aracId === detayAracId).sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")) : [];
  const detayAracGuncelle = (patch) => {
    const yeni = araclar.map((a) => a.id === detayAracId ? { ...a, ...patch } : a);
    LS.set("araclar", yeni);
    setAraclar(yeni);
  };
  const metneGoreFiltreli = !aramaMetni ? liste : liste.filter((s) => (cariAd(cariler, s.musteriId) + " " + aracEtiket(s) + " " + (s.aciklama || "") + " " + (s.isEmriNo || "")).toLocaleLowerCase("tr-TR").includes(aramaMetni));
  const etkinPersonelFiltre = sadeceBenim && benimPersonelim ? benimPersonelim.id : personelFiltre;
  const gosterilecek = !etkinPersonelFiltre ? metneGoreFiltreli : metneGoreFiltreli.filter((s) => s.personelId === etkinPersonelFiltre);
  const araclarSirali = [...araclar].sort((a, b) => (a.plaka || "").localeCompare(b.plaka || ""));
  const secilenArac = form.aracId ? araclar.find((a) => a.id === form.aracId) : null;
  const secilenAracSahibi = secilenArac ? cariler.find((c) => c.id === secilenArac.musteriId) : null;
  const aracSec = (aracId) => {
    const a = araclar.find((x) => x.id === aracId);
    setForm((f) => ({ ...f, aracId, musteriId: a ? a.musteriId : "" }));
  };
  const sahipKaydet = () => {
    if (!(sahipForm.ad || "").trim()) {
      alert("M\xFCşteri / Firma adı zorunludur.");
      return;
    }
    if (!secilenArac) return;
    const mevcutCariler = LS.get("cariler");
    let cariId = secilenArac.musteriId;
    let yeniCariler;
    if (cariId && mevcutCariler.some((c) => c.id === cariId)) {
      yeniCariler = mevcutCariler.map((c) => c.id === cariId ? { ...c, ad: sahipForm.ad.trim(), tel: (sahipForm.tel || "").trim(), adres: (sahipForm.adres || "").trim() } : c);
    } else {
      const yeniCari = { id: uid(), ad: sahipForm.ad.trim(), tel: (sahipForm.tel || "").trim(), adres: (sahipForm.adres || "").trim() };
      cariId = yeniCari.id;
      yeniCariler = [...mevcutCariler, yeniCari];
    }
    LS.set("cariler", yeniCariler);
    setCariler(yeniCariler);
    const yeniAraclar = araclar.map((a) => a.id === secilenArac.id ? { ...a, musteriId: cariId } : a);
    LS.set("araclar", yeniAraclar);
    setAraclar(yeniAraclar);
    setForm((f) => ({ ...f, musteriId: cariId }));
    setSahipDuzenAcik(false);
  };
  const garantiDurumu = (s) => {
    if (!s.garantili || !s.garantiBitis) return null;
    const kalanGun = Math.ceil((new Date(s.garantiBitis) - new Date(today())) / 864e5);
    return kalanGun >= 0 ? { metin: `Garanti: ${kalanGun} g\xFCn kald\u0131`, renk: C.green } : { metin: "Garanti bitti", renk: C.muted };
  };
  const yeniIsEmriAc = () => {
    setForm({ tarih: today(), saat: nowTime(), asama: "teslim_edildi", tutar: 0, kdvOrani: 0, personelId: sonKullanilanPersonelId(), hizmetTuru: sonKullanilanHizmetTuru() });
    setHata("");
    setModalAcik(true);
  };
  useEffect(() => {
    if (!hedef) return;
    if (hedef.tip === "yeni_is_emri") {
      yeniIsEmriAc();
    } else if (hedef.tip === "duzenle_servis") {
      const s = liste.find((x) => x.id === hedef.id);
      if (s) { setForm(s); setHata(""); setModalAcik(true); }
    }
    hedefTemizle && hedefTemizle();
  }, [hedef]);
  const kessAcik = kessDetayAcik || !!(form.kessEcuMarka || form.kessProtokol || form.kessStage || form.kessDosyaNotu || form.kessChecksum);

  return React.createElement(
    "div",
    { className: "fp-fade" },
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } },
      React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F527} \u0130\u015F Emri Olu\u015Ftur"),
      React.createElement("div", { style: { display: "flex", gap: 8 } },
        sayfayaGit && React.createElement("button", { style: S.btnO, onClick: () => sayfayaGit("takvim") }, "\u{1F4C5} Randevu Takvimi"),
        React.createElement("button", { style: S.btn(), onClick: yeniIsEmriAc }, "\u2795 \u0130\u015F Emri Olu\u015Ftur")
      )
    ),
    React.createElement(Grid4, null,
      React.createElement(StatCard, { color: C.accent, icon: "\u{1F527}", value: liste.length, label: "Toplam \u0130\u015F Emri" }),
      React.createElement(StatCard, { color: C.blue, icon: "\u{1F4C5}", value: liste.filter((s) => s.tarih === today() && s.durum !== "iptal").length, label: "Bug\xFCnk\xFC \u0130\u015Fler" })
    ),
    React.createElement(
      "div",
      { style: S.card },
      React.createElement("input", { style: { ...S.inp, marginBottom: 10 }, placeholder: "\u{1F50D} \u0130\u015F emri no, m\xFC\u015Fteri, plaka veya a\xE7\u0131klamada ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 } },
        React.createElement("select", { style: { ...S.sel, maxWidth: 240 }, value: personelFiltre, onChange: (e) => { setPersonelFiltre(e.target.value); setSadeceBenim(false); } }, React.createElement("option", { value: "" }, "\u{1F464} T\xFCm personel"), personelListesi.map((p) => React.createElement("option", { key: p.id, value: p.id }, p.ad))),
        benimPersonelim && React.createElement("button", { type: "button", style: sadeceBenim ? S.btn() : S.btnO, onClick: () => setSadeceBenim((v) => !v) }, "\u{1F464} Bana Atanan \u0130\u015Fler")
      ),
      React.createElement(SiraliTablo, {
        dosyaAdi: "servis_isleri",
        rowKey: (s) => s.id,
        bosMesaj: "Kayıt bulunamadı.",
        rows: [...gosterilecek].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")),
        columns: [
          { key: "isEmri", baslik: "İş Emri", sirala: (s) => s.isEmriNo || "", render: (s) => React.createElement(React.Fragment, null, React.createElement("strong", { style: { color: C.accent } }, s.isEmriNo || "—"), React.createElement("div", { style: { fontSize: 10.5, color: C.muted, marginTop: 2 } }, fmtDate(s.tarih), s.saat ? ` · ${s.saat}` : "")) },
          { key: "musteri", baslik: "Müşteri", sirala: (s) => cariAd(cariler, s.musteriId), render: (s) => React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, s.musteriId)) },
          { key: "arac", baslik: "Araç/Ürün", sirala: (s) => aracEtiket(s), render: (s) => s.aracId ? React.createElement("strong", { style: { color: C.accent, cursor: "pointer", textDecoration: "underline" }, title: "Araç sicilini görüntüle (fotoğraf, belge, servis geçmişi)", onClick: () => setDetayAracId(s.aracId) }, aracEtiket(s)) : aracEtiket(s) },
          { key: "hizmet", baslik: "Hizmet", sirala: (s) => HIZMET_TIP_LABEL[s.hizmetTuru] || "", render: (s) => HIZMET_TIP_LABEL[s.hizmetTuru] },
          { key: "sorumlu", baslik: "Sorumlu", sirala: (s) => { const p = personelListesi.find((p2) => p2.id === s.personelId); return p ? p.ad : ""; }, render: (s) => { const sorumlu = personelListesi.find((p) => p.id === s.personelId); return sorumlu ? sorumlu.ad : "—"; } },
          { key: "tutar", baslik: "Tutar", sirala: (s) => +s.tutar || 0, render: (s) => React.createElement("strong", { style: { color: C.accent } }, fmtTL(s.tutar)) },
          { key: "odeme", baslik: "Ödeme", sirala: (s) => servisOdemeDurumu(s) === "odendi" ? 2 : servisOdemeDurumu(s) === "kismi" ? 1 : 0, render: (s) => {
            const durum = servisOdemeDurumu(s);
            return durum === "odendi"
              ? React.createElement(Badge, { d: durum, map: SERVIS_ODEME_LABEL, renk: SERVIS_ODEME_RENK })
              : React.createElement("div", null,
                  React.createElement(Badge, { d: durum, map: SERVIS_ODEME_LABEL, renk: SERVIS_ODEME_RENK }),
                  durum === "kismi" && React.createElement("div", { style: { fontSize: 10.5, color: C.muted, marginTop: 2 } }, "Kalan: ", fmtTL(servisKalanTutar(s))),
                  React.createElement("button", { style: { ...S.btnO, padding: "4px 10px", fontSize: 11, marginTop: 4 }, onClick: () => { setOdemeModal(s); setOdemeHesapId(hesaplar[0] ? hesaplar[0].id : ""); setOdemeTutari(servisKalanTutar(s)); } }, durum === "kismi" ? "Kalanı Tahsil Et" : "Ödendi İşaretle")
                );
          } },
          { key: "asama", baslik: "Aşama", sirala: (s) => asamaEtiket(s.asama) || "", render: (s) => { const garanti = garantiDurumu(s); return React.createElement(
            React.Fragment,
            null,
            React.createElement("span", { style: { ...S.badge(asamaRenk(s.asama)), cursor: "pointer" }, title: "Aşama geçmişini görmek için tıkla", onClick: () => setGecmisModal(s) }, asamaEtiket(s.asama)),
            garanti && React.createElement("div", { style: { fontSize: 10.5, color: garanti.renk, marginTop: 4 } }, "🛡️ ", garanti.metin),
            s.asama !== "teslim_edildi" && s.asama !== "iptal" && React.createElement("button", { style: { ...S.btnO, padding: "2px 8px", fontSize: 10.5, marginTop: 4 }, onClick: () => teslimEt(s) }, "✅ Teslim Et")
          ); } },
          { key: "islemler", baslik: "", render: (s) => React.createElement(
            "div",
            { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
            React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "WhatsApp ile durum bildir", onClick: () => {
              const musteri = cariler.find((c) => c.id === s.musteriId);
              const mesaj = sablonDoldur(mesajSablonlariGetir().durumBildirim, { musteri: musteri ? musteri.ad : "", isEmriNo: s.isEmriNo || "", arac: aracEtiket(s), durum: asamaEtiket(s.asama), tutarEtiket: s.durum === "tamamlandi" ? ` Tutar: ${fmtTL(s.tutar)}.` : "" });
              whatsappLinkAc(musteri ? musteri.tel : "", mesaj);
            } }, React.createElement(WhatsAppIkon, null)),
            React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "PDF indir", onClick: () => isEmriYazdir(s, cariAd(cariler, s.musteriId), aracEtiket(s)) }, "📄"),
            s.asama === "teslim_edildi" && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "Memnuniyet Anketi Gönder", onClick: () => whatsappAnketGonder(s, cariler) }, "⭐"),
            s.durum === "tamamlandi" && s.garantili && (!s.garantiBitis || s.garantiBitis >= today()) && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, title: "Garanti Kapsamında Tekrar İş Aç", onClick: () => garantiTekrarAc(s) }, "🛡️"),
            s.asama !== "iptal" && s.asama !== "teslim_edildi" && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11, color: C.red }, title: "İptal Et", onClick: () => iptalEt(s) }, "✕"),
            React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => { setForm(s); setHata(""); setModalAcik(true); } }, "✏️"),
            React.createElement("button", { style: S.btnR, onClick: () => sil(s.id) }, "🗑️")
          ) }
        ],
        topluIslem: {
          onSil: topluSil,
          whatsapp: (s) => {
            const musteri = cariler.find((c) => c.id === s.musteriId);
            if (!musteri || !musteri.tel) return null;
            return { telefon: musteri.tel, mesaj: `Merhaba ${musteri.ad}, ${s.isEmriNo || ""} numaralı ${aracEtiket(s)} işleminizin durumu: ${asamaEtiket(s.asama)}.${s.durum === "tamamlandi" ? ` Tutar: ${fmtTL(s.tutar)}.` : ""} — As Egzoz & Makine` };
          }
        }
      })
    ),
    modalAcik && React.createElement(
      Modal,
      { title: form.id ? `\u0130\u015F Emrini D\xFCzenle \u2014 ${form.isEmriNo || ""}` : "Yeni \u0130\u015F Emri", onClose: () => setModalAcik(false), width: 640 },
      React.createElement(
        Grid2,
        null,
        React.createElement(FG, { label: "Tarih" }, React.createElement("input", { type: "date", style: S.inp, value: form.tarih || "", onChange: (e) => setForm((f) => ({ ...f, tarih: e.target.value })) })),
        React.createElement(FG, { label: "Saat" }, React.createElement("input", { type: "time", style: S.inp, value: form.saat || "", onChange: (e) => setForm((f) => ({ ...f, saat: e.target.value })) }))
      ),
      React.createElement(FG, { label: "Hizmet T\xFCr\xFC" }, React.createElement("select", { style: S.sel, value: form.hizmetTuru || "", onChange: (e) => setForm((f) => ({ ...f, hizmetTuru: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), Object.entries(HIZMET_TIP_LABEL).map(([k, l]) => React.createElement("option", { key: k, value: k }, l)))),
      React.createElement(FG, { label: "Ara\xE7 (Plaka)" }, React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement("select", { style: S.sel, value: form.aracId || "", onChange: (e) => aracSec(e.target.value) }, React.createElement("option", { value: "" }, "\u2014 Plaka se\xE7iniz \u2014"), araclarSirali.map((a) => React.createElement("option", { key: a.id, value: a.id }, a.plaka, a.marka ? ` \xB7 ${a.marka} ${a.model || ""}` : "", " ", `(${aracSahibiAd(cariler, a.musteriId)})`))),
        React.createElement("button", { type: "button", style: S.btnO, onClick: () => setYeniAracAcik(true) }, "\u2795 Yeni Ara\xE7")
      )),
      secilenArac && React.createElement(
        "div",
        { style: { background: C.surface, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, color: C.text } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, React.createElement("strong", { style: { color: C.white } }, "\u{1F464} Ara\xE7 Sahibi"), React.createElement("button", { type: "button", style: { ...S.btnO, padding: "3px 10px", fontSize: 11 }, onClick: () => {
          setSahipForm({ ad: secilenAracSahibi ? secilenAracSahibi.ad : "", tel: secilenAracSahibi ? secilenAracSahibi.tel : "", adres: secilenAracSahibi ? secilenAracSahibi.adres : "" });
          setSahipDuzenAcik(true);
        } }, "\u270F\uFE0F D\xFCzenle")),
        secilenAracSahibi ? React.createElement(React.Fragment, null, React.createElement("div", { style: { marginTop: 6 } }, secilenAracSahibi.ad), React.createElement("div", { style: { color: C.muted, marginTop: 2 } }, secilenAracSahibi.tel || "Telefon yok"), React.createElement("div", { style: { color: C.muted, marginTop: 2 } }, secilenAracSahibi.adres || "Adres yok")) : React.createElement("div", { style: { color: C.muted, marginTop: 6 } }, "Bilinmiyor")
      ),
      React.createElement(FG, { label: "Sorumlu Personel (opsiyonel)" }, React.createElement("select", { style: S.sel, value: form.personelId || "", onChange: (e) => setForm((f) => ({ ...f, personelId: e.target.value })) }, React.createElement("option", { value: "" }, "— Seçiniz —"), personelListesi.map((p) => React.createElement("option", { key: p.id, value: p.id }, p.ad, p.pozisyon ? ` (${p.pozisyon})` : "")))),
      React.createElement(FG, { label: "A\xE7\u0131klama" }, React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, React.createElement("textarea", { style: { ...S.inp, minHeight: 60, flex: 1 }, value: form.aciklama || "", onChange: (e) => setForm((f) => ({ ...f, aciklama: e.target.value })) }), React.createElement(SesliGirisButonu, { deger: form.aciklama, onDeger: (v) => setForm((f) => ({ ...f, aciklama: v })) }), React.createElement("button", { type: "button", title: "A\xE7ıklamadan temiz metin ve tutar \xF6ner", style: { ...S.btnO, padding: "6px 10px", flexShrink: 0 }, onClick: aciklamadanOner, disabled: aciklamaOneriDevam }, aciklamaOneriDevam ? "⏳" : "\u{1F916}"))),
      aciklamaOneriHata && React.createElement("div", { style: { color: C.red, fontSize: 11.5, marginBottom: 12 } }, "⚠️ ", aciklamaOneriHata),

      form.hizmetTuru === "chiptuning" && React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 14px", background: C.surface, borderRadius: 8 } },
          React.createElement("input", { type: "checkbox", checked: kessAcik, onChange: (e) => setKessDetayAcik(e.target.checked), style: { width: 16, height: 16 } }),
          React.createElement("span", { style: { fontSize: 13, color: C.text } }, "\u26A1 Bu i\u015F KESS V3 chiptuning detaylar\u0131 i\u00E7eriyor")
        ),
        kessAcik && React.createElement(
        "div",
        { style: { background: C.surface, borderRadius: 8, padding: "12px 14px", marginBottom: 14 } },
        React.createElement("div", { style: { ...S.secTitle, fontSize: 13, marginBottom: 10 } }, "\u26A1 KESS V3 Chiptuning Detaylar\u0131"),
        React.createElement(Grid2, null,
          React.createElement(FG, { label: "ECU Markas\u0131" }, React.createElement("input", { list: "ecu-markalari", style: S.inp, value: form.kessEcuMarka || "", onChange: (e) => setForm((f) => ({ ...f, kessEcuMarka: e.target.value })), placeholder: "\xD6rn: Bosch" })),
          React.createElement(FG, { label: "Ba\u011Flant\u0131 Protokol\xFC" }, React.createElement("select", { style: S.sel, value: form.kessProtokol || "", onChange: (e) => setForm((f) => ({ ...f, kessProtokol: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), KESS_PROTOKOL_LISTESI.map((p) => React.createElement("option", { key: p, value: p }, p))))
        ),
        React.createElement("datalist", { id: "ecu-markalari" }, ECU_MARKALARI.map((m) => React.createElement("option", { key: m, value: m }))),
        React.createElement(Grid2, null,
          React.createElement(FG, { label: "Uygulanan Stage" }, React.createElement("select", { style: S.sel, value: form.kessStage || "", onChange: (e) => setForm((f) => ({ ...f, kessStage: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), KESS_STAGE_LISTESI.map((s) => React.createElement("option", { key: s, value: s }, s)))),
          React.createElement(FG, { label: "Dosya Notu (opsiyonel)" }, React.createElement("input", { style: S.inp, value: form.kessDosyaNotu || "", onChange: (e) => setForm((f) => ({ ...f, kessDosyaNotu: e.target.value })), placeholder: "\xD6rn: orijinal_okundu.bin" }))
        ),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 } },
          React.createElement("input", { type: "checkbox", checked: !!form.kessChecksum, onChange: (e) => setForm((f) => ({ ...f, kessChecksum: e.target.checked })), style: { width: 16, height: 16 } }),
          React.createElement("span", { style: { fontSize: 12.5, color: C.text } }, "Checksum d\xFCzeltildi")
        ),
        React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
          React.createElement("button", { type: "button", style: S.btnO, onClick: kessOner, disabled: kessOneriDevam }, kessOneriDevam ? "\u23F3" : "\u{1F916} AI'dan Stage/Protokol \xD6ner"),
          React.createElement("button", { type: "button", style: S.btnO, onClick: () => { setKessYardimAcik(true); setKessYardimAdim(1); setKessYardimKategori(""); setKessYardimSoru(""); setKessYardimCevap(""); } }, "\u2753 KESS V3 Ad\u0131m Ad\u0131m Yard\u0131m"),
          React.createElement("button", { type: "button", style: S.btnO, onClick: () => { setKessHataAcik(true); setKessHataMetni(""); setKessHataCevap(""); } }, "\u{1F6E0}\uFE0F Hata Kodu / Checksum \xC7\xF6z")
        ),
        kessOneriMetni && React.createElement(React.Fragment, null,
          React.createElement("div", { style: { marginTop: 10, padding: "8px 12px", background: C.card, borderRadius: 8, fontSize: 12, color: C.text, whiteSpace: "pre-line" } }, kessOneriMetni),
          React.createElement("div", { style: { marginTop: 6, fontSize: 11, color: C.yellow } }, "\u26A0\uFE0F Bu \u00F6neri genel bilgiye dayan\u0131r, dyno testi ve ger\u00E7ek ECU okumas\u0131 olmadan do\u011Frudan uygulamay\u0131n.")
        )
        )
      ),


      React.createElement(Grid2, null,
        React.createElement(FG, { label: "Toplam (\u20BA)" }, React.createElement("input", { type: "number", style: S.inp, value: form.tutar || "", onChange: (e) => setForm((f) => ({ ...f, tutar: +e.target.value })) })),
        React.createElement(FG, { label: "KDV Oran\u0131" }, React.createElement("select", { style: S.sel, value: form.kdvOrani ?? 0, onChange: (e) => setForm((f) => ({ ...f, kdvOrani: +e.target.value })) }, kdvOranlariGetir().map((o) => React.createElement("option", { key: o, value: o }, "%", o))))
      ),
      (+form.kdvOrani || 0) > 0 && React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: -8, marginBottom: 14 } }, "Toplam KDV dahildir \u2014 KDV tutar\u0131: ", fmtTL(Math.round((+form.tutar || 0) * (+form.kdvOrani || 0) / (100 + (+form.kdvOrani || 0)) * 100) / 100)),
      (() => {
        const oneri = fiyatOnerisiHesapla();
        if (!oneri) return null;
        return React.createElement("div", { style: { fontSize: 11.5, color: C.blue, marginTop: -8, marginBottom: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, "💡 En son benzer iş (", fmtDate(oneri.tarih), "): ", React.createElement("strong", null, fmtTL(oneri.tutar)), ` (toplam ${oneri.sayisi} benzer iş var)`, React.createElement("button", { type: "button", style: { ...S.btnO, padding: "3px 10px", fontSize: 11 }, onClick: () => setForm((f) => ({ ...f, tutar: oneri.tutar })) }, "Uygula"));
      })(),
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 14px", background: C.surface, borderRadius: 8 } },
        React.createElement("input", { type: "checkbox", checked: !!form.garantili, onChange: (e) => {
          const checked = e.target.checked;
          setForm((f) => ({ ...f, garantili: checked, garantiBitis: checked && !f.garantiBitis ? birYilSonra() : f.garantiBitis }));
        }, style: { width: 16, height: 16 } }),
        React.createElement("span", { style: { fontSize: 13, color: C.text } }, "\u{1F6E1}\uFE0F Bu i\u015F garanti kapsam\u0131nda")
      ),
      form.garantili && React.createElement(
        Grid2,
        null,
        React.createElement(FG, { label: "Garanti Biti\u015F Tarihi" }, React.createElement("input", { type: "date", style: S.inp, value: form.garantiBitis || "", onChange: (e) => setForm((f) => ({ ...f, garantiBitis: e.target.value })) })),
        React.createElement(FG, { label: "Garanti Kapsam\u0131 (opsiyonel)" }, React.createElement("input", { style: S.inp, value: form.garantiAciklama || "", onChange: (e) => setForm((f) => ({ ...f, garantiAciklama: e.target.value })), placeholder: "\xD6rn: Sadece i\u015F\xE7ilik, par\xE7a hari\xE7" }))
      ),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 } },
        React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "\u0130ptal"),
        React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet")
      )
    ),
    yeniAracAcik && React.createElement(Modal, { title: "\u2795 Yeni Ara\xE7 Ekle", onClose: () => setYeniAracAcik(false), width: 460 }, React.createElement(HizliAracFormu, { cariler, onClose: () => setYeniAracAcik(false), onEklendi: (yeni, tumAraclar, tumCariler) => {
      setAraclar(tumAraclar);
      setCariler(tumCariler);
      setForm((f) => ({ ...f, aracId: yeni.id, musteriId: yeni.musteriId }));
      setYeniAracAcik(false);
    } })),
    sahipDuzenAcik && React.createElement(
      Modal,
      { title: "\u270f\ufe0f Ara\xE7 Sahibini D\xFCzenle", onClose: () => setSahipDuzenAcik(false), width: 420 },
      React.createElement(FG, { label: "M\xFC\u015fteri / Firma Ad\u0131" }, React.createElement("input", { style: S.inp, value: sahipForm.ad || "", onChange: (e) => setSahipForm((f) => ({ ...f, ad: e.target.value })), autoFocus: true })),
      React.createElement(FG, { label: "Telefon" }, React.createElement("input", { style: S.inp, value: sahipForm.tel || "", onChange: (e) => setSahipForm((f) => ({ ...f, tel: e.target.value })) })),
      React.createElement(FG, { label: "Adres" }, React.createElement("input", { style: S.inp, value: sahipForm.adres || "", onChange: (e) => setSahipForm((f) => ({ ...f, adres: e.target.value })) })),
      React.createElement(BenzerCariUyarisi, { cariler, ad: sahipForm.ad, tel: sahipForm.tel, haricId: secilenArac ? secilenArac.musteriId : null }),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setSahipDuzenAcik(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: sahipKaydet }, "Kaydet"))
    ),
    odemeModal && React.createElement(
      Modal,
      { title: "\u{1F4B0} \xD6deme Al", onClose: () => setOdemeModal(null), width: 400 },
      React.createElement("div", { style: { fontSize: 13, color: C.muted, marginBottom: 14 } }, "Toplam Tutar: ", React.createElement("strong", { style: { color: C.white } }, fmtTL(odemeModal.tutar)), servisOdenenTutar(odemeModal) > 0 && React.createElement(React.Fragment, null, " \u2014 \u015eu ana kadar \xF6denen: ", React.createElement("strong", { style: { color: C.green } }, fmtTL(servisOdenenTutar(odemeModal))))),
      React.createElement(FG, { label: "Tahsil Edilecek Tutar" }, React.createElement("input", { type: "number", style: S.inp, value: odemeTutari || "", onChange: (e) => setOdemeTutari(+e.target.value) })),
      React.createElement(FG, { label: "Hesap" }, React.createElement("select", { style: S.sel, value: odemeHesapId, onChange: (e) => setOdemeHesapId(e.target.value) }, hesaplar.length === 0 && React.createElement("option", { value: "" }, "\xD6nce Kasa & Banka'dan hesap ekleyin"), hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad)))),
      React.createElement(FG, { label: "\xD6deme Y\xF6ntemi" }, React.createElement("select", { style: S.sel, value: odemeYontemi, onChange: (e) => setOdemeYontemi(e.target.value) }, ODEME_YONTEMLERI.map((y) => React.createElement("option", { key: y, value: y }, y)))),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setOdemeModal(null) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: odemeOnayla }, "Onayla"))
    ),
    gecmisModal && React.createElement(
      Modal,
      { title: `\u{1F4CB} ${gecmisModal.isEmriNo || ""} \u2014 A\u015Fama Ge\xE7mi\u015Fi`, onClose: () => setGecmisModal(null), width: 420 },
      (gecmisModal.durumGecmisi || []).length === 0
        ? React.createElement("div", { style: { color: C.muted } }, "Ge\xE7mi\u015F kayd\u0131 yok.")
        : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, [...(gecmisModal.durumGecmisi || [])].reverse().map((h, i) => React.createElement(
            "div",
            { key: i, style: { padding: "8px 12px", background: C.surface, borderRadius: 8 } },
            React.createElement("div", { style: { fontSize: 12.5, color: C.white, fontWeight: 700 } }, asamaEtiket(h.asama)),
            React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 } }, fmtDate(h.tarih), h.not ? " \xB7 " + h.not : "")
          )))
    ),
    kessYardimAcik && React.createElement(
      Modal,
      { title: "❓ KESS V3 Adım Adım Yardım", onClose: () => setKessYardimAcik(false), width: 480 },
      kessYardimAdim === 1 ? React.createElement(React.Fragment, null,
        React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 12 } }, "1. Adım: Önce sorunuzun konusunu se\xE7in."),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } }, KESS_YARDIM_KATEGORILERI.map((k) => React.createElement("button", { key: k, type: "button", style: S.btnO, onClick: () => { setKessYardimKategori(k); setKessYardimAdim(2); } }, k)))
      ) : React.createElement(React.Fragment, null,
        React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 12 } }, "2. Adım: Kategori: ", React.createElement("strong", { style: { color: C.white } }, kessYardimKategori), " — sorunuzu detaylandırın."),
        React.createElement(FG, { label: "Sorunuz" }, React.createElement("textarea", { style: { ...S.inp, minHeight: 70 }, value: kessYardimSoru, onChange: (e) => setKessYardimSoru(e.target.value), placeholder: "\xD6rn: Bench modda bağlantı sağlanamıyor, ne kontrol etmeliyim?" })),
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 12 } },
          React.createElement("button", { type: "button", style: S.btnO, onClick: () => setKessYardimAdim(1) }, "← Geri"),
          React.createElement("button", { style: S.btn(), onClick: kessYardimSor, disabled: kessYardimDevam || !kessYardimSoru.trim() }, kessYardimDevam ? "⏳ Soruluyor..." : "\u{1F916} Sor")
        ),
        kessYardimCevap && React.createElement("div", { style: { padding: "10px 14px", background: C.surface, borderRadius: 8, fontSize: 13, color: C.text, whiteSpace: "pre-line" } }, kessYardimCevap)
      ),
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 14 } }, React.createElement("button", { style: S.btnO, onClick: () => setKessYardimAcik(false) }, "Kapat"))
    ),
    kessHataAcik && React.createElement(
      Modal,
      { title: "\u{1F6E0}️ Hata Kodu / Checksum \xC7\xF6z\xFCc\xFC", onClose: () => setKessHataAcik(false), width: 480 },
      React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 12 } }, "KESS V3 ekranında veya yazılımında g\xF6rd\xFCğ\xFCn\xFCz hata mesajını ya da belirtiyi olduğu gibi yapıştırın."),
      React.createElement(FG, { label: "Hata Mesajı / Belirti" }, React.createElement("textarea", { style: { ...S.inp, minHeight: 80 }, value: kessHataMetni, onChange: (e) => setKessHataMetni(e.target.value), placeholder: "\xD6rn: Checksum error, ECU cevap vermiyor..." })),
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 } }, React.createElement("button", { style: S.btn(), onClick: kessHataSor, disabled: kessHataDevam || !kessHataMetni.trim() }, kessHataDevam ? "⏳ Analiz ediliyor..." : "\u{1F916} Analiz Et")),
      kessHataCevap && React.createElement("div", { style: { padding: "10px 14px", background: C.surface, borderRadius: 8, fontSize: 13, color: C.text, whiteSpace: "pre-line" } }, kessHataCevap),
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 14 } }, React.createElement("button", { style: S.btnO, onClick: () => setKessHataAcik(false) }, "Kapat"))
    ),
    detayArac && React.createElement(AracDetayModal, { arac: detayArac, cariler, servisler: detayAracServisleri, onClose: () => setDetayAracId(null), onGuncelle: detayAracGuncelle })
  );
}
function otsuEsigi(histogram, toplamPiksel) {
  let toplam = 0;
  for (let i = 0; i < 256; i++) toplam += i * histogram[i];
  let toplamArka = 0, agirlikArka = 0, enIyiEsik = 127, enIyiVaryans = 0;
  for (let esik = 0; esik < 256; esik++) {
    agirlikArka += histogram[esik];
    if (agirlikArka === 0) continue;
    const agirlikOn = toplamPiksel - agirlikArka;
    if (agirlikOn === 0) break;
    toplamArka += esik * histogram[esik];
    const ortalamaArka = toplamArka / agirlikArka;
    const ortalamaOn = (toplam - toplamArka) / agirlikOn;
    const varyans = agirlikArka * agirlikOn * (ortalamaArka - ortalamaOn) ** 2;
    if (varyans > enIyiVaryans) {
      enIyiVaryans = varyans;
      enIyiEsik = esik;
    }
  }
  return enIyiEsik;
}
function goruntuOnIsle(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h);
  const veri = img.data;
  const piksel = w * h;
  const gri = new Uint8ClampedArray(piksel);
  let min = 255, max = 0;
  for (let i = 0, p = 0; i < veri.length; i += 4, p++) {
    const g = 0.299 * veri[i] + 0.587 * veri[i + 1] + 0.114 * veri[i + 2];
    gri[p] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const aralik = Math.max(1, max - min);
  const gerilmis = new Uint8ClampedArray(piksel);
  const histogram = new Array(256).fill(0);
  for (let p = 0; p < piksel; p++) {
    const v = Math.round((gri[p] - min) / aralik * 255);
    gerilmis[p] = v;
    histogram[v]++;
  }
  const esik = otsuEsigi(histogram, piksel);
  for (let i = 0, p = 0; i < veri.length; i += 4, p++) {
    const v = gerilmis[p] > esik ? 255 : 0;
    veri[i] = veri[i + 1] = veri[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
}
function PlakaKameraTarayici({ onSonuc }) {
  const [acik, setAcik] = useState(false);
  const [tarama, setTarama] = useState(false);
  const [hata, setHata] = useState("");
  const [fenerVar, setFenerVar] = useState(false);
  const [fenerAcik, setFenerAcik] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const kamerayiKapat = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setAcik(false);
    setFenerVar(false);
    setFenerAcik(false);
  };
  useEffect(() => () => kamerayiKapat(), []);

  const kamerayiAc = async () => {
    setHata("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHata("Bu cihaz/tarayıcı kamera erişimini desteklemiyor. L\xFCtfen adresi https:// ile ve Safari/Chrome ile a\xE7\u0131n.");
      return;
    }
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
      } catch (e1) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      setAcik(true);
      try {
        const track = stream.getVideoTracks()[0];
        const yetenekler = track.getCapabilities ? track.getCapabilities() : {};
        setFenerVar(!!yetenekler.torch);
      } catch {
      }
    } catch (e) {
      setHata("Kameraya eri\u015Filemedi: " + e.message + " \u2014 iPhone\u0027da Ayarlar > Safari > Kamera izninin a\xE7\u0131k oldu\u011Fundan emin olun.");
    }
  };
  useEffect(() => {
    if (!acik || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.muted = true;
    video.playsInline = true;
    const oynat = () => video.play().catch(() => {});
    if (video.readyState >= 1) oynat();
    else video.onloadedmetadata = oynat;
  }, [acik]);
  const fenerDegistir = async () => {
    const track = streamRef.current && streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !fenerAcik }] });
      setFenerAcik((v) => !v);
    } catch {
      setHata("Fener açılamadı, cihazınız desteklemiyor olabilir.");
    }
  };
  const canvasdanOku = async (canvas) => {
    let worker = null;
    try {
      worker = await window.Tesseract.createWorker("eng");
      await worker.setParameters({ tessedit_char_whitelist: "ABCDEFGHIJKLMNOPRSTUVYZ0123456789 ", tessedit_pageseg_mode: "7" });
      const { data } = await worker.recognize(canvas);
      const ham = (data.text || "").toUpperCase();
      const temiz = ham.replace(/[^A-Z0-9]/g, "");
      const eslesme = temiz.match(/\d{2}[A-Z]{1,3}\d{2,4}/);
      return { sonuc: eslesme ? plakaNormalize(eslesme[0]) : "", ham };
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch {
        }
      }
    }
  };
  const cekVeOku = async () => {
    if (!videoRef.current || !window.Tesseract) {
      setHata("OCR kütüphanesi yüklenemedi, internet bağlantınızı kontrol edip tekrar deneyin.");
      return;
    }
    setTarama(true);
    setHata("");
    try {
      const video = videoRef.current;
      const vw = video.videoWidth, vh = video.videoHeight;
      if (!vw || !vh) {
        setHata("Kamera görüntüsü henüz hazır değil, bir saniye bekleyip tekrar deneyin.");
        setTarama(false);
        return;
      }
      const cropW = vw * 0.88, cropH = vh * 0.34;
      const cropX = (vw - cropW) / 2, cropY = (vh - cropH) / 2;
      const olcek = 3;
      const canvas = document.createElement("canvas");
      canvas.width = cropW * olcek;
      canvas.height = cropH * olcek;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
      goruntuOnIsle(ctx, canvas.width, canvas.height);
      const { sonuc, ham } = await canvasdanOku(canvas);
      if (!sonuc) {
        setHata(`Plaka okunamadı${ham.trim() ? ` (algılanan metin: "${ham.trim()}")` : ""} — plakayı çerçeveye düz açıyla, yakın ve net hizalayıp tekrar deneyin. Kamera hâlâ okumuyorsa "📁 Fotoğraftan Oku" ile net bir fotoğraf çekip deneyin.`);
      } else {
        onSonuc(sonuc);
        kamerayiKapat();
      }
    } catch (e) {
      setHata("Okuma hatası: " + e.message);
    } finally {
      setTarama(false);
    }
  };
  const resimdenOku = async (e) => {
    const dosya = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!dosya) return;
    if (!window.Tesseract) {
      setHata("OCR kütüphanesi yüklenemedi, internet bağlantınızı kontrol edip tekrar deneyin.");
      return;
    }
    setTarama(true);
    setHata("");
    try {
      const veriUrl = await dosyaOku(dosya);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = veriUrl;
      });
      const olcek = Math.min(2, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * olcek;
      canvas.height = img.height * olcek;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      goruntuOnIsle(ctx, canvas.width, canvas.height);
      const { sonuc, ham } = await canvasdanOku(canvas);
      if (!sonuc) {
        setHata(`Plaka okunamadı${ham.trim() ? ` (algılanan metin: "${ham.trim()}")` : ""} — plakanın tamamının net ve düz açıyla göründüğü bir fotoğrafla tekrar deneyin.`);
      } else {
        onSonuc(sonuc);
        kamerayiKapat();
      }
    } catch (e) {
      setHata("Okuma hatası: " + e.message);
    } finally {
      setTarama(false);
    }
  };

  if (!acik) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 } },
      /* @__PURE__ */ React.createElement("button", { type: "button", style: S.btnO, onClick: kamerayiAc }, "📷 Kamera ile Plaka Tara"),
      /* @__PURE__ */ React.createElement("label", { style: { ...S.btnO, cursor: "pointer" } }, tarama ? "Okunuyor…" : "📁 Fotoğraftan Oku", /* @__PURE__ */ React.createElement("input", { type: "file", accept: "image/*", capture: "environment", disabled: tarama, style: { display: "none" }, onChange: resimdenOku })),
      hata && /* @__PURE__ */ React.createElement("div", { style: { width: "100%", color: C.red, fontSize: 12 } }, "⚠️ ", hata)
    );
  }
  return /* @__PURE__ */ React.createElement(
    "div",
    { style: { border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 10, background: C.surface } },
    /* @__PURE__ */ React.createElement("div", { style: { position: "relative", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("video", { ref: videoRef, autoPlay: true, playsInline: true, "webkit-playsinline": "true", muted: true, disablePictureInPicture: true, style: { width: "100%", borderRadius: 8, maxHeight: 240, objectFit: "cover", background: "#000", display: "block" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "33%", left: "6%", width: "88%", height: "34%", border: `2px dashed ${C.accent}`, borderRadius: 6, pointerEvents: "none" } }), fenerVar && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: fenerDegistir, style: { position: "absolute", top: 8, right: 8, background: fenerAcik ? C.accent : "#000000aa", color: fenerAcik ? "#161311" : "#fff", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer" } }, "\u{1F4A1}")),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 8 } }, "Plakayı çerçeveye, düz açıyla ve iyi ışıkta hizalayın."),
    hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12, marginBottom: 8 } }, "⚠️ ", hata),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
      /* @__PURE__ */ React.createElement("button", { type: "button", style: { ...S.btn(), flex: 1 }, disabled: tarama, onClick: cekVeOku }, tarama ? "Okunuyor…" : "📸 Çek ve Oku"),
      /* @__PURE__ */ React.createElement("label", { style: { ...S.btnO, cursor: "pointer" } }, "📁", /* @__PURE__ */ React.createElement("input", { type: "file", accept: "image/*", capture: "environment", disabled: tarama, style: { display: "none" }, onChange: resimdenOku })),
      /* @__PURE__ */ React.createElement("button", { type: "button", style: S.btnO, onClick: kamerayiKapat }, "İptal")
    )
  );
}
function HizliAracFormu({ onClose, onEklendi, cariler: mevcutCariler }) {
  const [il, setIl] = useState("");
  const [harf, setHarf] = useState("");
  const [rakam, setRakam] = useState("");
  const [grup, setGrup] = useState("otomobil");
  const [marka, setMarka] = useState("");
  const [model, setModel] = useState("");
  const [musteriAdi, setMusteriAdi] = useState("");
  const [tel, setTel] = useState("");
  const [adres, setAdres] = useState("");
  const [hata, setHata] = useState("");
  const kaydet = () => {
    const plaka = plakaBirlestir(il, harf, rakam);
    if (!plaka.trim()) {
      setHata("Plaka zorunludur.");
      return;
    }
    const araclar = LS.get("araclar");
    const normalize = plakaNormalize(plaka);
    const cakisan = araclar.find((a) => plakaNormalize(a.plaka) === normalize);
    if (cakisan) {
      setHata(`Bu plaka zaten kay\u0131tl\u0131: ${cakisan.plaka}`);
      return;
    }
    setHata("");
    const cariler = LS.get("cariler");
    let tumCariler = cariler;
    let musteriId = "";
    if (musteriAdi.trim()) {
      const yeniCari = { id: uid(), ad: musteriAdi.trim(), tel: tel.trim(), adres: adres.trim() };
      tumCariler = [...cariler, yeniCari];
      LS.set("cariler", tumCariler);
      musteriId = yeniCari.id;
    }
    const yeniArac = { id: uid(), musteriId, plaka: normalize, grup, marka: marka.trim(), model: model.trim() };
    const tumAraclar = [...araclar, yeniArac];
    LS.set("araclar", tumAraclar);
    onEklendi(yeniArac, tumAraclar, tumCariler);
  };
  const canliPlaka = plakaBirlestir(il, harf, rakam);
  const canliPlakaCakisan = canliPlaka.trim() ? LS.get("araclar").find((a) => plakaNormalize(a.plaka) === plakaNormalize(canliPlaka)) : null;
  const kameraSonuc = (deger) => {
    const p = plakaParcala(deger);
    setIl(p.il);
    setHarf(p.harf);
    setRakam(p.rakam);
  };
  return /* @__PURE__ */ React.createElement(
    React.Fragment,
    null,
    /* @__PURE__ */ React.createElement(PlakaKameraTarayici, { onSonuc: kameraSonuc }),
    /* @__PURE__ */ React.createElement(FG, { label: "Plaka" }, /* @__PURE__ */ React.createElement(PlakaGirisi, { il, harf, rakam, onIl: setIl, onHarf: setHarf, onRakam: setRakam })),
    canliPlakaCakisan && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.red, marginTop: -8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, "⚠️ Bu plaka zaten kayıtlı: ", canliPlakaCakisan.plaka, /* @__PURE__ */ React.createElement("button", { type: "button", style: { ...S.btnO, padding: "3px 10px", fontSize: 11 }, onClick: () => onEklendi(canliPlakaCakisan, LS.get("araclar"), LS.get("cariler")) }, "Aracı Seç")),
    /* @__PURE__ */ React.createElement(MarkaModelSecici, { grup, marka, model, onGrup: (v) => { setGrup(v); setMarka(""); setModel(""); }, onMarka: setMarka, onModel: setModel }),
    /* @__PURE__ */ React.createElement("div", { style: { ...S.secTitle, fontSize: 13, marginTop: 4 } }, "\u{1F464} Ara\xE7 Sahibi"),
    /* @__PURE__ */ React.createElement(FG, { label: "M\u00FC\u015Fteri / Firma Ad\u0131 (opsiyonel)" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: musteriAdi, onChange: (e) => setMusteriAdi(e.target.value) })),
    /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: tel, onChange: (e) => setTel(e.target.value) })), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: adres, onChange: (e) => setAdres(e.target.value) }))),
    mevcutCariler && /* @__PURE__ */ React.createElement(BenzerCariUyarisi, { cariler: mevcutCariler, ad: musteriAdi, tel }),
    hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: onClose }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))
  );
}
function ElArabasi({ hedef, hedefTemizle } = {}) {
  const [cariler, setCariler] = useState(LS.get("cariler"));
  const [satislar, setSatislar] = useState(LS.get("satislar"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [hata, setHata] = useState("");
  const [yeniCariAcik, setYeniCariAcik] = useState(false);
  const [yeniCariForm, setYeniCariForm] = useState({});
  const [arama, setArama] = useState("");
  useEffect(() => {
    if (!hedef) return;
    if (hedef.tip === "yeni_satis") {
      setForm({ tarih: today(), kdvOrani: 0 });
      setHata("");
      setModalAcik(true);
    }
    hedefTemizle && hedefTemizle();
  }, [hedef]);

  const kaydet = () => {
    if (!form.musteriId) {
      setHata("Müşteri seçimi zorunludur.");
      return;
    }
    if (!form.tur) {
      setHata("El arabası türü seçimi zorunludur.");
      return;
    }
    if (!(+form.tutar > 0)) {
      setHata("Fiyat 0'dan büyük olmalıdır.");
      return;
    }
    setHata("");
    const kayit = { id: uid(), tarih: form.tarih || today(), musteriId: form.musteriId, tur: form.tur, aciklama: form.aciklama || "", toplam: +form.tutar, kdvOrani: +form.kdvOrani || 0, garantili: !!form.garantili, garantiBitis: form.garantili ? form.garantiBitis || "" : "" };
    const yeni = [...satislar, kayit];
    LS.set("satislar", yeni);
    setSatislar(yeni);
    faturaOlustur("el_arabasi", kayit.id, kayit.musteriId, kayit.tarih, kayit.aciklama || EL_ARABASI_TUR_LABEL[kayit.tur], [], kayit.toplam, kayit.kdvOrani);
    setModalAcik(false);
  };
  const sil = (id) => {
    if (!confirm("Bu satış kaydı silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)")) return;
    const silinen = satislar.find((x) => x.id === id);
    const yeni = satislar.filter((x) => x.id !== id);
    LS.set("satislar", yeni);
    setSatislar(yeni);
    if (silinen) coplendir("satislar", silinen);
  };
  const topluSil = (secilenler) => {
    if (secilenler.length === 0) return;
    if (!confirm(`${secilenler.length} kayıt silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)`)) return;
    const secilenIdler = new Set(secilenler.map((x) => x.id));
    secilenler.forEach((x) => coplendir("satislar", x));
    const yeni = satislar.filter((x) => !secilenIdler.has(x.id));
    LS.set("satislar", yeni);
    setSatislar(yeni);
  };
  const yeniCariKaydet = () => {
    if (!(yeniCariForm.ad || "").trim()) {
      alert("Müşteri / Firma adı zorunludur.");
      return;
    }
    const yeniCari = { id: uid(), ad: yeniCariForm.ad.trim(), tel: (yeniCariForm.tel || "").trim(), adres: (yeniCariForm.adres || "").trim() };
    const yeni = [...cariler, yeniCari];
    LS.set("cariler", yeni);
    setCariler(yeni);
    setForm((f) => ({ ...f, musteriId: yeniCari.id }));
    setYeniCariAcik(false);
    setYeniCariForm({});
  };
  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const filtreli = !aramaMetni ? satislar : satislar.filter((s) => (cariAd(cariler, s.musteriId) + " " + (EL_ARABASI_TUR_LABEL[s.tur] || "") + " " + (s.aciklama || "")).toLocaleLowerCase("tr-TR").includes(aramaMetni));
  const toplamCiro = satislar.reduce((t, s) => t + (+s.toplam || 0), 0);

  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "fp-fade" },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F6D2} El Arabası"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
      setForm({ tarih: today(), kdvOrani: 0 });
      setHata("");
      setModalAcik(true);
    } }, "➕ Yeni Satış")),
    /* @__PURE__ */ React.createElement(Grid4, null, /* @__PURE__ */ React.createElement(StatCard, { color: C.blue, icon: "\u{1F6D2}", value: satislar.length, label: "Toplam Satış" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.accent, icon: "\u{1F4B0}", value: fmtTL(toplamCiro), label: "Toplam Ciro" })),
    /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, marginBottom: 16, maxWidth: 360 }, placeholder: "\u{1F50D} Müşteri, tür veya açıklamada ara…", value: arama, onChange: (e) => setArama(e.target.value) }),
    /* @__PURE__ */ React.createElement(
      "div",
      { style: S.card },
      /* @__PURE__ */ React.createElement(SiraliTablo, {
        dosyaAdi: "el_arabasi_satislari",
        rowKey: (s) => s.id,
        bosMesaj: "Kayıt bulunamadı.",
        rows: [...filtreli].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")),
        columns: [
          { key: "tarih", baslik: "Tarih", sirala: (s) => s.tarih || "", render: (s) => fmtDate(s.tarih) },
          { key: "musteri", baslik: "Müşteri", sirala: (s) => cariAd(cariler, s.musteriId), render: (s) => cariAd(cariler, s.musteriId) },
          { key: "tur", baslik: "Tür", sirala: (s) => EL_ARABASI_TUR_LABEL[s.tur] || s.tur || "", render: (s) => EL_ARABASI_TUR_LABEL[s.tur] || s.tur },
          { key: "aciklama", baslik: "Açıklama", sirala: (s) => s.aciklama || "", render: (s) => s.aciklama || "—" },
          { key: "fiyat", baslik: "Fiyat", sirala: (s) => +s.toplam || 0, render: (s) => React.createElement("strong", { style: { color: C.accent } }, fmtTL(s.toplam)) },
          { key: "garanti", baslik: "Garanti", sirala: (s) => s.garantili && (!s.garantiBitis || s.garantiBitis >= today()) ? 1 : 0, render: (s) => {
            const garantiAktif = s.garantili && (!s.garantiBitis || s.garantiBitis >= today());
            return s.garantili ? React.createElement("span", { style: S.badge(garantiAktif ? C.green : C.muted) }, garantiAktif ? "🛡️ Garantide" : "Garanti bitti") : "—";
          } },
          { key: "islemler", baslik: "", render: (s) => React.createElement("div", { style: { display: "flex", gap: 6 } },
            React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "PDF indir", onClick: () => fisYazdir(EL_ARABASI_TUR_LABEL[s.tur] || "Satış Fişi", [{ aciklama: s.aciklama || EL_ARABASI_TUR_LABEL[s.tur], tutar: s.toplam }], s.toplam, cariAd(cariler, s.musteriId), s.kdvOrani) }, "📄"),
            React.createElement("button", { style: S.btnR, onClick: () => sil(s.id) }, "🗑️")
          ) }
        ],
        topluIslem: {
          onSil: topluSil,
          whatsapp: (s) => {
            const musteri = cariler.find((c) => c.id === s.musteriId);
            if (!musteri || !musteri.tel) return null;
            return { telefon: musteri.tel, mesaj: `Merhaba ${musteri.ad}, ${EL_ARABASI_TUR_LABEL[s.tur] || ""} satın alımınız i\xE7in teşekk\xFCr ederiz. — As Egzoz & Makine` };
          }
        }
      }),
    ),
    modalAcik && /* @__PURE__ */ React.createElement(
      Modal,
      { title: "➕ Yeni El Arabası Satışı", onClose: () => setModalAcik(false), width: 460 },
      /* @__PURE__ */ React.createElement(FG, { label: "Müşteri" }, /* @__PURE__ */ React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.musteriId || "", onChange: (e) => setForm((f) => ({ ...f, musteriId: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "— Seçiniz —"), cariler.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.ad))),
        /* @__PURE__ */ React.createElement("button", { type: "button", style: S.btnO, onClick: () => setYeniCariAcik(true) }, "➕")
      )),
      /* @__PURE__ */ React.createElement(FG, { label: "El Arabası Türü" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.tur || "", onChange: (e) => setForm((f) => ({ ...f, tur: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "— Seçiniz —"), Object.entries(EL_ARABASI_TUR_LABEL).map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l)))),
      /* @__PURE__ */ React.createElement(FG, { label: "Açıklama (opsiyonel)" }, /* @__PURE__ */ React.createElement("textarea", { style: { ...S.inp, minHeight: 60 }, value: form.aciklama || "", onChange: (e) => setForm((f) => ({ ...f, aciklama: e.target.value })) })),
      /* @__PURE__ */ React.createElement(Grid2, null,
        /* @__PURE__ */ React.createElement(FG, { label: "Fiyat (₺)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.tutar ?? "", onChange: (e) => setForm((f) => ({ ...f, tutar: +e.target.value })) })),
        /* @__PURE__ */ React.createElement(FG, { label: "KDV Oranı" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.kdvOrani ?? 0, onChange: (e) => setForm((f) => ({ ...f, kdvOrani: +e.target.value })) }, kdvOranlariGetir().map((o) => /* @__PURE__ */ React.createElement("option", { key: o, value: o }, "%", o))))
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 14px", background: C.surface, borderRadius: 8 } },
        /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!form.garantili, onChange: (e) => {
          const checked = e.target.checked;
          setForm((f) => ({ ...f, garantili: checked, garantiBitis: checked && !f.garantiBitis ? birYilSonra() : f.garantiBitis }));
        }, style: { width: 16, height: 16 } }),
        /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text } }, "\u{1F6E1}️ Bu satış garanti kapsamında")
      ),
      form.garantili && /* @__PURE__ */ React.createElement(FG, { label: "Garanti Bitiş Tarihi" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: S.inp, value: form.garantiBitis || "", onChange: (e) => setForm((f) => ({ ...f, garantiBitis: e.target.value })) })),
      hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "⚠️ ", hata),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "İptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))
    ),
    yeniCariAcik && /* @__PURE__ */ React.createElement(
      Modal,
      { title: "➕ Yeni Müşteri Ekle", onClose: () => setYeniCariAcik(false), width: 420 },
      /* @__PURE__ */ React.createElement(FG, { label: "Müşteri / Firma Adı" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: yeniCariForm.ad || "", onChange: (e) => setYeniCariForm((f) => ({ ...f, ad: e.target.value })), autoFocus: true })),
      /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: yeniCariForm.tel || "", onChange: (e) => setYeniCariForm((f) => ({ ...f, tel: e.target.value })) })),
      /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: yeniCariForm.adres || "", onChange: (e) => setYeniCariForm((f) => ({ ...f, adres: e.target.value })) })),
      /* @__PURE__ */ React.createElement(BenzerCariUyarisi, { cariler, ad: yeniCariForm.ad, tel: yeniCariForm.tel }),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setYeniCariAcik(false) }, "İptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: yeniCariKaydet }, "Kaydet"))
    )
  );
}
function Yapilacaklar() {
  const [liste, setListe] = useState(LS.get("yapilacaklar"));
  const [personelListesi] = useState(LS.get("personel"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [hata, setHata] = useState("");
  const [sekme, setSekme] = useState("acik");
  const acikGorevler = liste.filter((g) => !g.tamamlandi);
  const tamamlananGorevler = liste.filter((g) => g.tamamlandi);
  const oncelikSira = { yuksek: 0, orta: 1, dusuk: 2 };
  const siraliAcikGorevler = [...acikGorevler].sort((a, b) => {
    const fark = (oncelikSira[a.oncelik] ?? 1) - (oncelikSira[b.oncelik] ?? 1);
    if (fark !== 0) return fark;
    return (a.bitisTarihi || "9999").localeCompare(b.bitisTarihi || "9999");
  });
  const gosterilecek = sekme === "acik" ? siraliAcikGorevler : sekme === "tamamlanan" ? [...tamamlananGorevler].sort((a, b) => (b.tamamlanmaTarihi || "").localeCompare(a.tamamlanmaTarihi || "")) : [...liste].sort((a, b) => (b.olusturmaTarihi || "").localeCompare(a.olusturmaTarihi || ""));
  const kaydet = () => {
    if (!(form.baslik || "").trim()) {
      setHata("Görev başlığı zorunludur.");
      return;
    }
    setHata("");
    const yeniKayitMi = !form.id;
    const kayit = { ...form, id: form.id || uid(), oncelik: form.oncelik || "orta", olusturmaTarihi: form.olusturmaTarihi || today(), tamamlandi: !!form.tamamlandi };
    const yeni = form.id ? liste.map((x) => x.id === form.id ? kayit : x) : [...liste, kayit];
    LS.set("yapilacaklar", yeni);
    setListe(yeni);
    setModalAcik(false);
    if (yeniKayitMi && kayit.personelId) {
      const sorumlu = personelListesi.find((p) => p.id === kayit.personelId);
      if (sorumlu && sorumlu.telefon && confirm(`Bu g\xF6rev WhatsApp ile ${sorumlu.ad}'a g\xF6nderilsin mi?`)) {
        whatsappGorevGonder(kayit, sorumlu);
      }
    }
  };
  const sil = (id) => {
    if (!confirm("Bu görev silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)")) return;
    const silinen = liste.find((x) => x.id === id);
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("yapilacaklar", yeni);
    setListe(yeni);
    if (silinen) coplendir("yapilacaklar", silinen);
  };
  const tamamlandiToggle = (g) => {
    const yeni = liste.map((x) => x.id === g.id ? { ...x, tamamlandi: !x.tamamlandi, tamamlanmaTarihi: !x.tamamlandi ? today() : "" } : x);
    LS.set("yapilacaklar", yeni);
    setListe(yeni);
  };
  const gecikmisMi = (g) => !g.tamamlandi && g.bitisTarihi && g.bitisTarihi < today();
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "fp-fade" },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } },
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "✅ Yapılacaklar"),
      /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => { setForm({}); setHata(""); setModalAcik(true); } }, "➕ Yeni Görev")
    ),
    /* @__PURE__ */ React.createElement(TabBar, { tabs: [["acik", `\u{1F4CB} Açık (${acikGorevler.length})`], ["tamamlanan", `✅ Tamamlanan (${tamamlananGorevler.length})`], ["tumu", `Tümü (${liste.length})`]], active: sekme, onChange: setSekme }),
    gosterilecek.length === 0
      ? /* @__PURE__ */ React.createElement("div", { style: { ...S.card, textAlign: "center", padding: 32 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, marginBottom: 10 } }, "✅"), /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Görev bulunamadı."))
      : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, gosterilecek.map((g) => {
          const sorumlu = personelListesi.find((p) => p.id === g.personelId);
          return /* @__PURE__ */ React.createElement(
            "div",
            { key: g.id, style: { ...S.card, marginBottom: 0, borderLeft: `3px solid ${ONCELIK_RENK[g.oncelik] || C.border}`, opacity: g.tamamlandi ? 0.6 : 1 } },
            /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" } },
              /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-start", flex: 1, minWidth: 200 } },
                /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!g.tamamlandi, onChange: () => tamamlandiToggle(g), style: { width: 18, height: 18, marginTop: 2, cursor: "pointer", flexShrink: 0 } }),
                /* @__PURE__ */ React.createElement("div", null,
                  /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: C.white, textDecoration: g.tamamlandi ? "line-through" : "none" } }, g.baslik),
                  g.aciklama && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: C.muted, marginTop: 4 } }, g.aciklama),
                  /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 } },
                    /* @__PURE__ */ React.createElement("span", { style: S.badge(ONCELIK_RENK[g.oncelik] || C.muted) }, ONCELIK_LABEL[g.oncelik] || g.oncelik),
                    sorumlu && /* @__PURE__ */ React.createElement("span", { style: S.badge(C.blue) }, "\u{1F464} ", sorumlu.ad),
                    g.bitisTarihi && /* @__PURE__ */ React.createElement("span", { style: S.badge(gecikmisMi(g) ? C.red : C.muted) }, gecikmisMi(g) ? "⚠️ " : "\u{1F4C5} ", fmtDate(g.bitisTarihi))
                  )
                )
              ),
              /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexShrink: 0 } },
                sorumlu && sorumlu.telefon && /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "WhatsApp ile g\xF6nder", onClick: () => whatsappGorevGonder(g, sorumlu) }, /* @__PURE__ */ React.createElement(WhatsAppIkon, null)),
                /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => { setForm(g); setHata(""); setModalAcik(true); } }, "✏️"),
                /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => sil(g.id) }, "🗑️")
              )
            )
          );
        })),
    modalAcik && /* @__PURE__ */ React.createElement(
      Modal,
      { title: form.id ? "Görevi Düzenle" : "Yeni Görev", onClose: () => setModalAcik(false), width: 460 },
      /* @__PURE__ */ React.createElement(FG, { label: "Başlık" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.baslik || "", onChange: (e) => setForm((f) => ({ ...f, baslik: e.target.value })), autoFocus: true })),
      /* @__PURE__ */ React.createElement(FG, { label: "Açıklama (opsiyonel)" }, /* @__PURE__ */ React.createElement("textarea", { style: { ...S.inp, minHeight: 60 }, value: form.aciklama || "", onChange: (e) => setForm((f) => ({ ...f, aciklama: e.target.value })) })),
      /* @__PURE__ */ React.createElement(Grid2, null,
        /* @__PURE__ */ React.createElement(FG, { label: "Öncelik" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.oncelik || "orta", onChange: (e) => setForm((f) => ({ ...f, oncelik: e.target.value })) }, Object.entries(ONCELIK_LABEL).map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l)))),
        /* @__PURE__ */ React.createElement(FG, { label: "Bitiş Tarihi (opsiyonel)" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: S.inp, value: form.bitisTarihi || "", onChange: (e) => setForm((f) => ({ ...f, bitisTarihi: e.target.value })) }))
      ),
      /* @__PURE__ */ React.createElement(FG, { label: "Sorumlu Personel (opsiyonel)" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.personelId || "", onChange: (e) => setForm((f) => ({ ...f, personelId: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "— Seçiniz —"), personelListesi.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.ad)))),
      hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "⚠️ ", hata),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "İptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))
    )
  );
}
function Cariler({ hedef, hedefTemizle } = {}) {
  const [liste, setListe] = useState(LS.get("cariler"));
  const [servisler] = useState(LS.get("servisIsleri"));
  const [satislar] = useState(LS.get("satislar"));
  const [araclar] = useState(LS.get("araclar"));
  const [faturalar, setFaturalar] = useState(LS.get("faturalar"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [arama, setArama] = useState("");
  const [ekstreId, setEkstreId] = useState(null);
  const [karneId, setKarneId] = useState(null);
  const [karneSekme, setKarneSekme] = useState("genel");
  useEffect(() => {
    if (!hedef) return;
    if (hedef.tip === "yeni_cari") {
      setForm({});
      setModalAcik(true);
    } else if (hedef.tip === "ac_ekstre") {
      setEkstreId(hedef.id);
    }
    hedefTemizle && hedefTemizle();
  }, [hedef]);
  const cariAraclari = (id) => araclar.filter((a) => a.musteriId === id);
  const cariServisleri = (id) => servisler.filter((s) => s.musteriId === id).sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""));
  const cariPlakalar = (id) => {
    const setPlaka = /* @__PURE__ */ new Set();
    cariAraclari(id).forEach((a) => setPlaka.add(a.plaka));
    cariServisleri(id).forEach((s) => {
      if (s.aracId) {
        const a = araclar.find((x) => x.id === s.aracId);
        if (a) setPlaka.add(a.plaka);
      } else if (s.aracPlaka) {
        setPlaka.add(plakaNormalize(s.aracPlaka));
      }
    });
    return [...setPlaka];
  };
  const karneAc = (id, sekme = "genel") => {
    setKarneSekme(sekme);
    setKarneId(id);
  };
  const [faturaModal, setFaturaModal] = useState(null);
  const [faturaForm, setFaturaForm] = useState({});
  const [faturaHata, setFaturaHata] = useState("");
  const kaydet = () => {
    if (!(form.ad || "").trim()) {
      alert("M\xFC\u015Fteri ad\u0131 zorunludur.");
      return;
    }
    const kayit = { ...form, id: form.id || uid() };
    const yeni = form.id ? liste.map((x) => x.id === form.id ? kayit : x) : [...liste, kayit];
    LS.set("cariler", yeni);
    setListe(yeni);
    setModalAcik(false);
  };
  const sil = (id) => {
    if (servisler.some((s) => s.musteriId === id) || satislar.some((s) => s.musteriId === id) || faturalar.some((f) => f.musteriId === id)) {
      alert("Bu m\xFC\u015Fteriye ait kay\u0131tlar (i\u015F emri, sat\u0131\u015F veya fatura) var, \xF6nce onlar\u0131 d\xFCzenleyin/silin.");
      return;
    }
    if (!confirm("Bu cari silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)")) return;
    const silinen = liste.find((x) => x.id === id);
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("cariler", yeni);
    setListe(yeni);
    if (silinen) coplendir("cariler", silinen);
  };
  const topluSil = (secilenler) => {
    const engellenen = secilenler.filter((c) => servisler.some((s) => s.musteriId === c.id) || satislar.some((s) => s.musteriId === c.id) || faturalar.some((f) => f.musteriId === c.id));
    if (engellenen.length > 0) {
      alert(`${engellenen.length} cariye ait kayıtlar var, önce onları düzenleyin/silin. Diğerleri silinecek.`);
    }
    const silinebilenler = secilenler.filter((c) => !engellenen.includes(c));
    if (silinebilenler.length === 0) return;
    if (!confirm(`${silinebilenler.length} cari silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)`)) return;
    const silinebilenIdler = new Set(silinebilenler.map((x) => x.id));
    silinebilenler.forEach((x) => coplendir("cariler", x));
    const yeni = liste.filter((x) => !silinebilenIdler.has(x.id));
    LS.set("cariler", yeni);
    setListe(yeni);
  };
  const manuelFaturalar = (id) => faturalar.filter((f) => f.musteriId === id && (f.tur === "satis" || f.tur === "alis"));
  const faturaBulKaynak = (kaynakId) => faturalar.find((f) => f.kaynakId === kaynakId);
  const faturaOdenenTutar = (f) => (f.odemeler || []).reduce((t, o) => t + (+o.tutar || 0), 0);
  const faturaKalanTutar = (f) => Math.max(0, Math.round(((+f.toplam || 0) - faturaOdenenTutar(f)) * 100) / 100);
  const harcama = (id) => servisler.filter((s) => s.musteriId === id).reduce((t, s) => t + (+s.tutar || 0), 0) + satislar.filter((s) => s.musteriId === id).reduce((t, s) => t + (+s.toplam || 0), 0) + manuelFaturalar(id).filter((f) => f.tur === "satis").reduce((t, f) => t + (+f.toplam || 0), 0);
  const borc = (id) => servisler.filter((s) => s.musteriId === id).reduce((t, s) => t + servisKalanTutar(s), 0)
    + satislar.filter((s) => s.musteriId === id).reduce((t, s) => { const f = faturaBulKaynak(s.id); return t + (f ? faturaKalanTutar(f) : 0); }, 0)
    + manuelFaturalar(id).filter((f) => f.tur === "satis").reduce((t, f) => t + faturaKalanTutar(f), 0);
  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const filtreliListe = !aramaMetni ? liste : liste.filter((c) => (c.ad + " " + (c.tel || "") + " " + (c.adres || "")).toLocaleLowerCase("tr-TR").includes(aramaMetni));
  const ekstreCari = ekstreId && liste.find((c) => c.id === ekstreId);
  const ekstreHareketleriGetir = (id) => id ? [
    ...servisler.filter((s) => s.musteriId === id).map((s) => ({ tarih: s.tarih, aciklama: `\u{1F527} ${HIZMET_TIP_LABEL[s.hizmetTuru] || ""}`, tutar: s.tutar, odendi: servisOdemeDurumu(s) === "odendi", kismi: servisOdemeDurumu(s) === "kismi", yontem: s.odemeYontemi || "\u2014" })),
    ...satislar.filter((s) => s.musteriId === id).map((s) => { const f = faturaBulKaynak(s.id); const kalan = f ? faturaKalanTutar(f) : 0; const odenen = f ? faturaOdenenTutar(f) : 0; return { tarih: s.tarih, aciklama: `\u{1F6D2} ${EL_ARABASI_TUR_LABEL[s.tur] || ""}`, tutar: s.toplam, odendi: kalan <= 0, kismi: kalan > 0 && odenen > 0, yontem: f && f.odemeler && f.odemeler.length > 0 ? f.odemeler[f.odemeler.length - 1].yontem || "\u2014" : "\u2014" }; }),
    ...manuelFaturalar(id).map((f) => { const kalan = f.tur === "alis" ? 0 : faturaKalanTutar(f); const odenen = faturaOdenenTutar(f); return { tarih: f.tarih, aciklama: `${f.tur === "alis" ? "\u{1F4E5} Al\u0131\u015F" : "\u{1F4E4} Sat\u0131\u015F"} \u2014 ${f.aciklama || f.faturaNo}`, tutar: f.tur === "alis" ? -f.toplam : f.toplam, odendi: kalan <= 0, kismi: kalan > 0 && odenen > 0, yontem: (f.odemeler && f.odemeler.length > 0) ? f.odemeler[f.odemeler.length - 1].yontem || "\u2014" : "\u2014" }; })
  ].sort((a, b) => (a.tarih || "").localeCompare(b.tarih || "")).map((h, i) => ({ ...h, id: i })) : [];
  const ekstreHareketleri = ekstreHareketleriGetir(ekstreId);
  const faturaOlusturKaydet = () => {
    if (!(+faturaForm.tutar > 0)) {
      setFaturaHata("Tutar 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    setFaturaHata("");
    const yon = faturaForm.yon || "satis";
    faturaOlustur(yon, uid(), faturaModal.id, faturaForm.tarih || today(), faturaForm.aciklama || (yon === "alis" ? "Al\u0131\u015F" : "Sat\u0131\u015F"), [], +faturaForm.tutar, faturaForm.kdvOrani);
    setFaturalar(LS.get("faturalar"));
    setFaturaModal(null);
    setFaturaForm({});
  };
  const cariIceAktar = (kayitlar) => {
    const yeni = [...liste, ...kayitlar.map((k) => ({ ...k, id: uid() }))];
    LS.set("cariler", yeni);
    setListe(yeni);
    alert(`${kayitlar.length} cari eklendi.`);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F465} Cariler"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(IceAktarButonu, { alanlar: [{ baslik: "Ad", key: "ad", zorunlu: true }, { baslik: "Telefon", key: "tel" }, { baslik: "Adres", key: "adres" }], onIceAktar: cariIceAktar }), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setForm({});
    setModalAcik(true);
  } }, "\u2795 Yeni Cari"))), /* @__PURE__ */ React.createElement(Grid4, null,
    /* @__PURE__ */ React.createElement(StatCard, { color: C.accent, icon: "\u{1F465}", value: liste.length, label: "Toplam Cari" }),
    /* @__PURE__ */ React.createElement(StatCard, { color: C.red, icon: "⚠️", value: fmtTL(liste.reduce((t, c) => t + borc(c.id), 0)), label: "Toplam A\xE7\u0131k Bor\xE7", sub: `${liste.filter((c) => borc(c.id) > 0).length} cari bor\xE7lu` }),
    
    /* @__PURE__ */ React.createElement(StatCard, { color: C.blue, icon: "\u{1F697}", value: araclar.length, label: "Kayıtlı Ara\xE7 Sayısı" })
  ), /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, marginBottom: 16, maxWidth: 360 }, placeholder: "\u{1F50D} \u0130sim, telefon veya adreste ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }), liste.length === 0 ? React.createElement("div", { style: { ...S.card, textAlign: "center", padding: 32 } }, React.createElement("div", { style: { fontSize: 32, marginBottom: 10 } }, "\u{1F465}"), React.createElement("div", { style: { color: C.white, fontWeight: 700, marginBottom: 6 } }, "Hen\u00fcz cari eklenmedi"), React.createElement("div", { style: { color: C.muted, fontSize: 12.5, marginBottom: 14 } }, "\u0130lk m\u00fc\u015fterinizi veya tedarik\u00e7inizi ekleyerek ba\u015flay\u0131n."), React.createElement("button", { style: S.btn(), onClick: () => { setForm({}); setModalAcik(true); } }, "\u2795 Yeni Cari Ekle")) : React.createElement("div", { style: S.card }, React.createElement(SiraliTablo, {
    dosyaAdi: "cariler",
    rowKey: (c) => c.id,
    bosMesaj: "Kayıt bulunamadı.",
    rows: filtreliListe,
    columns: [
      { key: "ad", baslik: "Müşteri / Firma", sirala: (c) => c.ad || "", render: (c) => {
        const plakalar = cariPlakalar(c.id);
        const risk = cariRiskDurumu(c.id, servisler);
        return React.createElement("div", null,
          React.createElement("span", { style: { cursor: "pointer" }, title: "Cari karnesini g\xF6r\xFCnt\xFCle", onClick: () => karneAc(c.id) }, React.createElement("strong", { style: { color: C.accent, textDecoration: "underline" } }, c.ad), plakalar.length > 0 && React.createElement("span", { style: { color: C.muted, fontSize: 11.5 } }, " — ", plakalar.join(", "))),
          risk && React.createElement("div", { title: risk.aciklama, style: { fontSize: 10.5, color: risk.renk, marginTop: 2 } }, risk.etiket)
        );
      } },
      { key: "tel", baslik: "Telefon", sirala: (c) => c.tel || "", render: (c) => c.tel || "—" },
      { key: "adres", baslik: "Adres", sirala: (c) => c.adres || "", render: (c) => c.adres || "—" },
      { key: "harcama", baslik: "Toplam İşlem", sirala: (c) => harcama(c.id), render: (c) => React.createElement("strong", { style: { color: C.accent } }, fmtTL(harcama(c.id))) },
      { key: "borc", baslik: "Açık Borç", sirala: (c) => borc(c.id), render: (c) => { const acikBorc = borc(c.id); return acikBorc > 0 ? React.createElement("strong", { style: { color: C.red } }, fmtTL(acikBorc)) : "—"; } },
      { key: "islemler", baslik: "", render: (c) => React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
        React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => setEkstreId(c.id) }, "\u{1F4CB} Ekstre"),
        React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => { setFaturaForm({ tarih: today(), yon: "satis", kdvOrani: 0 }); setFaturaHata(""); setFaturaModal(c); } }, "\u{1F9FE} Fatura"),
        React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => { setForm(c); setModalAcik(true); } }, "✏️"),
        React.createElement("button", { style: S.btnR, onClick: () => sil(c.id) }, "\u{1F5D1}️")
      ) }
    ],
    topluIslem: {
      onSil: topluSil,
      whatsapp: (c) => c.tel ? { telefon: c.tel, mesaj: `Merhaba ${c.ad}, size ulaşmak istedik. — As Egzoz & Makine` } : null
    }
  })), modalAcik && /* @__PURE__ */ React.createElement(Modal, { title: form.id ? "Cariyi D\xFCzenle" : "Yeni Cari", onClose: () => setModalAcik(false), width: 420 }, /* @__PURE__ */ React.createElement(FG, { label: "M\xFC\u015Fteri / Firma Ad\u0131" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.ad || "", onChange: (e) => setForm((f) => ({ ...f, ad: e.target.value })), autoFocus: true })), /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.tel || "", onChange: (e) => setForm((f) => ({ ...f, tel: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.adres || "", onChange: (e) => setForm((f) => ({ ...f, adres: e.target.value })) })), /* @__PURE__ */ React.createElement(BenzerCariUyarisi, { cariler: liste, ad: form.ad, tel: form.tel, haricId: form.id }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))), ekstreCari && /* @__PURE__ */ React.createElement(Modal, { title: `\u{1F4CB} ${ekstreCari.ad} \u2014 Cari Hesap Ekstresi`, onClose: () => setEkstreId(null), width: 640 }, /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement("div", { style: { ...S.card, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted } }, "Toplam \u0130\u015Flem Hacmi"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, fmtTL(harcama(ekstreCari.id)))), /* @__PURE__ */ React.createElement("div", { style: { ...S.card, marginBottom: 14, borderTop: `3px solid ${C.red}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted } }, "A\xE7\u0131k Bor\xE7"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.red } }, fmtTL(borc(ekstreCari.id))))), ekstreHareketleri.length === 0 ? React.createElement("div", { style: { color: C.muted } }, "Henüz işlem yok.") : React.createElement(SiraliTablo, {
    dosyaAdi: "cari_ekstre",
    rowKey: (h) => h.id,
    rows: ekstreHareketleri,
    columns: [
      { key: "tarih", baslik: "Tarih", sirala: (h) => h.tarih || "", render: (h) => fmtDate(h.tarih) },
      { key: "aciklama", baslik: "Açıklama", sirala: (h) => h.aciklama || "", render: (h) => h.aciklama },
      { key: "yontem", baslik: "Yöntem", sirala: (h) => h.yontem || "", render: (h) => h.yontem || "—" },
      { key: "tutar", baslik: "Tutar", sirala: (h) => +h.tutar || 0, render: (h) => React.createElement("strong", { style: { color: h.tutar < 0 ? C.red : C.accent } }, fmtTL(h.tutar)) },
      { key: "durum", baslik: "Durum", sirala: (h) => h.odendi ? 1 : h.kismi ? 0.5 : 0, render: (h) => h.kismi ? React.createElement(Badge, { d: "kismi", map: SERVIS_ODEME_LABEL, renk: SERVIS_ODEME_RENK }) : h.odendi ? React.createElement(Badge, { d: "odendi", map: SERVIS_ODEME_LABEL, renk: SERVIS_ODEME_RENK }) : React.createElement(Badge, { d: "odenmedi", map: SERVIS_ODEME_LABEL, renk: SERVIS_ODEME_RENK }) }
    ]
  })), faturaModal && /* @__PURE__ */ React.createElement(
    Modal,
    { title: `\u{1F9FE} ${faturaModal.ad} — Fatura Oluştur`, onClose: () => setFaturaModal(null), width: 420 },
    /* @__PURE__ */ React.createElement(
      "div",
      { style: { display: "flex", gap: 8, marginBottom: 14 } },
      /* @__PURE__ */ React.createElement("button", { type: "button", style: (faturaForm.yon || "satis") === "satis" ? S.btn() : S.btnO, onClick: () => setFaturaForm((f) => ({ ...f, yon: "satis" })) }, "\u{1F4E4} Satış Faturası"),
      /* @__PURE__ */ React.createElement("button", { type: "button", style: faturaForm.yon === "alis" ? S.btn() : S.btnO, onClick: () => setFaturaForm((f) => ({ ...f, yon: "alis" })) }, "\u{1F4E5} Alış Faturası")
    ),
    /* @__PURE__ */ React.createElement(FG, { label: "Tarih" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: S.inp, value: faturaForm.tarih || "", onChange: (e) => setFaturaForm((f) => ({ ...f, tarih: e.target.value })) })),
    /* @__PURE__ */ React.createElement(FG, { label: "Açıklama" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: faturaForm.aciklama || "", onChange: (e) => setFaturaForm((f) => ({ ...f, aciklama: e.target.value })) })),
    /* @__PURE__ */ React.createElement(FG, { label: "Tutar (₺)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: faturaForm.tutar ?? "", onChange: (e) => setFaturaForm((f) => ({ ...f, tutar: +e.target.value })) })),
    /* @__PURE__ */ React.createElement(FG, { label: "KDV Oranı" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: faturaForm.kdvOrani ?? "", onChange: (e) => setFaturaForm((f) => ({ ...f, kdvOrani: +e.target.value })) }, kdvOranlariGetir().map((o) => /* @__PURE__ */ React.createElement("option", { key: o, value: o }, "%", o)))),
    faturaHata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "⚠️ ", faturaHata),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setFaturaModal(null) }, "İptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: faturaOlusturKaydet }, "Kaydet"))
  ), karneId && (() => {
    const karneCari = liste.find((c) => c.id === karneId);
    if (!karneCari) return null;
    const karneAraclari = cariAraclari(karneId);
    const karneServisleri = cariServisleri(karneId);
    const karneEkstre = ekstreHareketleriGetir(karneId);
    return React.createElement(
      Modal,
      { title: `📋 ${karneCari.ad} — Cari Karnesi`, onClose: () => setKarneId(null), width: 720 },
      React.createElement(TabBar, { tabs: [["genel", "👤 Genel"], ["araclar", `🚗 Araçlar (${karneAraclari.length})`], ["servis", `🔧 Servis Geçmişi (${karneServisleri.length})`], ["ekstre", "📋 Ekstre"]], active: karneSekme, onChange: setKarneSekme }),
      karneSekme === "genel" && React.createElement(
        Grid2,
        null,
        React.createElement(
          "div",
          { style: { ...S.card, marginBottom: 14 } },
          React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 6 } }, "Bilgiler"),
          React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: C.white } }, karneCari.ad),
          React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: 4 } }, karneCari.tel || "Telefon yok"),
          React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: 2 } }, karneCari.adres || "Adres yok")
        ),
        React.createElement(
          "div",
          { style: { ...S.card, marginBottom: 14 } },
          React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 6 } }, "Özet"),
          React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, fmtTL(harcama(karneId))),
          React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: 2 } }, "toplam işlem"),
          borc(karneId) > 0 && React.createElement("div", { style: { fontSize: 13, color: C.red, marginTop: 6 } }, "Açık borç: ", fmtTL(borc(karneId)))
        )
      ),
      karneSekme === "araclar" && (karneAraclari.length === 0 ? React.createElement("div", { style: { color: C.muted } }, "Bu cariye bağlı araç kaydı yok.") : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, karneAraclari.map((a) => React.createElement(
        "div",
        { key: a.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderRadius: 8 } },
        React.createElement("span", { style: { fontSize: 13, color: C.text } }, React.createElement("strong", { style: { color: C.white } }, a.plaka), " — ", a.marka, " ", a.model),
        React.createElement("span", { style: { fontSize: 11, color: C.muted } }, karneServisleri.filter((s) => s.aracId === a.id).length, " servis")
      )))),
      karneSekme === "servis" && (karneServisleri.length === 0 ? React.createElement("div", { style: { color: C.muted } }, "Servis kaydı yok.") : React.createElement(SiraliTablo, {
        dosyaAdi: "cari_servis_gecmisi",
        rowKey: (s) => s.id,
        rows: karneServisleri,
        columns: [
          { key: "tarih", baslik: "Tarih", sirala: (s) => s.tarih || "", render: (s) => fmtDate(s.tarih) },
          { key: "arac", baslik: "Araç", sirala: (s) => s.aracPlaka || "", render: (s) => { const a = araclar.find((x) => x.id === s.aracId); return a ? a.plaka : s.aracPlaka || "—"; } },
          { key: "hizmet", baslik: "Hizmet", sirala: (s) => HIZMET_TIP_LABEL[s.hizmetTuru] || "", render: (s) => HIZMET_TIP_LABEL[s.hizmetTuru] },
          { key: "tutar", baslik: "Tutar", sirala: (s) => +s.tutar || 0, render: (s) => fmtTL(s.tutar) },
          { key: "odeme", baslik: "Ödeme Durumu", sirala: (s) => servisOdemeDurumu(s), render: (s) => {
            const durum = servisOdemeDurumu(s);
            return React.createElement("div", null,
              React.createElement(Badge, { d: durum, map: SERVIS_ODEME_LABEL, renk: SERVIS_ODEME_RENK }),
              durum === "kismi" && React.createElement("div", { style: { fontSize: 10.5, color: C.muted, marginTop: 2 } }, "Kalan: ", fmtTL(servisKalanTutar(s)))
            );
          } }
        ]
      })),
      karneSekme === "ekstre" && (karneEkstre.length === 0 ? React.createElement("div", { style: { color: C.muted } }, "Henüz işlem yok.") : React.createElement(SiraliTablo, {
        dosyaAdi: "cari_ekstre",
        rowKey: (h) => h.id,
        rows: karneEkstre,
        columns: [
          { key: "tarih", baslik: "Tarih", sirala: (h) => h.tarih || "", render: (h) => fmtDate(h.tarih) },
          { key: "aciklama", baslik: "Açıklama", sirala: (h) => h.aciklama || "", render: (h) => h.aciklama },
          { key: "yontem", baslik: "Yöntem", sirala: (h) => h.yontem || "", render: (h) => h.yontem || "—" },
          { key: "tutar", baslik: "Tutar", sirala: (h) => +h.tutar || 0, render: (h) => React.createElement("strong", { style: { color: h.tutar < 0 ? C.red : C.accent } }, fmtTL(h.tutar)) },
          { key: "durum", baslik: "Durum", sirala: (h) => h.odendi ? 1 : h.kismi ? 0.5 : 0, render: (h) => h.kismi ? React.createElement(Badge, { d: "kismi", map: SERVIS_ODEME_LABEL, renk: SERVIS_ODEME_RENK }) : h.odendi ? React.createElement(Badge, { d: "odendi", map: SERVIS_ODEME_LABEL, renk: SERVIS_ODEME_RENK }) : React.createElement(Badge, { d: "odenmedi", map: SERVIS_ODEME_LABEL, renk: SERVIS_ODEME_RENK }) }
        ]
      }))
    );
  })());
}
function Muhasebe() {
  const [servisler, setServisler] = useState(LS.get("servisIsleri"));
  const [satislar] = useState(LS.get("satislar"));
  const [faturalar, setFaturalar] = useState(LS.get("faturalar"));
  const [faturaModal, setFaturaModal] = useState(false);
  const [faturaForm, setFaturaForm] = useState({});
  const [hesaplar, setHesaplar] = useState(LS.get("hesaplar"));
  const [hareketler, setHareketler] = useState(LS.get("kasaHareketleri"));
  const [giderler, setGiderler] = useState(LS.get("giderler"));
  const [cariler] = useState(LS.get("cariler"));
  const [sekme, setSekme] = useState("faturalar");
  const [arama, setArama] = useState("");
  const [giderModal, setGiderModal] = useState(false);
  const [giderForm, setGiderForm] = useState({});
  const [fisOkunuyor, setFisOkunuyor] = useState(false);
  const [fisHata, setFisHata] = useState("");
  const fisOku = async (e) => {
    const dosya = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!dosya) return;
    setFisOkunuyor(true);
    setFisHata("");
    try {
      const veriUrl = await dosyaOku(dosya);
      const [basPart, base64] = veriUrl.split(",");
      const mimeType = (basPart.match(/data:(.*);base64/) || [, "image/jpeg"])[1];
      const prompt = `Bu bir gider makbuzu/fiş fotoğrafı. İ\xE7indeki bilgileri \xE7ıkar ve SADECE şu JSON formatında cevap ver, başka hi\xE7bir metin yazma:
{"tarih":"YYYY-MM-DD","tutar":sayı,"kategori":"<şunlardan biri: ${GIDER_KATEGORILERI.join(", ")}>","aciklama":"kısa a\xE7ıklama (\xF6rn. satıcı adı)"}
Tarihi okuyamazsan bug\xFCn\xFCn tarihini (${today()}) kullan. Kategori tam eşleşmiyorsa en yakınını se\xE7.`;
      const cevap = await aiSorGorsel(prompt, base64, mimeType);
      const veri = aiJsonAyikla(cevap);
      if (!veri || !(+veri.tutar > 0)) {
        setFisHata("Fişten tutar okunamadı, l\xFCtfen elle girin.");
        return;
      }
      setGiderForm((f) => ({ ...f, tarih: veri.tarih || f.tarih || today(), tutar: +veri.tutar, kategori: GIDER_KATEGORILERI.includes(veri.kategori) ? veri.kategori : f.kategori, aciklama: veri.aciklama || f.aciklama || "" }));
    } catch (err) {
      setFisHata(err.message);
    } finally {
      setFisOkunuyor(false);
    }
  };
  const [hesapModal, setHesapModal] = useState(false);
  const [hesapForm, setHesapForm] = useState({});
  const [hareketModal, setHareketModal] = useState(false);
  const [hareketForm, setHareketForm] = useState({});
  const [transferModal, setTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({});
  const [topluHatirlatIndex, setTopluHatirlatIndex] = useState(null);
  const [detayHesapId, setDetayHesapId] = useState(null);
  const [hata, setHata] = useState("");
  const [odemeAlModal, setOdemeAlModal] = useState(null);
  const [odemeAlForm, setOdemeAlForm] = useState({});
  const [odemeHata, setOdemeHata] = useState("");
  const [yeniFaturaModal, setYeniFaturaModal] = useState(false);
  const [yeniFaturaForm, setYeniFaturaForm] = useState({});
  const [yeniFaturaHata, setYeniFaturaHata] = useState("");
  const [raporDonemi, setRaporDonemi] = useState(30);
  const [raporMetni, setRaporMetni] = useState("");
  const [raporYukleniyor, setRaporYukleniyor] = useState(false);
  const [raporHata, setRaporHata] = useState("");
  const raporOzetHesapla = (gunSayisi) => {
    const bugun = today();
    const baslangicTarih = /* @__PURE__ */ new Date();
    baslangicTarih.setDate(baslangicTarih.getDate() - gunSayisi);
    const baslangic = baslangicTarih.toISOString().slice(0, 10);
    const donemServisler = servisler.filter((s) => s.tarih >= baslangic && s.tarih <= bugun && s.durum !== "iptal");
    const donemSatislar = satislar.filter((s) => s.tarih >= baslangic && s.tarih <= bugun);
    const donemGiderler = giderler.filter((g) => g.tarih >= baslangic && g.tarih <= bugun);
    const servisGeliri = donemServisler.reduce((t, s) => t + (+s.tutar || 0), 0);
    const satisGeliri = donemSatislar.reduce((t, s) => t + (+s.toplam || 0), 0);
    const toplamGelir = servisGeliri + satisGeliri;
    const toplamGider = donemGiderler.reduce((t, g) => t + (+g.tutar || 0), 0);
    const netKar = toplamGelir - toplamGider;
    const hizmetDagilimi = {};
    donemServisler.forEach((s) => {
      const l = HIZMET_TIP_LABEL[s.hizmetTuru] || s.hizmetTuru;
      hizmetDagilimi[l] = (hizmetDagilimi[l] || 0) + (+s.tutar || 0);
    });
    const giderKategoriDagilimi = {};
    donemGiderler.forEach((g) => {
      giderKategoriDagilimi[g.kategori] = (giderKategoriDagilimi[g.kategori] || 0) + (+g.tutar || 0);
    });
    const acikBorclular = cariler.map((c) => ({ ad: c.ad, borc: servisler.filter((s) => s.musteriId === c.id).reduce((t, s) => t + servisKalanTutar(s), 0) })).filter((c) => c.borc > 0).sort((a, b) => b.borc - a.borc).slice(0, 5);
    const musteriCirosu = {};
    [...donemServisler.map((s) => ({ id: s.musteriId, tutar: +s.tutar || 0 })), ...donemSatislar.map((s) => ({ id: s.musteriId, tutar: +s.toplam || 0 }))].forEach(({ id, tutar }) => {
      if (!id) return;
      musteriCirosu[id] = (musteriCirosu[id] || 0) + tutar;
    });
    const enIyiMusteriler = Object.entries(musteriCirosu).map(([id, tutar]) => ({ ad: cariAd(cariler, id), tutar })).sort((a, b) => b.tutar - a.tutar).slice(0, 5);
    const toplamHesapBakiye = hesaplar.reduce((t, h) => t + (+h.bakiye || 0), 0);
    const oncekiBaslangicTarih = /* @__PURE__ */ new Date(baslangicTarih);
    oncekiBaslangicTarih.setDate(oncekiBaslangicTarih.getDate() - gunSayisi);
    const oncekiBaslangic = oncekiBaslangicTarih.toISOString().slice(0, 10);
    const oncekiBitis = baslangic;
    const oncekiServisler = servisler.filter((s) => s.tarih >= oncekiBaslangic && s.tarih < oncekiBitis && s.durum !== "iptal");
    const oncekiSatislar = satislar.filter((s) => s.tarih >= oncekiBaslangic && s.tarih < oncekiBitis);
    const oncekiGiderler = giderler.filter((g) => g.tarih >= oncekiBaslangic && g.tarih < oncekiBitis);
    const oncekiGelir = oncekiServisler.reduce((t, s) => t + (+s.tutar || 0), 0) + oncekiSatislar.reduce((t, s) => t + (+s.toplam || 0), 0);
    const oncekiGider = oncekiGiderler.reduce((t, g) => t + (+g.tutar || 0), 0);
    const oncekiNetKar = oncekiGelir - oncekiGider;
    const degisimYuzde = (yeni, eski) => eski === 0 ? (yeni === 0 ? 0 : 100) : Math.round((yeni - eski) / Math.abs(eski) * 1e3) / 10;
    const gelirDegisim = degisimYuzde(toplamGelir, oncekiGelir);
    const giderDegisim = degisimYuzde(toplamGider, oncekiGider);
    const netKarDegisim = degisimYuzde(netKar, oncekiNetKar);
    const oncekiGiderKategoriDagilimi = {};
    oncekiGiderler.forEach((g) => {
      oncekiGiderKategoriDagilimi[g.kategori] = (oncekiGiderKategoriDagilimi[g.kategori] || 0) + (+g.tutar || 0);
    });
    const anomaliler = Object.entries(giderKategoriDagilimi).map(([kategori, tutar]) => {
      const oncekiTutar = oncekiGiderKategoriDagilimi[kategori] || 0;
      const yuzde = degisimYuzde(tutar, oncekiTutar);
      return { kategori, tutar, oncekiTutar, yuzde };
    }).filter((a) => a.yuzde >= 50 && a.tutar >= 200).sort((a, b) => b.yuzde - a.yuzde);
    const bucketSayisi = gunSayisi <= 14 ? gunSayisi : gunSayisi <= 60 ? Math.ceil(gunSayisi / 7) : 12;
    const bucketGunSayisi = Math.ceil(gunSayisi / bucketSayisi);
    const trendVerisi = [];
    for (let i = bucketSayisi - 1; i >= 0; i--) {
      const bBitisTarih = /* @__PURE__ */ new Date();
      bBitisTarih.setDate(bBitisTarih.getDate() - i * bucketGunSayisi);
      const bBaslangicTarih = /* @__PURE__ */ new Date(bBitisTarih);
      bBaslangicTarih.setDate(bBaslangicTarih.getDate() - bucketGunSayisi);
      const bBitis = bBitisTarih.toISOString().slice(0, 10);
      const bBaslangic = bBaslangicTarih.toISOString().slice(0, 10);
      const bGelir = servisler.filter((s) => s.tarih >= bBaslangic && s.tarih < bBitis && s.durum !== "iptal").reduce((t, s) => t + (+s.tutar || 0), 0) + satislar.filter((s) => s.tarih >= bBaslangic && s.tarih < bBitis).reduce((t, s) => t + (+s.toplam || 0), 0);
      const bGider = giderler.filter((g) => g.tarih >= bBaslangic && g.tarih < bBitis).reduce((t, g) => t + (+g.tutar || 0), 0);
      trendVerisi.push({ etiket: bucketGunSayisi <= 1 ? fmtDate(bBitis) : `${fmtDate(bBaslangic)}—${fmtDate(bBitis)}`, gelir: bGelir, gider: bGider });
    }
    return { baslangic, bugun, donemServisler, donemSatislar, donemGiderler, servisGeliri, satisGeliri, toplamGelir, toplamGider, netKar, hizmetDagilimi, giderKategoriDagilimi, acikBorclular, enIyiMusteriler, toplamHesapBakiye, oncekiGelir, oncekiGider, oncekiNetKar, gelirDegisim, giderDegisim, netKarDegisim, trendVerisi, anomaliler };
  };
  const raporOlustur = async () => {
    setRaporYukleniyor(true);
    setRaporHata("");
    setRaporMetni("");
    try {
      const o = raporOzetHesapla(raporDonemi);
      const veri = `D\xF6nem: son ${raporDonemi} g\xFCn (${o.baslangic} — ${o.bugun}).
Toplam Gelir: ${fmtTL(o.toplamGelir)} (Servis: ${fmtTL(o.servisGeliri)}, El Arabası: ${fmtTL(o.satisGeliri)}).
Toplam Gider: ${fmtTL(o.toplamGider)}.
Net K\xE2r/Zarar: ${fmtTL(o.netKar)}.
Hizmet T\xFCr\xFCne G\xF6re Gelir Dağılımı: ${Object.entries(o.hizmetDagilimi).map(([k, v]) => `${k}: ${fmtTL(v)}`).join(", ") || "veri yok"}.
Gider Kategorisine G\xF6re Dağılım: ${Object.entries(o.giderKategoriDagilimi).map(([k, v]) => `${k}: ${fmtTL(v)}`).join(", ") || "veri yok"}.
En \xC7ok Bor\xE7lu M\xFCşteriler: ${o.acikBorclular.map((c) => `${c.ad} (${fmtTL(c.borc)})`).join(", ") || "yok"}.
Toplam Kasa/Banka Bakiyesi: ${fmtTL(o.toplamHesapBakiye)}.
İş Sayısı: ${o.donemServisler.length} servis işi, ${o.donemSatislar.length} el arabası satışı.`;
      const prompt = `Sen bir oto egzoz/chiptuning/el arabası \xFCretim at\xF6lyesi i\xE7in mali analiz yapan bir muhasebe danışmanısın. Aşağıdaki verilere dayanarak T\xFCrk\xE7e, başlıklarla d\xFCzenlenmiş bir mali analiz raporu yaz: genel durum \xF6zeti, dikkat \xE7eken noktalar, riskler (\xF6rn. y\xFCksek bor\xE7, artan gider), ve somut 2-3 \xF6neri. Uydurma sayı kullanma, sadece verilen verileri yorumla, kısa ve net yaz.

Veri:
${veri}`;
      const cevap = await aiSor(prompt);
      setRaporMetni(cevap || "Rapor oluşturulamadı.");
    } catch (e) {
      setRaporHata(e.message);
    } finally {
      setRaporYukleniyor(false);
    }
  };
  const raporPdfIndir = () => {
    const o = raporOzetHesapla(raporDonemi);
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;padding:30px;color:#111;max-width:680px;">
      <h2 style="margin:0 0 4px;">📊 Mali Analiz Raporu</h2>
      <div style="color:#666;font-size:13px;margin-bottom:16px;">${fmtDate(o.baslangic)} — ${fmtDate(o.bugun)}</div>
      <div style="font-size:13px;line-height:1.8;margin-bottom:16px;">
        <strong>Toplam Gelir:</strong> ${fmtTL(o.toplamGelir)}<br/>
        <strong>Toplam Gider:</strong> ${fmtTL(o.toplamGider)}<br/>
        <strong>Net Kâr/Zarar:</strong> ${fmtTL(o.netKar)}<br/>
        <strong>Toplam Bakiye:</strong> ${fmtTL(o.toplamHesapBakiye)}
      </div>
      <div style="white-space:pre-wrap;font-size:13px;line-height:1.7;border-top:1px solid #ddd;padding-top:14px;">${(raporMetni || "").replace(/</g, "&lt;")}</div>
    </div>`;
    htmlBelgeIndir(html, `mali-analiz-raporu-${today()}.pdf`);
  };
  const yeniFaturaKaydet = () => {
    if (!yeniFaturaForm.musteriId) {
      setYeniFaturaHata("M\xFCşteri se\xE7imi zorunludur.");
      return;
    }
    if (!(+yeniFaturaForm.tutar > 0)) {
      setYeniFaturaHata("Tutar 0'dan b\xFCy\xFCk olmalıdır.");
      return;
    }
    setYeniFaturaHata("");
    const yon = yeniFaturaForm.yon || "satis";
    faturaOlustur(yon, uid(), yeniFaturaForm.musteriId, yeniFaturaForm.tarih || today(), yeniFaturaForm.aciklama || (yon === "alis" ? "Alış" : "Satış"), [], +yeniFaturaForm.tutar, yeniFaturaForm.kdvOrani);
    setFaturalar(LS.get("faturalar"));
    setYeniFaturaModal(false);
    setYeniFaturaForm({});
  };

  const faturaOdenen = (f) => (f.odemeler || []).reduce((t, o) => t + (+o.tutar || 0), 0);
  const faturaKalan = (f) => {
    if (f.tur === "servis") {
      const s = servisler.find((x) => x.id === f.kaynakId);
      return s ? servisKalanTutar(s) : Math.max(0, Math.round(((+f.toplam || 0) - faturaOdenen(f)) * 100) / 100);
    }
    return Math.max(0, Math.round(((+f.toplam || 0) - faturaOdenen(f)) * 100) / 100);
  };
  const faturaDurumu = (f) => {
    if (f.tur === "servis") {
      const s = servisler.find((x) => x.id === f.kaynakId);
      return s ? servisOdemeDurumu(s) : "bekliyor";
    }
    const odenen = faturaOdenen(f);
    if (odenen <= 0) return "bekliyor";
    if (faturaKalan(f) <= 0) return "odendi";
    return "kismi";
  };
  const manuelSatisToplam = faturalar.filter((f) => f.tur === "satis").reduce((t, f) => t + (+f.toplam || 0), 0);
  const manuelAlisToplam = faturalar.filter((f) => f.tur === "alis").reduce((t, f) => t + (+f.toplam || 0), 0);
  const toplamGelir = [...servisler.map((s) => +s.tutar || 0), ...satislar.map((s) => +s.toplam || 0)].reduce((t, v) => t + v, 0) + manuelSatisToplam;
  const toplamGider = giderler.reduce((t, g) => t + (+g.tutar || 0), 0) + manuelAlisToplam;
  const netKar = toplamGelir - toplamGider;
  const odemeAlKaydet = () => {
    if (!odemeAlForm.hesapId) {
      setOdemeHata("Hesap se\xE7imi zorunludur.");
      return;
    }
    const kalan = faturaKalan(odemeAlModal);
    if (!(+odemeAlForm.tutar > 0) || +odemeAlForm.tutar > kalan) {
      setOdemeHata(`Tutar 0'dan b\xFCy\xFCk ve kalan (${fmtTL(kalan)}) tutarından fazla olamaz.`);
      return;
    }
    setOdemeHata("");
    const f = odemeAlModal;
    const tutar = +odemeAlForm.tutar;
    const yon = f.tur === "alis" ? "cikis" : "giris";
    const yontem = odemeAlForm.yontem || "Nakit";
    hesapHareketiKaydet(odemeAlForm.hesapId, yon, tutar, today(), `${f.tur === "alis" ? "Tedarik\xE7i \xF6demesi" : "Tahsilat"} — ${f.faturaNo} (${cariAd(cariler, f.musteriId)})`, f.tur === "servis" ? "servis" : "fatura", yontem);
    if (f.tur === "servis") {
      const s = servisler.find((x) => x.id === f.kaynakId);
      if (s) {
        const yeniOdemeler = [...(s.odemeler || []), { id: uid(), tarih: today(), tutar, yontem, hesapId: odemeAlForm.hesapId }];
        const tamOdendi = servisKalanTutar({ ...s, odemeler: yeniOdemeler }) <= 0;
        const yeniServisler = servisler.map((x) => x.id === s.id ? { ...x, odemeler: yeniOdemeler, odendi: tamOdendi } : x);
        LS.set("servisIsleri", yeniServisler);
        setServisler(yeniServisler);
      }
    } else {
      const odeme = { id: uid(), tarih: today(), tutar, hesapId: odemeAlForm.hesapId, yontem };
      const yeni = faturalar.map((x) => x.id === f.id ? { ...x, odemeler: [...(x.odemeler || []), odeme] } : x);
      LS.set("faturalar", yeni);
      setFaturalar(yeni);
    }
    setHesaplar(LS.get("hesaplar"));
    setOdemeAlModal(null);
    setOdemeAlForm({});
  };
  const tahsilEdilecek = servisler.filter((s) => !s.odendi && s.durum === "tamamlandi").reduce((t, s) => t + servisKalanTutar(s), 0);
  const toplamBakiye = hesaplar.reduce((t, h) => t + (+h.bakiye || 0), 0);

  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const filtreliFaturalar = !aramaMetni ? faturalar : faturalar.filter((f) => (f.faturaNo + " " + cariAd(cariler, f.musteriId) + " " + (f.aciklama || "")).toLocaleLowerCase("tr-TR").includes(aramaMetni));

  const giderKaydet = () => {
    if (!(giderForm.kategori || "").trim()) {
      setHata("Kategori se\xE7imi zorunludur.");
      return;
    }
    if (!(+giderForm.tutar > 0)) {
      setHata("Tutar 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    setHata("");
    const kayit = { ...giderForm, id: giderForm.id || uid(), tarih: giderForm.tarih || today() };
    const yeni = giderForm.id ? giderler.map((x) => x.id === giderForm.id ? kayit : x) : [...giderler, kayit];
    LS.set("giderler", yeni);
    setGiderler(yeni);
    setGiderModal(false);
    if (!giderForm.id && giderForm.hesapId) {
      hesapHareketiKaydet(giderForm.hesapId, "cikis", kayit.tutar, kayit.tarih, `${kayit.kategori}${kayit.aciklama ? " \u2014 " + kayit.aciklama : ""}`, "gider", giderForm.yontem || "Nakit");
      setHesaplar(LS.get("hesaplar"));
    }
  };
  const giderSil = (id) => {
    if (!confirm("Bu gider kayd\u0131 silinsin mi? (\u00c7\u00f6p kutusundan geri y\u00fckleyebilirsiniz)")) return;
    const silinen = giderler.find((x) => x.id === id);
    const yeni = giderler.filter((x) => x.id !== id);
    LS.set("giderler", yeni);
    setGiderler(yeni);
    if (silinen) coplendir("giderler", silinen);
  };
  const giderTopluSil = (secilenler) => {
    if (secilenler.length === 0) return;
    if (!confirm(`${secilenler.length} gider kayd\u0131 silinsin mi? (\u00c7\u00f6p kutusundan geri y\u00fckleyebilirsiniz)`)) return;
    const secilenIdler = new Set(secilenler.map((x) => x.id));
    secilenler.forEach((x) => coplendir("giderler", x));
    const yeni = giderler.filter((x) => !secilenIdler.has(x.id));
    LS.set("giderler", yeni);
    setGiderler(yeni);
  };
  const giderIceAktar = (kayitlar) => {
    const yeni = [...giderler, ...kayitlar.map((k) => ({ id: uid(), tarih: k.tarih || today(), kategori: k.kategori || GIDER_KATEGORILERI[0], aciklama: k.aciklama || "", tutar: +k.tutar || 0 }))];
    LS.set("giderler", yeni);
    setGiderler(yeni);
    alert(`${kayitlar.length} gider eklendi.`);
  };

  const hesapKaydet = () => {
    if (!(hesapForm.ad || "").trim()) {
      setHata("Hesap ad\u0131 zorunludur.");
      return;
    }
    setHata("");
    const kayit = { ...hesapForm, id: hesapForm.id || uid(), bakiye: hesapForm.bakiye || 0, tur: hesapForm.tur || "kasa" };
    const yeni = hesapForm.id ? hesaplar.map((x) => x.id === hesapForm.id ? kayit : x) : [...hesaplar, kayit];
    LS.set("hesaplar", yeni);
    setHesaplar(yeni);
    setHesapModal(false);
  };
  const hesapSil = (id) => {
    if (hareketler.some((h) => h.hesapId === id)) {
      alert("Bu hesaba ait i\u015Flem ge\xE7mi\u015Fi var, \xF6nce hareketleri kontrol edin.");
      return;
    }
    if (!confirm("Bu hesap silinsin mi?")) return;
    const yeni = hesaplar.filter((x) => x.id !== id);
    LS.set("hesaplar", yeni);
    setHesaplar(yeni);
  };
  const hesapIceAktar = (kayitlar) => {
    const yeni = [...hesaplar, ...kayitlar.map((k) => ({ id: uid(), ad: k.ad, tur: k.tur || "kasa", bakiye: +k.bakiye || 0 }))];
    LS.set("hesaplar", yeni);
    setHesaplar(yeni);
    alert(`${kayitlar.length} hesap eklendi.`);
  };
  const hareketKaydet = () => {
    if (!hareketForm.hesapId) {
      setHata("Hesap se\xE7imi zorunludur.");
      return;
    }
    if (!(+hareketForm.tutar > 0)) {
      setHata("Tutar 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    setHata("");
    const yon = hareketForm.yon || "giris";
    const kayit = { id: uid(), hesapId: hareketForm.hesapId, tur: yon, tutar: +hareketForm.tutar, tarih: hareketForm.tarih || today(), aciklama: hareketForm.aciklama || "", kaynak: "manuel", yontem: hareketForm.yontem || "Nakit" };
    const yeniHareketler = [...hareketler, kayit];
    LS.set("kasaHareketleri", yeniHareketler);
    setHareketler(yeniHareketler);
    const yeniHesaplar = hesaplar.map((h) => h.id === hareketForm.hesapId ? { ...h, bakiye: (+h.bakiye || 0) + (yon === "giris" ? +hareketForm.tutar : -hareketForm.tutar) } : h);
    LS.set("hesaplar", yeniHesaplar);
    setHesaplar(yeniHesaplar);
    setHareketModal(false);
    setHareketForm({});
  };
  const transferKaydet = () => {
    if (!transferForm.kaynakId || !transferForm.hedefId) {
      setHata("Kaynak ve hedef hesap se\xE7imi zorunludur.");
      return;
    }
    if (transferForm.kaynakId === transferForm.hedefId) {
      setHata("Kaynak ve hedef hesap ayn\u0131 olamaz.");
      return;
    }
    if (!(+transferForm.tutar > 0)) {
      setHata("Tutar 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    setHata("");
    const kaynak = hesaplar.find((h) => h.id === transferForm.kaynakId);
    const hedef = hesaplar.find((h) => h.id === transferForm.hedefId);
    const tarih = transferForm.tarih || today();
    hesapHareketiKaydet(transferForm.kaynakId, "cikis", +transferForm.tutar, tarih, `Transfer \u2192 ${hedef ? hedef.ad : ""}${transferForm.aciklama ? " \u2014 " + transferForm.aciklama : ""}`, "transfer", "Havale/EFT");
    hesapHareketiKaydet(transferForm.hedefId, "giris", +transferForm.tutar, tarih, `Transfer \u2190 ${kaynak ? kaynak.ad : ""}${transferForm.aciklama ? " \u2014 " + transferForm.aciklama : ""}`, "transfer", "Havale/EFT");
    setHesaplar(LS.get("hesaplar"));
    setHareketler(LS.get("kasaHareketleri"));
    setTransferModal(false);
    setTransferForm({});
  };
  const faturaDuzenle = (f) => {
    const kalemler = f.kalemler && f.kalemler.length > 0 ? f.kalemler.map((k) => ({ ...k, id: k.id || uid() })) : [{ id: uid(), ad: f.aciklama || "", adet: 1, birimFiyat: f.toplam, tutar: f.toplam }];
    setFaturaForm({ ...f, kalemler });
    setHata("");
    setFaturaModal(true);
  };
  const faturaKalemGuncelle = (kalemId, patch) => {
    setFaturaForm((f) => ({ ...f, kalemler: f.kalemler.map((k) => {
      if (k.id !== kalemId) return k;
      const yeni = { ...k, ...patch };
      yeni.tutar = (+yeni.adet || 0) * (+yeni.birimFiyat || 0);
      return yeni;
    }) }));
  };
  const faturaKalemEkle = () => {
    setFaturaForm((f) => ({ ...f, kalemler: [...(f.kalemler || []), { id: uid(), ad: "", adet: 1, birimFiyat: 0, tutar: 0 }] }));
  };
  const faturaKalemSil = (kalemId) => {
    setFaturaForm((f) => ({ ...f, kalemler: f.kalemler.filter((k) => k.id !== kalemId) }));
  };
  const faturaKaydet = () => {
    if (!(faturaForm.kalemler || []).length) {
      setHata("En az bir kalem olmalıdır.");
      return;
    }
    setHata("");
    const toplam = Math.round(faturaForm.kalemler.reduce((t, k) => t + (+k.tutar || 0), 0) * 100) / 100;
    const kdvOrani = +faturaForm.kdvOrani || 0;
    const kdvTutari = Math.round(toplam * kdvOrani / (100 + kdvOrani) * 100) / 100;
    const araToplam = Math.round((toplam - kdvTutari) * 100) / 100;
    const kayit = { ...faturaForm, toplam, araToplam, kdvTutari };
    const yeni = faturalar.map((x) => x.id === kayit.id ? kayit : x);
    LS.set("faturalar", yeni);
    setFaturalar(yeni);
    setFaturaModal(false);
  };
  const faturaSil = (id) => {
    if (!confirm("Bu fatura silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)")) return;
    const silinen = faturalar.find((x) => x.id === id);
    const yeni = faturalar.filter((x) => x.id !== id);
    LS.set("faturalar", yeni);
    setFaturalar(yeni);
    if (silinen) coplendir("faturalar", silinen);
  };
  const faturaTopluSil = (secilenler) => {
    if (secilenler.length === 0) return;
    if (!confirm(`${secilenler.length} fatura silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)`)) return;
    const secilenIdler = new Set(secilenler.map((x) => x.id));
    secilenler.forEach((x) => coplendir("faturalar", x));
    const yeni = faturalar.filter((x) => !secilenIdler.has(x.id));
    LS.set("faturalar", yeni);
    setFaturalar(yeni);
  };

  const odenmemisServisler = servisler.filter((s) => !s.odendi && s.durum === "tamamlandi");
  const hatirlatilabilenServisler = odenmemisServisler.filter((s) => { const m = cariler.find((c) => c.id === s.musteriId); return m && m.tel; });
  const topluHatirlatBaslat = () => {
    if (hatirlatilabilenServisler.length === 0) {
      alert("Telefon numarası kayıtlı müşteri bulunamadı.");
      return;
    }
    setTopluHatirlatIndex(0);
    whatsappTahsilatHatirlat(hatirlatilabilenServisler[0], cariler);
  };
  const topluHatirlatSonraki = () => {
    const sonraki = topluHatirlatIndex + 1;
    if (sonraki >= hatirlatilabilenServisler.length) {
      setTopluHatirlatIndex(null);
      return;
    }
    setTopluHatirlatIndex(sonraki);
    whatsappTahsilatHatirlat(hatirlatilabilenServisler[sonraki], cariler);
  };

  const detayHareketler = detayHesapId ? hareketler.filter((h) => h.hesapId === detayHesapId).sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")) : [];
  const detayHesap = detayHesapId && hesaplar.find((h) => h.id === detayHesapId);

  return React.createElement(
    "div",
    { className: "fp-fade" },
    React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 4 } }, "\u{1F4B0} Muhasebe"),
    React.createElement("div", { style: { fontSize: 13, color: C.muted, marginBottom: 16 } }, "Faturalar, gelir/gider ve kasa/banka hesaplar\u0131 tek yerde."),
    React.createElement(
      Grid4,
      null,
      React.createElement(StatCard, { color: C.green, icon: "\u{1F4B0}", value: fmtTL(toplamGelir), label: "Toplam Gelir" }),
      React.createElement(StatCard, { color: C.red, icon: "\u{1F4C9}", value: fmtTL(toplamGider), label: "Toplam Gider" }),
      React.createElement(StatCard, { color: netKar >= 0 ? C.accent : C.red, icon: "\u{1F4CA}", value: fmtTL(netKar), label: "Net K\xE2r/Zarar" }),
      React.createElement(StatCard, { color: C.blue, icon: "\u23F3", value: fmtTL(tahsilEdilecek), label: "Tahsil Edilecek" }),
      React.createElement(StatCard, { color: C.accent, icon: "\u{1F3E6}", value: fmtTL(toplamBakiye), label: "Toplam Bakiye (T\xFCm Hesaplar)" }),
    ),
    React.createElement(TabBar, { tabs: [["faturalar", `\u{1F9FE} Faturalar (${faturalar.length})`], ["giderler", `\u{1F4C9} Giderler (${giderler.length})`], ["hesaplar", "\u{1F3E6} Hesaplar"], ["raporlar", "\u{1F4CA} Raporlar"]], active: sekme, onChange: setSekme }),

    sekme === "faturalar" && odenmemisServisler.length > 0 && React.createElement(
      "div",
      { style: { ...S.card, borderTop: `3px solid ${C.red}` } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 } },
        React.createElement("div", { style: S.secTitle }, "\u23F0 Tahsilat Hat\u0131rlatmalar\u0131 (", odenmemisServisler.length, ")"),
        hatirlatilabilenServisler.length > 0 && topluHatirlatIndex === null && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }, onClick: topluHatirlatBaslat }, React.createElement(WhatsAppIkon, null), "T\xFCm\xFCne Hat\u0131rlat (", hatirlatilabilenServisler.length, ")")
      ),
      React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 12 } }, "Tamamlanm\u0131\u015F ama \xF6demesi al\u0131nmam\u0131\u015F i\u015Fler. M\xFC\u015Fteriye WhatsApp ile hat\u0131rlatma g\xF6nderebilirsiniz."),
      topluHatirlatIndex !== null && React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "8px 14px", background: C.accent + "18", borderRadius: 8, marginBottom: 12 } },
        React.createElement("span", { style: { fontSize: 12, color: C.text } }, "WhatsApp sekmesi a\xE7\u0131ld\u0131 (", topluHatirlatIndex + 1, "/", hatirlatilabilenServisler.length, ") \u2014 g\xF6nderdikten sonra buraya d\xF6n\xFCp devam edin."),
        React.createElement("div", { style: { display: "flex", gap: 8 } },
          React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: topluHatirlatSonraki }, "Sonraki \u25B6"),
          React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => setTopluHatirlatIndex(null) }, "Durdur")
        )
      ),
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, odenmemisServisler.map((s) => React.createElement(
        "div",
        { key: s.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: C.surface, borderRadius: 8, flexWrap: "wrap", gap: 8 } },
        React.createElement("span", { style: { fontSize: 12.5, color: C.text } }, React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, s.musteriId)), " \u2014 ", s.isEmriNo || "", " \u2014 ", React.createElement("strong", { style: { color: C.red } }, fmtTL(servisKalanTutar(s))), servisOdemeDurumu(s) === "kismi" && React.createElement("span", { style: { ...S.badge(C.yellow), marginLeft: 6, fontSize: 10 } }, "K\u0131smi \u00d6dendi")),
        React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }, onClick: () => whatsappTahsilatHatirlat(s, cariler) }, React.createElement(WhatsAppIkon, null), "Hat\u0131rlat")
      )))
    ),

    sekme === "faturalar" && React.createElement(
      "div",
      { style: S.card },
      React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" } },
        React.createElement("input", { style: { ...S.inp, flex: 1, minWidth: 200 }, placeholder: "\u{1F50D} Fatura no, m\xFC\u015Fteri veya a\xE7\u0131klamada ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }),
        React.createElement("button", { style: S.btn(), onClick: () => { setYeniFaturaForm({ tarih: today(), yon: "satis", kdvOrani: 0 }); setYeniFaturaHata(""); setYeniFaturaModal(true); } }, "\u2795 Yeni Fatura")
      ),
      React.createElement(SiraliTablo, {
        dosyaAdi: "faturalar",
        rowKey: (f) => f.id,
        bosMesaj: "Henüz fatura yok. Bir servis işi \"Teslim Edildi\" aşamasına geçtiğinde veya bir ürün satıldığında otomatik oluşur.",
        rows: [...filtreliFaturalar].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")),
        columns: [
          { key: "no", baslik: "Fatura No", sirala: (f) => f.faturaNo || "", render: (f) => React.createElement("strong", { style: { color: C.accent } }, f.faturaNo) },
          { key: "tur", baslik: "Tür", sirala: (f) => FATURA_TUR_LABEL[f.tur] || f.tur || "", render: (f) => React.createElement("span", { style: S.badge(f.tur === "alis" ? C.red : C.blue) }, FATURA_TUR_LABEL[f.tur] || f.tur) },
          { key: "tarih", baslik: "Tarih", sirala: (f) => f.tarih || "", render: (f) => fmtDate(f.tarih) },
          { key: "musteri", baslik: "Müşteri", sirala: (f) => cariAd(cariler, f.musteriId), render: (f) => React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, f.musteriId)) },
          { key: "aciklama", baslik: "Açıklama", sirala: (f) => f.aciklama || "", render: (f) => f.aciklama },
          { key: "araToplam", baslik: "Ara Toplam", sirala: (f) => +f.araToplam || 0, render: (f) => fmtTL(f.araToplam) },
          { key: "kdv", baslik: "KDV", sirala: (f) => +f.kdvTutari || 0, render: (f) => fmtTL(f.kdvTutari) },
          { key: "toplam", baslik: "Toplam", sirala: (f) => +f.toplam || 0, render: (f) => React.createElement("strong", { style: { color: f.tur === "alis" ? C.red : C.accent } }, f.tur === "alis" ? "−" : "", fmtTL(f.toplam)) },
          { key: "odeme", baslik: "Ödeme", sirala: (f) => faturaDurumu(f) || "", render: (f) => {
            const durum = faturaDurumu(f);
            if (durum === "odendi") return React.createElement(Badge, { d: "tamamlandi", map: { tamamlandi: "Ödendi" }, renk: { tamamlandi: C.green } });
            if (durum === "kismi") return React.createElement("div", null, React.createElement(Badge, { d: "devam", map: { devam: "Kısmi" }, renk: { devam: C.blue } }), React.createElement("div", { style: { fontSize: 10.5, color: C.muted, marginTop: 2 } }, "Kalan: ", fmtTL(faturaKalan(f))));
            return React.createElement(Badge, { d: "bekliyor", map: { bekliyor: "Bekliyor" }, renk: { bekliyor: C.yellow } });
          } },
          { key: "islemler", baslik: "", render: (f) => React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
            faturaKalan(f) > 0 && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => { setOdemeAlForm({ tutar: faturaKalan(f), hesapId: hesaplar[0] ? hesaplar[0].id : "" }); setOdemeHata(""); setOdemeAlModal(f); } }, f.tur === "alis" ? "💰 Ödeme Yap" : "💰 Ödeme Al"),
            React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => faturaYazdir(f, cariAd(cariler, f.musteriId)) }, "📄 PDF"),
            React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => faturaDuzenle(f) }, "✏️"),
            React.createElement("button", { style: S.btnR, onClick: () => faturaSil(f.id) }, "🗑️")
          ) }
        ],
        topluIslem: { onSil: faturaTopluSil }
      })
    ),

    sekme === "giderler" && React.createElement(
      "div",
      null,
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap", marginBottom: 14 } }, React.createElement(IceAktarButonu, { alanlar: [{ baslik: "Tarih", key: "tarih" }, { baslik: "Kategori", key: "kategori" }, { baslik: "A\u00e7\u0131klama", key: "aciklama" }, { baslik: "Tutar", key: "tutar", zorunlu: true }], onIceAktar: giderIceAktar }), React.createElement("button", { style: S.btn(), onClick: () => { setGiderForm({ tarih: today(), kategori: GIDER_KATEGORILERI[0] }); setHata(""); setFisHata(""); setGiderModal(true); } }, "\u2796 Yeni Gider Ekle")),
      React.createElement(
        "div",
        { style: S.card },
        React.createElement(SiraliTablo, {
          dosyaAdi: "giderler",
          rowKey: (g) => g.id,
          bosMesaj: "Henüz gider kaydı yok.",
          rows: [...giderler].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")),
          columns: [
            { key: "tarih", baslik: "Tarih", sirala: (g) => g.tarih || "", render: (g) => fmtDate(g.tarih) },
            { key: "kategori", baslik: "Kategori", sirala: (g) => g.kategori || "", render: (g) => React.createElement(Badge, { d: g.kategori, map: Object.fromEntries(GIDER_KATEGORILERI.map((k) => [k, k])), renk: Object.fromEntries(GIDER_KATEGORILERI.map((k) => [k, C.steel])) }) },
            { key: "aciklama", baslik: "Açıklama", sirala: (g) => g.aciklama || "", render: (g) => g.aciklama || "—" },
            { key: "tutar", baslik: "Tutar", sirala: (g) => +g.tutar || 0, render: (g) => React.createElement("strong", { style: { color: C.red } }, "-", fmtTL(g.tutar)) },
            { key: "islemler", baslik: "", render: (g) => React.createElement("div", { style: { display: "flex", gap: 6 } }, React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => { setGiderForm(g); setHata(""); setGiderModal(true); } }, "✏️"), React.createElement("button", { style: S.btnR, onClick: () => giderSil(g.id) }, "🗑️")) }
          ],
          topluIslem: { onSil: giderTopluSil }
        })
      )
    ),

    sekme === "hesaplar" && React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 14 } },
        React.createElement(IceAktarButonu, { alanlar: [{ baslik: "Ad", key: "ad", zorunlu: true }, { baslik: "T\u00fcr", key: "tur" }, { baslik: "Bakiye", key: "bakiye" }], onIceAktar: hesapIceAktar }),
        React.createElement("button", { style: S.btnO, onClick: () => { setHesapForm({ tur: "kasa" }); setHata(""); setHesapModal(true); } }, "\u2795 Yeni Hesap"),
        React.createElement("button", { style: S.btn(), onClick: () => { setHareketForm({ tarih: today(), yon: "giris" }); setHata(""); setHareketModal(true); } }, "\u{1F4B5} Yeni \u0130\u015Flem"),
        hesaplar.length >= 2 && React.createElement("button", { style: S.btnO, onClick: () => { setTransferForm({ tarih: today(), kaynakId: hesaplar[0].id, hedefId: hesaplar[1].id }); setHata(""); setTransferModal(true); } }, "\u{1F504} Transfer")
      ),
      React.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 } },
        hesaplar.length === 0 && React.createElement("div", { style: { color: C.muted } }, "Hen\xFCz hesap eklenmedi."),
        hesaplar.map((h) => React.createElement(
          "div",
          { key: h.id, style: S.card },
          React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 4 } }, HESAP_TUR_LABEL[h.tur] || h.tur),
          React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 8 } }, h.ad),
          React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: (+h.bakiye || 0) >= 0 ? C.green : C.red, marginBottom: 12 } }, fmtTL(h.bakiye)),
          React.createElement(
            "div",
            { style: { display: "flex", gap: 8 } },
            React.createElement("button", { style: { ...S.btnO, flex: 1 }, onClick: () => setDetayHesapId(h.id) }, "\u{1F4CB} Hareketler"),
            React.createElement("button", { style: { ...S.btnO, padding: "7px 10px" }, onClick: () => { setHesapForm(h); setHata(""); setHesapModal(true); } }, "\u270F\uFE0F"),
            React.createElement("button", { style: S.btnR, onClick: () => hesapSil(h.id) }, "\u{1F5D1}\uFE0F")
          )
        ))
      )
    ),
    sekme === "raporlar" && (() => {
      const o = raporOzetHesapla(raporDonemi);
      const renkler = [C.accent, C.blue, C.green, C.yellow, C.red, C.steel];
      const hizmetDagilimiArr = Object.entries(o.hizmetDagilimi).map(([name, value]) => ({ name, value }));
      const giderDagilimiArr = Object.entries(o.giderKategoriDagilimi).map(([name, value]) => ({ name, value }));
      const DegisimEtiketi = ({ deger }) => React.createElement("span", { style: { fontSize: 11.5, fontWeight: 700, color: deger > 0 ? C.green : deger < 0 ? C.red : C.muted } }, deger > 0 ? "▲" : deger < 0 ? "▼" : "—", " ", Math.abs(deger), "% \xF6nceki d\xF6neme g\xF6re");
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 } },
          React.createElement("select", { style: { ...S.sel, width: "auto" }, value: raporDonemi, onChange: (e) => setRaporDonemi(+e.target.value) },
            React.createElement("option", { value: 7 }, "Son 7 g\xFCn"),
            React.createElement("option", { value: 30 }, "Son 30 g\xFCn"),
            React.createElement("option", { value: 90 }, "Son 90 g\xFCn"),
            React.createElement("option", { value: 365 }, "Son 12 ay")
          )
        ),
        React.createElement(Grid4, null,
          React.createElement(StatCard, { color: C.green, icon: "\u{1F4B0}", value: fmtTL(o.toplamGelir), label: "D\xF6nem Geliri", sub: React.createElement(DegisimEtiketi, { deger: o.gelirDegisim }) }),
          React.createElement(StatCard, { color: C.red, icon: "\u{1F4C9}", value: fmtTL(o.toplamGider), label: "D\xF6nem Gideri", sub: React.createElement(DegisimEtiketi, { deger: o.giderDegisim }) }),
          React.createElement(StatCard, { color: o.netKar >= 0 ? C.green : C.red, icon: "\u{1F4C8}", value: fmtTL(o.netKar), label: "D\xF6nem Net K\xE2r/Zarar", sub: React.createElement(DegisimEtiketi, { deger: o.netKarDegisim }) }),
          React.createElement(StatCard, { color: C.blue, icon: "\u{1F527}", value: o.donemServisler.length + o.donemSatislar.length, label: "Toplam İşlem Sayısı" })
        ),
        React.createElement(
          "div",
          { style: { ...S.card, marginTop: 14 } },
          React.createElement("div", { style: S.secTitle }, "\u{1F4C8} Gelir/Gider Trendi"),
          RC.BarChart ? React.createElement(ResponsiveContainer, { width: "100%", height: 240 }, React.createElement(
            BarChart,
            { data: o.trendVerisi },
            React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: C.border }),
            React.createElement(XAxis, { dataKey: "etiket", tick: { fill: C.muted, fontSize: 10 } }),
            React.createElement(YAxis, { tick: { fill: C.muted, fontSize: 10 } }),
            React.createElement(Tooltip, { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }, formatter: (v) => fmtTL(v) }),
            React.createElement(Bar, { dataKey: "gelir", name: "Gelir", fill: C.green, radius: [4, 4, 0, 0] }),
            React.createElement(Bar, { dataKey: "gider", name: "Gider", fill: C.red, radius: [4, 4, 0, 0] })
          )) : React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Grafik k\xFCt\xFCphanesi y\xFCklenemedi.")
        ),
        o.anomaliler.length > 0 && React.createElement(
          "div",
          { style: { ...S.card, borderTop: `3px solid ${C.yellow}` } },
          React.createElement("div", { style: S.secTitle }, "🚨 Dikkat \xC7eken Değişimler"),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, o.anomaliler.map((a, i) => React.createElement("div", { key: i, style: { fontSize: 12.5, color: C.text } }, "⚠️ ", React.createElement("strong", null, a.kategori), " gideri \xF6nceki d\xF6neme g\xF6re %", a.yuzde, " arttı (", fmtTL(a.oncekiTutar), " → ", fmtTL(a.tutar), ")")))
        ),
        React.createElement(Grid2, null,
          React.createElement("div", { style: S.card },
            React.createElement("div", { style: S.secTitle }, "\u{1F527} Hizmet T\xFCr\xFCne G\xF6re Gelir"),
            RC.PieChart && hizmetDagilimiArr.length > 0 ? React.createElement(ResponsiveContainer, { width: "100%", height: 220 }, React.createElement(PieChart, null, React.createElement(Pie, { data: hizmetDagilimiArr, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 78, paddingAngle: 3, label: ({ name, value }) => `${name}: ${fmtTL(value)}` }, hizmetDagilimiArr.map((e, i) => React.createElement(Cell, { key: i, fill: renkler[i % renkler.length] }))), React.createElement(Tooltip, { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }, formatter: (v) => fmtTL(v) }))) : React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Bu d\xF6nemde veri yok.")
          ),
          React.createElement("div", { style: S.card },
            React.createElement("div", { style: S.secTitle }, "\u{1F4C9} Gider Kategorisine G\xF6re Dağılım"),
            RC.PieChart && giderDagilimiArr.length > 0 ? React.createElement(ResponsiveContainer, { width: "100%", height: 220 }, React.createElement(PieChart, null, React.createElement(Pie, { data: giderDagilimiArr, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 78, paddingAngle: 3, label: ({ name, value }) => `${name}: ${fmtTL(value)}` }, giderDagilimiArr.map((e, i) => React.createElement(Cell, { key: i, fill: renkler[i % renkler.length] }))), React.createElement(Tooltip, { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }, formatter: (v) => fmtTL(v) }))) : React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Bu d\xF6nemde veri yok.")
          )
        ),
        React.createElement(Grid2, null,
          React.createElement("div", { style: S.card },
            React.createElement("div", { style: S.secTitle }, "\u{1F3C6} En \xC7ok Ciro Getiren M\xFCşteriler"),
            o.enIyiMusteriler.length === 0 ? React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Bu d\xF6nemde veri yok.") : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, o.enIyiMusteriler.map((m, i) => React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.text } }, React.createElement("span", null, m.ad), React.createElement("strong", { style: { color: C.accent } }, fmtTL(m.tutar)))))
          ),
          React.createElement("div", { style: S.card },
            React.createElement("div", { style: S.secTitle }, "⚠️ En \xC7ok Bor\xE7lu M\xFCşteriler"),
            o.acikBorclular.length === 0 ? React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "A\xE7ık bor\xE7 yok.") : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, o.acikBorclular.map((c, i) => React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.text } }, React.createElement("span", null, c.ad), React.createElement("strong", { style: { color: C.red } }, fmtTL(c.borc)))))
          )
        ),
        React.createElement(
          "div",
          { style: { ...S.card, marginTop: 14 } },
          React.createElement("div", { style: S.secTitle }, "\u{1F916} AI Mali Analiz Raporu"),
          React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Se\xE7ilen d\xF6nemdeki gelir/gider/bor\xE7 verilerinizi yapay zekaya g\xF6nderip detaylı bir analiz ve \xF6neri raporu oluşturur."),
          React.createElement(
            "div",
            { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 } },
            React.createElement("button", { style: S.btn(), onClick: raporOlustur, disabled: raporYukleniyor }, raporYukleniyor ? "⏳ Oluşturuluyor..." : "\u{1F916} Rapor Oluştur"),
            raporMetni && React.createElement("button", { style: S.btnO, onClick: raporPdfIndir }, "⬇️ PDF İndir")
          ),
          raporHata && React.createElement("div", { style: { padding: "10px 14px", background: C.red + "18", borderRadius: 8, color: C.red, fontSize: 12.5, marginBottom: 12 } }, "⚠️ ", raporHata),
          raporMetni && React.createElement("div", { style: { padding: "14px 16px", background: C.surface, borderRadius: 8, fontSize: 13, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.7 } }, raporMetni)
        )
      );
    })(),
    giderModal && React.createElement(
      Modal,
      { title: giderForm.id ? "Gideri D\xFCzenle" : "Yeni Gider", onClose: () => setGiderModal(false), width: 460 },
      !giderForm.id && React.createElement("label", { style: { ...S.btnO, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 14 } }, fisOkunuyor ? "⏳ Fiş okunuyor..." : "\u{1F4F7} Fişten Oku", React.createElement("input", { type: "file", accept: "image/*", disabled: fisOkunuyor, style: { display: "none" }, onChange: fisOku })),
      fisHata && React.createElement("div", { style: { color: C.red, fontSize: 11.5, marginBottom: 12 } }, "⚠️ ", fisHata),
      React.createElement(FG, { label: "Tarih" }, React.createElement("input", { type: "date", style: S.inp, value: giderForm.tarih || "", onChange: (e) => setGiderForm((f) => ({ ...f, tarih: e.target.value })) })),
      React.createElement(FG, { label: "Kategori" }, React.createElement("select", { style: S.sel, value: giderForm.kategori || "", onChange: (e) => setGiderForm((f) => ({ ...f, kategori: e.target.value })) }, GIDER_KATEGORILERI.map((k) => React.createElement("option", { key: k, value: k }, k)))),
      React.createElement(FG, { label: "A\xE7\u0131klama" }, React.createElement("input", { style: S.inp, value: giderForm.aciklama || "", onChange: (e) => setGiderForm((f) => ({ ...f, aciklama: e.target.value })) })),
      React.createElement(FG, { label: "Tutar (\u20BA)" }, React.createElement("input", { type: "number", style: S.inp, value: giderForm.tutar || "", onChange: (e) => setGiderForm((f) => ({ ...f, tutar: +e.target.value })) })),
      !giderForm.id && React.createElement(FG, { label: "\xD6demenin \xC7\u0131kt\u0131\u011F\u0131 Hesap (opsiyonel)" }, React.createElement("select", { style: S.sel, value: giderForm.hesapId || "", onChange: (e) => setGiderForm((f) => ({ ...f, hesapId: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Sadece kayda ge\xE7sin, hesaptan d\xFC\u015F\xFClmesin \u2014"), hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad, " (", fmtTL(h.bakiye), ")")))),
      !giderForm.id && giderForm.hesapId && React.createElement(FG, { label: "\xD6deme Y\xF6ntemi" }, React.createElement("select", { style: S.sel, value: giderForm.yontem || "Nakit", onChange: (e) => setGiderForm((f) => ({ ...f, yontem: e.target.value })) }, ODEME_YONTEMLERI.map((y) => React.createElement("option", { key: y, value: y }, y)))),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setGiderModal(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: giderKaydet }, "Kaydet"))
    ),

    faturaModal && React.createElement(
      Modal,
      { title: `Fatura D\xFCzenle \u2014 ${faturaForm.faturaNo || ""}`, onClose: () => setFaturaModal(false), width: 520 },
      React.createElement(FG, { label: "A\xE7\u0131klama" }, React.createElement("input", { style: S.inp, value: faturaForm.aciklama || "", onChange: (e) => setFaturaForm((f) => ({ ...f, aciklama: e.target.value })) })),
      React.createElement("div", { style: { ...S.secTitle, fontSize: 13, marginTop: 4 } }, "Kalemler"),
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 } }, (faturaForm.kalemler || []).map((k) => React.createElement(
        "div",
        { key: k.id, style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" } },
        React.createElement("input", { style: { ...S.inp, flex: "1 1 160px" }, placeholder: "Kalem ad\u0131", value: k.ad || "", onChange: (e) => faturaKalemGuncelle(k.id, { ad: e.target.value }) }),
        React.createElement("input", { type: "number", style: { ...S.inp, width: 64 }, title: "Adet", value: k.adet ?? 1, onChange: (e) => faturaKalemGuncelle(k.id, { adet: +e.target.value }) }),
        React.createElement("input", { type: "number", style: { ...S.inp, width: 90 }, title: "Birim Fiyat", value: k.birimFiyat || "", onChange: (e) => faturaKalemGuncelle(k.id, { birimFiyat: +e.target.value }) }),
        React.createElement("span", { style: { fontSize: 12.5, color: C.muted, minWidth: 70, textAlign: "right" } }, fmtTL(k.tutar)),
        React.createElement("button", { style: S.btnR, onClick: () => faturaKalemSil(k.id) }, "\u2715")
      ))),
      React.createElement("button", { type: "button", style: { ...S.btnO, marginBottom: 14 }, onClick: faturaKalemEkle }, "\u2795 Kalem Ekle"),
      React.createElement("div", { style: { textAlign: "right", fontSize: 15, fontWeight: 800, color: C.accent, marginBottom: 12 } }, "Toplam: ", fmtTL((faturaForm.kalemler || []).reduce((t, k) => t + (+k.tutar || 0), 0))),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26a0\ufe0f ", hata),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setFaturaModal(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: faturaKaydet }, "Kaydet"))
    ),
    yeniFaturaModal && React.createElement(
      Modal,
      { title: "\u2795 Yeni Fatura", onClose: () => setYeniFaturaModal(false), width: 420 },
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 14 } },
        React.createElement("button", { type: "button", style: (yeniFaturaForm.yon || "satis") === "satis" ? S.btn() : S.btnO, onClick: () => setYeniFaturaForm((f) => ({ ...f, yon: "satis" })) }, "\u{1F4E4} Sat\u0131\u015f Faturas\u0131"),
        React.createElement("button", { type: "button", style: yeniFaturaForm.yon === "alis" ? S.btn() : S.btnO, onClick: () => setYeniFaturaForm((f) => ({ ...f, yon: "alis" })) }, "\u{1F4E5} Al\u0131\u015f Faturas\u0131")
      ),
      React.createElement(FG, { label: "M\u00fc\u015fteri / Tedarik\u00e7i" }, React.createElement("select", { style: S.sel, value: yeniFaturaForm.musteriId || "", onChange: (e) => setYeniFaturaForm((f) => ({ ...f, musteriId: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), cariler.map((c) => React.createElement("option", { key: c.id, value: c.id }, c.ad)))),
      React.createElement(FG, { label: "Tarih" }, React.createElement("input", { type: "date", style: S.inp, value: yeniFaturaForm.tarih || "", onChange: (e) => setYeniFaturaForm((f) => ({ ...f, tarih: e.target.value })) })),
      React.createElement(FG, { label: "A\u00e7\u0131klama" }, React.createElement("input", { style: S.inp, value: yeniFaturaForm.aciklama || "", onChange: (e) => setYeniFaturaForm((f) => ({ ...f, aciklama: e.target.value })) })),
      React.createElement(FG, { label: "Tutar (\u20ba)" }, React.createElement("input", { type: "number", style: S.inp, value: yeniFaturaForm.tutar ?? "", onChange: (e) => setYeniFaturaForm((f) => ({ ...f, tutar: +e.target.value })) })),
      React.createElement(FG, { label: "KDV Oran\u0131" }, React.createElement("select", { style: S.sel, value: yeniFaturaForm.kdvOrani ?? "", onChange: (e) => setYeniFaturaForm((f) => ({ ...f, kdvOrani: +e.target.value })) }, kdvOranlariGetir().map((o) => React.createElement("option", { key: o, value: o }, "%", o)))),
      yeniFaturaHata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26a0\ufe0f ", yeniFaturaHata),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setYeniFaturaModal(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: yeniFaturaKaydet }, "Kaydet"))
    ),

    hesapModal && React.createElement(
      Modal,
      { title: hesapForm.id ? "Hesab\u0131 D\xFCzenle" : "Yeni Hesap", onClose: () => setHesapModal(false), width: 420 },
      React.createElement(FG, { label: "Hesap Ad\u0131" }, React.createElement("input", { style: S.inp, value: hesapForm.ad || "", onChange: (e) => setHesapForm((f) => ({ ...f, ad: e.target.value })), placeholder: "\xD6rn: \u0130\u015F Bankas\u0131 Vadesiz" })),
      React.createElement(FG, { label: "Hesap T\xFCr\xFC" }, React.createElement("select", { style: S.sel, value: hesapForm.tur || "kasa", onChange: (e) => setHesapForm((f) => ({ ...f, tur: e.target.value })) }, Object.entries(HESAP_TUR_LABEL).map(([k, l]) => React.createElement("option", { key: k, value: k }, l)))),
      !hesapForm.id && React.createElement(FG, { label: "Ba\u015Flang\u0131\xE7 Bakiyesi (\u20BA)" }, React.createElement("input", { type: "number", style: S.inp, value: hesapForm.bakiye || "", onChange: (e) => setHesapForm((f) => ({ ...f, bakiye: +e.target.value })) })),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setHesapModal(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: hesapKaydet }, "Kaydet"))
    ),

    transferModal && React.createElement(
      Modal,
      { title: "\u{1F504} Kasalar Aras\u0131 Transfer", onClose: () => setTransferModal(false), width: 440 },
      React.createElement(FG, { label: "Kaynak Hesap (\xE7\u0131k\u0131\u015F)" }, React.createElement("select", { style: S.sel, value: transferForm.kaynakId || "", onChange: (e) => setTransferForm((f) => ({ ...f, kaynakId: e.target.value })) }, hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad, " (", fmtTL(h.bakiye), ")")))),
      React.createElement(FG, { label: "Hedef Hesap (giri\u015F)" }, React.createElement("select", { style: S.sel, value: transferForm.hedefId || "", onChange: (e) => setTransferForm((f) => ({ ...f, hedefId: e.target.value })) }, hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad, " (", fmtTL(h.bakiye), ")")))),
      React.createElement(FG, { label: "Tutar (\u20BA)" }, React.createElement("input", { type: "number", style: S.inp, value: transferForm.tutar || "", onChange: (e) => setTransferForm((f) => ({ ...f, tutar: +e.target.value })) })),
      React.createElement(FG, { label: "Tarih" }, React.createElement("input", { type: "date", style: S.inp, value: transferForm.tarih || "", onChange: (e) => setTransferForm((f) => ({ ...f, tarih: e.target.value })) })),
      React.createElement(FG, { label: "A\xE7\u0131klama (opsiyonel)" }, React.createElement("input", { style: S.inp, value: transferForm.aciklama || "", onChange: (e) => setTransferForm((f) => ({ ...f, aciklama: e.target.value })) })),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setTransferModal(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: transferKaydet }, "Transfer Et"))
    ),

    hareketModal && React.createElement(
      Modal,
      { title: "Yeni Kasa/Banka \u0130\u015Flemi", onClose: () => setHareketModal(false), width: 440 },
      React.createElement(FG, { label: "Hesap" }, React.createElement("select", { style: S.sel, value: hareketForm.hesapId || "", onChange: (e) => setHareketForm((f) => ({ ...f, hesapId: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad, " (", fmtTL(h.bakiye), ")")))),
      React.createElement(
        Grid2,
        null,
        React.createElement(FG, { label: "Y\xF6n" }, React.createElement("select", { style: S.sel, value: hareketForm.yon || "giris", onChange: (e) => setHareketForm((f) => ({ ...f, yon: e.target.value })) }, React.createElement("option", { value: "giris" }, "\u2795 Para Giri\u015Fi"), React.createElement("option", { value: "cikis" }, "\u2796 Para \xC7\u0131k\u0131\u015F\u0131"))),
        React.createElement(FG, { label: "Tutar (\u20BA)" }, React.createElement("input", { type: "number", style: S.inp, value: hareketForm.tutar || "", onChange: (e) => setHareketForm((f) => ({ ...f, tutar: +e.target.value })) }))
      ),
      React.createElement(FG, { label: "\xD6deme Y\xF6ntemi" }, React.createElement("select", { style: S.sel, value: hareketForm.yontem || "Nakit", onChange: (e) => setHareketForm((f) => ({ ...f, yontem: e.target.value })) }, ODEME_YONTEMLERI.map((y) => React.createElement("option", { key: y, value: y }, y)))),
      React.createElement(FG, { label: "Tarih" }, React.createElement("input", { type: "date", style: S.inp, value: hareketForm.tarih || "", onChange: (e) => setHareketForm((f) => ({ ...f, tarih: e.target.value })) })),
      React.createElement(FG, { label: "A\xE7\u0131klama" }, React.createElement("input", { style: S.inp, value: hareketForm.aciklama || "", onChange: (e) => setHareketForm((f) => ({ ...f, aciklama: e.target.value })) })),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setHareketModal(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: hareketKaydet }, "Kaydet"))
    ),

    odemeAlModal && React.createElement(
      Modal,
      { title: `\u{1F4B0} ${odemeAlModal.faturaNo} \u2014 ${odemeAlModal.tur === "alis" ? "\xD6deme Yap" : "\xD6deme Al"}`, onClose: () => setOdemeAlModal(null), width: 400 },
      React.createElement("div", { style: { fontSize: 13, color: C.muted, marginBottom: 14 } }, "Kalan: ", React.createElement("strong", { style: { color: C.white } }, fmtTL(faturaKalan(odemeAlModal))), " / Toplam: ", fmtTL(odemeAlModal.toplam)),
      React.createElement(FG, { label: "Tutar (\u20ba)" }, React.createElement("input", { type: "number", style: S.inp, value: odemeAlForm.tutar ?? "", onChange: (e) => setOdemeAlForm((f) => ({ ...f, tutar: +e.target.value })) })),
      React.createElement(FG, { label: "Hesap" }, React.createElement("select", { style: S.sel, value: odemeAlForm.hesapId || "", onChange: (e) => setOdemeAlForm((f) => ({ ...f, hesapId: e.target.value })) }, hesaplar.length === 0 && React.createElement("option", { value: "" }, "\xD6nce Kasa & Banka'dan hesap ekleyin"), hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad)))),
      React.createElement(FG, { label: "\xD6deme Y\xF6ntemi" }, React.createElement("select", { style: S.sel, value: odemeAlForm.yontem || "Nakit", onChange: (e) => setOdemeAlForm((f) => ({ ...f, yontem: e.target.value })) }, ODEME_YONTEMLERI.map((y) => React.createElement("option", { key: y, value: y }, y)))),
      odemeHata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26a0\ufe0f ", odemeHata),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setOdemeAlModal(null) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: odemeAlKaydet }, "Onayla"))
    ),

    detayHesap && React.createElement(
      Modal,
      { title: `${detayHesap.ad} \u2014 \u0130\u015Flem Ge\xE7mi\u015Fi`, onClose: () => setDetayHesapId(null), width: 560 },
      detayHareketler.length === 0
        ? React.createElement("div", { style: { color: C.muted } }, "Bu hesapta i\u015Flem yok.")
        : React.createElement(SiraliTablo, {
            dosyaAdi: "hesap_hareketleri",
            rowKey: (h) => h.id,
            rows: detayHareketler,
            columns: [
              { key: "tarih", baslik: "Tarih", sirala: (h) => h.tarih || "", render: (h) => fmtDate(h.tarih) },
              { key: "aciklama", baslik: "A\xE7\u0131klama", sirala: (h) => h.aciklama || "", render: (h) => h.aciklama || "\u2014" },
              { key: "yon", baslik: "Y\xF6n", sirala: (h) => h.tur || "", render: (h) => h.tur === "giris" ? "\u2795 Giri\u015F" : "\u2796 \xC7\u0131k\u0131\u015F" },
              { key: "yontem", baslik: "Y\xF6ntem", sirala: (h) => h.yontem || "", render: (h) => h.yontem || "\u2014" },
              { key: "tutar", baslik: "Tutar", sirala: (h) => +h.tutar || 0, render: (h) => React.createElement("strong", { style: { color: h.tur === "giris" ? C.green : C.red } }, h.tur === "giris" ? "+" : "-", fmtTL(h.tutar)) }
            ]
          })
    )
  );
}
const FIRMA_LOGO_ID = "firma_logo";
function LogoImg({ size = 34, style = {} }) {
  const [logo, setLogo] = useState(null);
  useEffect(() => {
    let iptal = false;
    dosyaGetir(FIRMA_LOGO_ID).then((v) => {
      if (!iptal && v) setLogo(v);
    });
    return () => {
      iptal = true;
    };
  }, []);
  return React.createElement("img", { src: logo || "icons/icon-192.png", alt: "Logo", style: { width: size, height: size, objectFit: "contain", flexShrink: 0, ...style } });
}
function FirmaLogoYoneticisi() {
  const [logo, setLogo] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  useEffect(() => {
    let iptal = false;
    dosyaGetir(FIRMA_LOGO_ID).then((v) => {
      if (!iptal) {
        setLogo(v);
        setYukleniyor(false);
      }
    });
    return () => {
      iptal = true;
    };
  }, []);
  const yukle = async (e) => {
    const dosya = e.target.files[0];
    if (!dosya) return;
    const veri = await dosyaOku(dosya);
    await dosyaKaydet(FIRMA_LOGO_ID, veri);
    setLogo(veri);
    e.target.value = "";
  };
  const kaldir = async () => {
    if (!confirm("Logo kaldırılsın mı?")) return;
    await dosyaSil(FIRMA_LOGO_ID);
    setLogo(null);
  };
  return React.createElement(
    KatlanirKart,
    { title: "\u{1F5BC}\uFE0F Firma Logosu" },
    React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Giriş ekranında ve yan menüde kendi logonuzu kullanın."),
    !yukleniyor && React.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" } },
      logo
        ? React.createElement("img", { src: logo, alt: "Logo", style: { width: 64, height: 64, objectFit: "contain", background: C.surface, borderRadius: 8, padding: 6 } })
        : React.createElement("div", { style: { width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: C.surface, borderRadius: 8, color: C.muted, fontSize: 10, textAlign: "center" } }, "Logo yok"),
      React.createElement("label", { style: { ...S.btnO, cursor: "pointer" } }, "\u2B06\uFE0F Logo Yükle", React.createElement("input", { type: "file", accept: "image/*", style: { display: "none" }, onChange: yukle })),
      logo && React.createElement("button", { style: S.btnR, onClick: kaldir }, "\u{1F5D1}\uFE0F Kaldır")
    )
  );
}
const GUNUN_OZETI_GUN_LABEL = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
function BildirimlerYoneticisi({ tahsilatGunu, onTahsilatGunuDegistir, gununOzetiAktif, gununOzetiGunler, gununOzetiSaati, onGununOzetiDegistir } = {}) {
  const [izin, setIzin] = useState(bildirimlerDesteklerMi() ? Notification.permission : "desteklenmiyor");
  const etkinlestir = async () => {
    const sonuc = await bildirimIzniIste();
    setIzin(sonuc);
    if (sonuc === "granted") bildirimGoster("\u{1F514} Bildirimler Açık", "Randevu, tahsilat ve garanti hatırlatmaları artık bu cihazda görünecek.");
  };
  const secilenGunler = Array.isArray(gununOzetiGunler) ? gununOzetiGunler : [];
  const gunSec = (g) => {
    const yeni = secilenGunler.includes(g) ? secilenGunler.filter((x) => x !== g) : [...secilenGunler, g];
    onGununOzetiDegistir && onGununOzetiDegistir({ gununOzetiGunler: yeni });
  };
  return React.createElement(
    KatlanirKart,
    { title: "\u{1F514} Bildirimler" },
    React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Açıkken uygulama, yarının randevularını, gecikmiş/kısmi tahsilatları ve yaklaşan garanti bitişlerini günde bir kez bu cihaza bildirim olarak gönderir. ⚠️ Bu bildirimler yalnızca uygulama bir sekmede açıkken veya cihaza yüklenmiş PWA olarak çalışırken görünür; uygulama tamamen kapalıyken sunucu tarafı bir bildirim gönderilmez."),
    izin === "desteklenmiyor" && React.createElement("div", { style: { color: C.muted, fontSize: 12.5 } }, "Bu tarayıcı bildirimleri desteklemiyor."),
    izin === "granted" && React.createElement("div", { style: { color: C.green, fontSize: 12.5 } }, "✅ Bildirimler açık."),
    izin === "denied" && React.createElement("div", { style: { color: C.red, fontSize: 12.5 } }, "⚠️ Bildirimler tarayıcı ayarlarından engellenmiş. Tarayıcının site ayarlarından izin verin."),
    izin === "default" && React.createElement("button", { style: S.btnO, onClick: etkinlestir }, "\u{1F514} Bildirimleri Etkinleştir"),
    onTahsilatGunuDegistir && React.createElement("div", { style: { marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` } },
      React.createElement(FG, { label: "Ödenmemiş/Kısmi Ödenen İşler İçin Kaç Gün Sonra Hatırlatılsın?" },
        React.createElement("input", { type: "number", min: 0, style: { ...S.inp, maxWidth: 140 }, value: tahsilatGunu ?? 3, onChange: (e) => onTahsilatGunuDegistir(+e.target.value) })
      ),
      React.createElement("div", { style: { fontSize: 11, color: C.muted } }, "İş tamamlandıktan bu kadar gün sonra hala ödenmemiş veya kısmi ödenmiş işler için günlük hatırlatma bildirimi gösterilir.")
    ),
    onGununOzetiDegistir && React.createElement("div", { style: { marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 } },
        React.createElement("strong", { style: { color: C.white, fontSize: 13 } }, "☀️ Günün Özeti (Sabah AI Analiz Bildirimi)"),
        React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text, cursor: "pointer" } },
          React.createElement("input", { type: "checkbox", checked: gununOzetiAktif !== false, onChange: (e) => onGununOzetiDegistir({ gununOzetiAktif: e.target.checked }) }),
          "Aktif"
        )
      ),
      React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginBottom: 10, lineHeight: 1.6 } }, "Seçtiğin günlerde, belirlediğin saatten sonra uygulama açıldığında yapay zeka o günün öncelikli konularını özetleyen kısa bir bildirim gönderir."),
      React.createElement(FG, { label: "Hangi Günler" }, React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, GUNUN_OZETI_GUN_LABEL.map((g, i) => React.createElement("button", { key: i, type: "button", onClick: () => gunSec(i), style: { ...(secilenGunler.includes(i) ? S.btn() : S.btnO), padding: "5px 10px", fontSize: 11.5 } }, g)))),
      React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 10 } }, "Hiçbir gün seçilmezse her gün gönderilir."),
      React.createElement(FG, { label: "Saat" }, React.createElement("input", { type: "time", style: { ...S.inp, maxWidth: 140 }, value: gununOzetiSaati || "08:00", onChange: (e) => onGununOzetiDegistir({ gununOzetiSaati: e.target.value }) }))
    )
  );
}
function OtomatikYedeklerYoneticisi() {
  const [yedekler, setYedekler] = useState(null);
  useEffect(() => {
    let iptal = false;
    otomatikYedekleriGetir().then((v) => {
      if (!iptal) setYedekler(v);
    });
    return () => {
      iptal = true;
    };
  }, []);
  return React.createElement(
    KatlanirKart,
    { title: "\u{1F5C4}️ Otomatik Yedekler" },
    React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Uygulama bu cihazda günde bir kez otomatik olarak tüm verilerinizin bir kopyasını saklar (son ", OTOMATIK_YEDEK_SAYISI, " gün). Bu, manuel yedek indirmenin yerini tutmaz."),
    !yedekler ? React.createElement("div", { style: { color: C.muted, fontSize: 12.5 } }, "Yükleniyor…") : yedekler.length === 0 ? React.createElement("div", { style: { color: C.muted, fontSize: 12.5 } }, "Henüz otomatik yedek alınmadı.") : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, yedekler.map((y) => React.createElement(
      "div",
      { key: y.slot, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: C.surface, borderRadius: 8, flexWrap: "wrap", gap: 8 } },
      React.createElement("span", { style: { fontSize: 12.5, color: C.text } }, fmtDate(y.tarih)),
      React.createElement("div", { style: { display: "flex", gap: 6 } },
        React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => otomatikYedekIndir(y) }, "⬇️ İndir"),
        React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => otomatikYedekGeriYukle(y) }, "♻️ Geri Yükle")
      )
    )))
  );
}
function Ayarlar() {
  const [form, setForm] = useState(() => {
    const s = getSettings();
    return {
      ...s,
      hizmetTurleri: Array.isArray(s.hizmetTurleri) ? s.hizmetTurleri.map((x) => ({ ...x })) : HIZMET_TIP_VARSAYILAN_DIGER.map((x) => ({ ...x })),
      giderKategorileri: Array.isArray(s.giderKategorileri) && s.giderKategorileri.length > 0 ? [...s.giderKategorileri] : [...GIDER_KATEGORILERI_VARSAYILAN],
      kdvOranlari: Array.isArray(s.kdvOranlari) && s.kdvOranlari.length > 0 ? [...s.kdvOranlari] : [...KDV_ORANLARI_VARSAYILAN],
      resmiHatirlaticilar: Array.isArray(s.resmiHatirlaticilar) ? s.resmiHatirlaticilar.map((x) => ({ ...x })) : RESMI_HATIRLATICI_VARSAYILAN.map((x) => ({ ...x })),
      rolSayfaIzin: {
        usta: Array.isArray(s.rolSayfaIzin?.usta) ? s.rolSayfaIzin.usta : [...ROL_SAYFA_IZIN_VARSAYILAN.usta],
        kasiyer: Array.isArray(s.rolSayfaIzin?.kasiyer) ? s.rolSayfaIzin.kasiyer : [...ROL_SAYFA_IZIN_VARSAYILAN.kasiyer]
      }
    };
  });
  const [kaydedildi, setKaydedildi] = useState(false);
  const [bulutTest, setBulutTest] = useState("");
  const [bulutIslemDevam, setBulutIslemDevam] = useState(false);
  const [aiTest, setAiTest] = useState("");
  const [aiTestDevam, setAiTestDevam] = useState(false);
  const [googleTakvimTest, setGoogleTakvimTest] = useState("");
  const [googleTakvimDevam, setGoogleTakvimDevam] = useState(false);
  const [sekme, setSekme] = useState("genel");
  const [sifreModal, setSifreModal] = useState(false);
  const [sifreGiris, setSifreGiris] = useState("");
  const [sifreHata, setSifreHata] = useState("");
  const kaydet = () => {
    saveSettings(form);
    hizmetTurleriYenile();
    giderKategorileriYenile();
    rolYetkileriYenile();
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2e3);
  };
  const rolYetkiDegistir = (rol, sayfaId) => setForm((f) => {
    const mevcut = Array.isArray(f.rolSayfaIzin?.[rol]) ? f.rolSayfaIzin[rol] : (ROL_SAYFA_IZIN_VARSAYILAN[rol] || []);
    const yeni = mevcut.includes(sayfaId) ? mevcut.filter((x) => x !== sayfaId) : [...mevcut, sayfaId];
    return { ...f, rolSayfaIzin: { ...(f.rolSayfaIzin || {}), [rol]: yeni } };
  });
  const hizmetEkle = () => setForm((f) => ({ ...f, hizmetTurleri: [...(f.hizmetTurleri || []), { key: "ozel_" + uid(), label: "" }] }));
  const hizmetGuncelle = (key, label) => setForm((f) => ({ ...f, hizmetTurleri: f.hizmetTurleri.map((h) => h.key === key ? { ...h, label } : h) }));
  const hizmetSil = (key) => {
    if (!confirm("Bu hizmet t\xFCr\xFC kaldırılsın mı? Bu t\xFCrde kayıtlı ge\xE7miş iş emirleri etkilenmez.")) return;
    setForm((f) => ({ ...f, hizmetTurleri: f.hizmetTurleri.filter((h) => h.key !== key) }));
  };
  const giderKategoriEkle = () => setForm((f) => ({ ...f, giderKategorileri: [...(f.giderKategorileri || []), ""] }));
  const giderKategoriGuncelle = (i, deger) => setForm((f) => ({ ...f, giderKategorileri: f.giderKategorileri.map((g, idx) => idx === i ? deger : g) }));
  const giderKategoriSil = (i) => {
    if (!confirm("Bu gider kategorisi kaldırılsın mı?")) return;
    setForm((f) => ({ ...f, giderKategorileri: f.giderKategorileri.filter((_, idx) => idx !== i) }));
  };
  const kdvEkle = () => setForm((f) => ({ ...f, kdvOranlari: [...(f.kdvOranlari || []), 0] }));
  const kdvGuncelle = (i, deger) => setForm((f) => ({ ...f, kdvOranlari: f.kdvOranlari.map((k, idx) => idx === i ? deger : k) }));
  const kdvSil = (i) => {
    if (!confirm("Bu KDV oranı kaldırılsın mı?")) return;
    setForm((f) => ({ ...f, kdvOranlari: f.kdvOranlari.filter((_, idx) => idx !== i) }));
  };
  const resmiHatirlaticiEkle = () => setForm((f) => ({ ...f, resmiHatirlaticilar: [...(f.resmiHatirlaticilar || []), { id: uid(), ad: "", gun: 1 }] }));
  const resmiHatirlaticiGuncelle = (id, patch) => setForm((f) => ({ ...f, resmiHatirlaticilar: f.resmiHatirlaticilar.map((r) => r.id === id ? { ...r, ...patch } : r) }));
  const resmiHatirlaticiSil = (id) => {
    if (!confirm("Bu hatırlatıcı kaldırılsın mı?")) return;
    setForm((f) => ({ ...f, resmiHatirlaticilar: f.resmiHatirlaticilar.filter((r) => r.id !== id) }));
  };
  const sablonGuncelle = (key, deger) => setForm((f) => ({ ...f, mesajSablonlari: { ...(f.mesajSablonlari || {}), [key]: deger } }));
  const sablonSifirla = (key) => setForm((f) => {
    const yeni = { ...(f.mesajSablonlari || {}) };
    delete yeni[key];
    return { ...f, mesajSablonlari: yeni };
  });
  const bulutTestEt = async () => {
    setBulutIslemDevam(true);
    setBulutTest("");
    try {
      saveSettings(form);
      if (!form.supabaseUrl || !form.supabaseAnonKey) throw new Error("\u00d6nce Supabase URL ve Anon Key girin.");
      if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(form.supabaseUrl.trim())) throw new Error('Supabase Project URL hatal\u0131 g\xF6r\xFCn\xFCyor. Dashboard linkini de\u011fil, Project Settings \u2192 API sayfas\u0131ndaki "Project URL"yi (\xF6rn. https://xxxxxxxx.supabase.co) girin.');
      await bulutaYaz("_baglantiTesti", Date.now());
      setBulutTest("basarili");
    } catch (e) {
      setBulutTest(e.message || "Ba\u011Flant\u0131 kurulamad\u0131.");
    }
    setBulutIslemDevam(false);
  };
  const bulutaYukle = async () => {
    setBulutIslemDevam(true);
    try {
      saveSettings(form);
      for (const anahtar of ALL_DATA_KEYS) {
        await bulutaYaz(anahtar, LS.get(anahtar));
      }
      await bulutaYaz("ayarlar", getSettings());
      const zamanDamgasi = Date.now();
      await bulutaYaz("_sonGuncelleme", zamanDamgasi);
      localStorage.setItem("fp_son_yerel_degisim", String(zamanDamgasi));
      alert("\u2705 T\xFCm veriler buluta y\xFCklendi.");
    } catch (e) {
      alert("Hata: " + e.message);
    }
    setBulutIslemDevam(false);
  };
  const buluttanIndir = async () => {
    if (!confirm("Buluttaki veriler, bu cihazdaki mevcut verilerin \xDCZER\u0130NE YAZILACAK. Devam edilsin mi?")) return;
    setBulutIslemDevam(true);
    try {
      for (const anahtar of ALL_DATA_KEYS) {
        const veri = await buluttanOku(anahtar);
        if (veri !== null) localStorage.setItem(anahtar, JSON.stringify(veri));
      }
      const ayarVeri = await buluttanOku("ayarlar");
      if (ayarVeri) localStorage.setItem("ayarlar", JSON.stringify(ayarVeri));
      const uzakZaman = await buluttanOku("_sonGuncelleme");
      if (uzakZaman) localStorage.setItem("fp_son_yerel_degisim", String(uzakZaman));
      alert("\u2705 Bulut verileri indirildi. Sayfa yenilenecek.");
      window.location.reload();
    } catch (e) {
      alert("Hata: " + e.message);
    }
    setBulutIslemDevam(false);
  };
  const aiTestEt = async () => {
    setAiTestDevam(true);
    setAiTest("");
    try {
      saveSettings(form);
      const cevap = await aiSor("Sadece 'Ba\u011Flant\u0131 ba\u015Far\u0131l\u0131' yaz, ba\u015Fka hi\xE7bir \u015Fey ekleme.");
      setAiTest(cevap.includes("ba\u015Far\u0131l\u0131") || cevap.includes("basarili") ? "basarili" : cevap);
    } catch (e) {
      setAiTest(e.message);
    }
    setAiTestDevam(false);
  };
  const googleTakvimBaglan = async () => {
    setGoogleTakvimDevam(true);
    setGoogleTakvimTest("");
    try {
      saveSettings({ ...form, googleTakvimAktif: true });
      _googleTakvimToken = null;
      await googleTakvimTokenAl();
      setForm((f) => ({ ...f, googleTakvimAktif: true }));
      setGoogleTakvimTest("basarili");
    } catch (e) {
      setGoogleTakvimTest(e.message || "Bağlantı kurulamadı.");
    }
    setGoogleTakvimDevam(false);
  };
  const tumVerileriSifirla = () => {
    if (sifreGiris !== "Yamaha88as.") {
      setSifreHata("\u015Eifre yanl\u0131\u015F.");
      return;
    }
    if (!confirm("T\xDCM veriler (m\xFC\u015Fteriler, ara\xE7lar, servis i\u015Fleri, \xFCr\xFCnler, faturalar, ayarlar vb.) kal\u0131c\u0131 olarak silinecek. Bu i\u015Flem GER\u0130 AL\u0131NAMAZ. Devam etmeden \xF6nce Veri Y\xF6netimi'nden yedek indirmenizi \xF6neririz. Devam edilsin mi?")) return;
    if (!confirm("Son kez soruyoruz: t\xFCm veriler s\u0131f\u0131rlans\u0131n m\u0131?")) return;
    localStorage.clear();
    window.location.reload();
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 16 } }, "\u2699\uFE0F Ayarlar"),
  React.createElement(TabBar, { tabs: [["genel", "\u2699\uFE0F Genel"], ["finans", "\u{1F4B0} Finans"], ["wp_sablon", "\u{1F4AC} WP \u015Eablon"], ["baglanti", "\u2601\uFE0F Ba\u011Flant\u0131lar"], ["veri", "\u{1F4BE} Veri"]], active: sekme, onChange: setSekme }),
  sekme === "genel" && React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(KatlanirKart, { title: "\u{1F3E2} Firma Bilgileri" }, /* @__PURE__ */ React.createElement(FG, { label: "Firma Ad\u0131" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaAdi || "", onChange: (e) => setForm((f) => ({ ...f, firmaAdi: e.target.value })) })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaTel || "", onChange: (e) => setForm((f) => ({ ...f, firmaTel: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Varsay\u0131lan KDV Oran\u0131" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.kdvOrani ?? "", onChange: (e) => setForm((f) => ({ ...f, kdvOrani: +e.target.value })) }, (form.kdvOranlari || KDV_ORANLARI_VARSAYILAN).map((o) => /* @__PURE__ */ React.createElement("option", { key: o, value: o }, "%", o))))), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaAdres || "", onChange: (e) => setForm((f) => ({ ...f, firmaAdres: e.target.value })) }))), React.createElement(FirmaLogoYoneticisi, null), React.createElement(KatlanirKart, { title: "\u{1F3A8} G\xF6r\xFCn\xFCm" }, React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Uygulaman\u0131n renk temas\u0131n\u0131 se\xE7in."),
    React.createElement(
      "div",
      { style: { display: "flex", gap: 10 } },
      React.createElement("button", { type: "button", style: (form.tema || "koyu") === "koyu" ? S.btn() : S.btnO, onClick: () => temaDegistir("koyu") }, "\u{1F319} Koyu Mod"),
      React.createElement("button", { type: "button", style: form.tema === "acik" ? S.btn() : S.btnO, onClick: () => temaDegistir("acik") }, "\u2600\uFE0F A\xE7\u0131k Mod"),
      React.createElement("button", { type: "button", style: form.tema === "sistem" ? S.btn() : S.btnO, onClick: () => temaDegistir("sistem") }, "\u{1F4F1} Sistem")
    )), React.createElement(KatlanirKart, { title: "\u{1F510} Roller ve Yetkiler" }, React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Usta ve Kasiyer rol\xFCndeki personelin hangi sayfalar\u0131 g\xF6rebilece\u011Fini se\xE7in. Patron her zaman t\xFcm sayfalara eri\u015Fir."),
    ["usta", "kasiyer"].map((rol) => React.createElement("div", { key: rol, style: { marginBottom: 14 } },
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 8 } }, ROL_LABEL[rol]),
      React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
        SAYFALAR.filter((s) => !s.gizli).map((s) => React.createElement("label", { key: s.id, style: { display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: C.surface, borderRadius: 8, fontSize: 12, cursor: "pointer" } },
          React.createElement("input", { type: "checkbox", checked: (form.rolSayfaIzin[rol] || []).includes(s.id), onChange: () => rolYetkiDegistir(rol, s.id) }),
          " ", s.icon, " ", s.label
        ))
      )
    ))), React.createElement(KatlanirKart, { title: "\u{1F3F7}\uFE0F Hizmet T\xFCr\xFC Kategorileri" }, React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Egzoz Tamiri ve Chiptuning sabittir, de\u011Fi\u015Ftirilemez. Di\u011Fer kategorileri d\xFCzenleyebilir, silebilir veya yeni ekleyebilirsiniz."),
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 } },
      Object.entries(HIZMET_TIP_SABIT).map(([key, label]) => React.createElement(
        "div",
        { key, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: C.surface, borderRadius: 8 } },
        React.createElement("span", { style: { fontSize: 13, color: C.text, flex: 1 } }, label),
        React.createElement("span", { style: { fontSize: 11, color: C.muted } }, "\u{1F512} Sabit")
      )),
      (form.hizmetTurleri || []).map((h) => React.createElement(
        "div",
        { key: h.key, style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("input", { style: S.inp, value: h.label, onChange: (e) => hizmetGuncelle(h.key, e.target.value), placeholder: "Kategori ad\u0131" }),
        React.createElement("button", { type: "button", style: S.btnR, onClick: () => hizmetSil(h.key) }, "\u{1F5D1}\uFE0F")
      ))
    ),
    React.createElement("button", { type: "button", style: S.btnO, onClick: hizmetEkle }, "\u2795 Yeni Kategori Ekle")), React.createElement(BildirimlerYoneticisi, { tahsilatGunu: form.tahsilatHatirlatmaGunu, onTahsilatGunuDegistir: (v) => setForm((f) => ({ ...f, tahsilatHatirlatmaGunu: v })), gununOzetiAktif: form.gununOzetiAktif, gununOzetiGunler: form.gununOzetiGunler, gununOzetiSaati: form.gununOzetiSaati, onGununOzetiDegistir: (patch) => setForm((f) => ({ ...f, ...patch })) })), sekme === "finans" && React.createElement(React.Fragment, null, React.createElement(KatlanirKart, { title: "\u{1F4B8} Gider Kategorileri" }, React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Muhasebe \u2192 Giderler b\xF6l\xFCm\xFCnde kullan\u0131lan kategorileri d\xFCzenleyin."),
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 } },
      (form.giderKategorileri || []).map((g, i) => React.createElement(
        "div",
        { key: i, style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("input", { style: S.inp, value: g, onChange: (e) => giderKategoriGuncelle(i, e.target.value), placeholder: "Kategori ad\u0131" }),
        React.createElement("button", { type: "button", style: S.btnR, onClick: () => giderKategoriSil(i) }, "\u{1F5D1}\uFE0F")
      ))
    ),
    React.createElement("button", { type: "button", style: S.btnO, onClick: giderKategoriEkle }, "\u2795 Yeni Kategori Ekle")), React.createElement(KatlanirKart, { title: "\u{1F9FE} KDV Oranlar\u0131" }, React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Fatura olu\u015ftururken se\xE7ilebilecek KDV oranlar\u0131n\u0131 (%) y\xF6netin. Servis/sat\u0131\u015f/al\u0131\u015f faturas\u0131 olu\u015fturulurken bu listeden se\xE7im yap\u0131l\u0131r."),
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 } },
      (form.kdvOranlari || []).map((k, i) => React.createElement(
        "div",
        { key: i, style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("input", { type: "number", style: S.inp, value: k, onChange: (e) => kdvGuncelle(i, +e.target.value) }),
        React.createElement("span", { style: { color: C.muted, fontSize: 13 } }, "%"),
        React.createElement("button", { type: "button", style: S.btnR, onClick: () => kdvSil(i) }, "\u{1F5D1}\ufe0f")
      ))
    ),
    React.createElement("button", { type: "button", style: S.btnO, onClick: kdvEkle }, "\u2795 Yeni Oran Ekle")), React.createElement(KatlanirKart, { title: "\u{1F4C4} Resmi Ödeme Hatırlatıcıları" }, React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "KDV, muhtasar, SGK gibi d\xF6nemsel \xF6demeleri hat\u0131rlatmak i\xE7in her ay\u0131n hangi g\xFCn\xFCnde uyar\u0131lmak istedi\u011Finizi girin. Tarihler \xF6rnektir, muhasebecinizle teyit edin."),
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 } },
      (form.resmiHatirlaticilar || []).map((r) => React.createElement(
        "div",
        { key: r.id, style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("input", { style: { ...S.inp, flex: 1 }, value: r.ad, placeholder: "\xD6rn: KDV Beyannamesi", onChange: (e) => resmiHatirlaticiGuncelle(r.id, { ad: e.target.value }) }),
        React.createElement("span", { style: { color: C.muted, fontSize: 12, whiteSpace: "nowrap" } }, "her ay\u0131n"),
        React.createElement("input", { type: "number", min: 1, max: 31, style: { ...S.inp, width: 70 }, value: r.gun, onChange: (e) => resmiHatirlaticiGuncelle(r.id, { gun: Math.min(31, Math.max(1, +e.target.value || 1)) }) }),
        React.createElement("span", { style: { color: C.muted, fontSize: 12 } }, "\u0131"),
        React.createElement("button", { type: "button", style: S.btnR, onClick: () => resmiHatirlaticiSil(r.id) }, "\u{1F5D1}\ufe0f")
      ))
    ),
    React.createElement("button", { type: "button", style: S.btnO, onClick: resmiHatirlaticiEkle }, "\u2795 Yeni Hat\u0131rlat\u0131c\u0131 Ekle"))), sekme === "wp_sablon" && React.createElement(React.Fragment, null, React.createElement(KatlanirKart, { title: "💬 WhatsApp Mesaj Şablonları" },
      React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.6 } }, "Aşağıdaki şablonlardaki süslü parantez içindeki değişkenler ({musteri}, {tutar} gibi) gönderirken otomatik dolar. Değişkenleri silmeden metni istediğin gibi düzenleyebilirsin."),
      Object.keys(MESAJ_SABLONU_LABEL).map((key) => React.createElement(
        "div",
        { key, style: { marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${C.border}` } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 } },
          React.createElement("strong", { style: { fontSize: 12.5, color: C.white } }, MESAJ_SABLONU_LABEL[key]),
          React.createElement("button", { type: "button", style: { ...S.btnO, padding: "3px 8px", fontSize: 10.5 }, onClick: () => sablonSifirla(key) }, "Varsayılana Döndür")
        ),
        React.createElement("textarea", { style: { ...S.inp, minHeight: 70, fontFamily: "inherit", resize: "vertical" }, value: (form.mesajSablonlari && form.mesajSablonlari[key]) ?? VARSAYILAN_MESAJ_SABLONLARI[key], onChange: (e) => sablonGuncelle(key, e.target.value) }),
        React.createElement("div", { style: { fontSize: 10.5, color: C.muted, marginTop: 4 } }, "Değişkenler: ", MESAJ_SABLONU_DEGISKENLERI[key].map((v) => `{${v}}`).join(", "))
      ))
    )), sekme === "baglanti" && React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(KatlanirKart, { title: "\u2601\uFE0F Bulut Senkronizasyonu (Supabase)" }, React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Verileriniz farkl\u0131 cihazlarda (telefon, bilgisayar) ayn\u0131 g\xF6r\xFCns\xFCn istiyorsan\u0131z kullan\u0131n. ", React.createElement("a", { href: "https://supabase.com/dashboard/projects", target: "_blank", rel: "noopener noreferrer", style: { color: C.accent } }, "supabase.com"), "\u0027da \u00fccretsiz bir hesap a\u00e7\u0131p yeni bir proje olu\u015Fturun. Sonra projenizin SQL Editor\u0027\u00fcnde a\u015Fa\u011F\u0131daki tabloyu olu\u015Fturun:"), React.createElement("pre", { style: { background: "#00000033", padding: "10px 12px", borderRadius: 8, fontSize: 10.5, overflowX: "auto", color: C.text, marginBottom: 14, whiteSpace: "pre-wrap" } }, `create table if not exists veri_kutusu (\n  anahtar text primary key,\n  deger jsonb,\n  guncelleme_zamani timestamptz default now()\n);\nalter table veri_kutusu enable row level security;\ndrop policy if exists "herkese_izin" on veri_kutusu;\ncreate policy "herkese_izin" on veri_kutusu for all using (true) with check (true);`), React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Ard\u0131ndan proje ayarlar\u0131ndaki (Settings \u2192 API) Project URL ve anon public key de\u011Ferlerini a\u015Fa\u011F\u0131ya yap\u0131\u015Ft\u0131r\u0131n."), React.createElement(FG, { label: "Supabase Project URL" }, React.createElement("input", { style: S.inp, value: form.supabaseUrl || "", onChange: (e) => setForm((f) => ({ ...f, supabaseUrl: e.target.value.trim() })), placeholder: "https://xxxxxxxx.supabase.co" })), React.createElement(FG, { label: "Supabase Anon Key" }, React.createElement("input", { type: "password", style: S.inp, value: form.supabaseAnonKey || "", onChange: (e) => setForm((f) => ({ ...f, supabaseAnonKey: e.target.value.trim() })), placeholder: "eyJhbGciOi..." })), React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 } }, React.createElement("button", { style: S.btnO, onClick: bulutTestEt, disabled: bulutIslemDevam }, "\u{1F50C} Ba\u011Flant\u0131y\u0131 Test Et"), form.supabaseUrl && form.supabaseAnonKey && React.createElement(React.Fragment, null, React.createElement("button", { style: S.btnO, onClick: bulutaYukle, disabled: bulutIslemDevam }, "\u2B06\uFE0F Buluta Y\xFCkle (Bu Cihazdan)"), React.createElement("button", { style: S.btnO, onClick: buluttanIndir, disabled: bulutIslemDevam }, "\u2B07\uFE0F Buluttan \u0130ndir (Di\u011Fer Cihazdan)"))), bulutTest === "basarili" && React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.green + "18", borderRadius: 8, color: C.green, fontSize: 12.5 } }, "\u2705 Ba\u011Flant\u0131 ba\u015Far\u0131l\u0131! Art\u0131k her de\u011Fi\u015Fiklik otomatik olarak buluta kaydedilecek."), bulutTest && bulutTest !== "basarili" && React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.red + "18", borderRadius: 8, color: C.red, fontSize: 12.5 } }, "\u26A0\uFE0F ", bulutTest), React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 10 } }, "Not: Bu cihazda yapt\u0131\u011F\u0131n\u0131z her de\u011Fi\u015Fiklik otomatik buluta g\xF6nderilir. Uygulama ayr\u0131ca her 5 saniyede bir buluttaki de\u011Fi\u015Fiklikleri arka planda kontrol edip ekran\u0131n\u0131z\u0131 otomatik g\xFCnceller \u2014 ba\u015Fka bir cihazdan yap\u0131lan de\u011Fi\u015Fiklikler k\u0131sa s\xFCrede burada da g\xF6r\xFCn\xFCr.")), /* @__PURE__ */ React.createElement(KatlanirKart, { title: "\u{1F510} Google ile Giri\u015F" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Uygulamay\u0131 a\xE7an herkesin Google hesab\u0131yla giri\u015F yapmas\u0131n\u0131 zorunlu k\u0131lar. Kurulum i\xE7in:", /* @__PURE__ */ React.createElement("ol", { style: { margin: "8px 0 0", paddingLeft: 20 } }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "https://console.cloud.google.com/apis/credentials", target: "_blank", rel: "noopener noreferrer", style: { color: C.accent } }, "Google Cloud Console \u2192 Credentials"), "'a gidin (\xFCcretsiz Google hesab\u0131yla)"), /* @__PURE__ */ React.createElement("li", null, '"Create Credentials" \u2192 "OAuth client ID" \u2192 Uygulama t\xFCr\xFC: "Web application"'), /* @__PURE__ */ React.createElement("li", null, '"Authorized JavaScript origins" k\u0131sm\u0131na sitenizin adresini ekleyin (\xF6rn. https://kullaniciadi.github.io)'), /* @__PURE__ */ React.createElement("li", null, 'Olu\u015Fan "Client ID"yi a\u015Fa\u011F\u0131ya yap\u0131\u015Ft\u0131r\u0131n'))), /* @__PURE__ */ React.createElement(FG, { label: "Google Client ID" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.googleClientId || "", onChange: (e) => setForm((f) => ({ ...f, googleClientId: e.target.value.trim() })), placeholder: "123456789-xxxx.apps.googleusercontent.com" })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted } }, "Bo\u015F b\u0131rak\u0131rsan\u0131z Google giri\u015Fi istenmez, uygulama do\u011Frudan a\xE7\u0131l\u0131r.")), /* @__PURE__ */ React.createElement(KatlanirKart, { title: "\u{1F4C5} Google Takvim Senkronizasyonu" }, React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Ba\u011Flan\u0131rsan\u0131z, olu\u015Fturdu\u011Funuz/g\xFCncelledi\u011Finiz i\u015F emirleri otomatik olarak Google Takvim hesab\u0131n\u0131za (birincil takvim) etkinlik olarak eklenir; telefonunuzun kendi takvim uygulamas\u0131ndan da g\xF6r\xFCrs\xFCn\xFCz. Yukar\u0131daki Google Client ID\u0027nin ayn\u0131s\u0131 kullan\u0131l\u0131r, sadece ek olarak takvim izni istenir."),
    !form.googleClientId ? React.createElement("div", { style: { color: C.muted, fontSize: 12.5 } }, "\xD6nce yukar\u0131dan bir Google Client ID girip kaydedin.") : React.createElement(React.Fragment, null,
      React.createElement("button", { style: S.btnO, onClick: googleTakvimBaglan, disabled: googleTakvimDevam }, googleTakvimDevam ? "\u23F3 Bağlanıyor..." : form.googleTakvimAktif ? "\u{1F504} Yeniden Bağlan" : "\u{1F4C5} Google Takvim\u0027e Bağlan"),
      form.googleTakvimAktif && React.createElement("button", { style: { ...S.btnO, marginLeft: 8 }, onClick: () => { setForm((f) => ({ ...f, googleTakvimAktif: false })); saveSettings({ ...form, googleTakvimAktif: false }); } }, "Bağlantıyı Kes"),
      googleTakvimTest === "basarili" && React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.green + "18", borderRadius: 8, color: C.green, fontSize: 12.5 } }, "\u2705 Bağlandı! Bundan sonraki iş emirleri Google Takvim\u0027e eklenecek."),
      googleTakvimTest && googleTakvimTest !== "basarili" && React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.red + "18", borderRadius: 8, color: C.red, fontSize: 12.5 } }, "\u26A0\uFE0F ", googleTakvimTest)
    )), /* @__PURE__ */ React.createElement(KatlanirKart, { title: "\u{1F916} Yapay Zeka (AS Asistan, Teknisyen \xD6nerisi, KESS V3 Yard\u0131m\u0131)" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Yeni bir servis i\u015Fi eklerken hangi teknisyene atanmas\u0131 gerekti\u011Fini, chiptuning i\u015Flerinde KESS V3 i\u00e7in stage/protokol \u00f6nerisini ve genel KESS V3 kullan\u0131m sorular\u0131n\u0131 yapay zekaya sordurabilirsiniz. ", /* @__PURE__ */ React.createElement("a", { href: "https://aistudio.google.com/apikey", target: "_blank", rel: "noopener noreferrer", style: { color: C.accent } }, "aistudio.google.com/apikey"), "'dan Google hesab\u0131n\u0131zla, kredi kart\u0131 istemeden \xFCcretsiz bir Gemini API key alabilirsiniz."), /* @__PURE__ */ React.createElement(FG, { label: "Gemini API Key" }, /* @__PURE__ */ React.createElement("input", { type: "password", style: S.inp, value: form.aiApiKey || "", onChange: (e) => setForm((f) => ({ ...f, aiApiKey: e.target.value.trim() })), placeholder: "AIzaSy..." })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.red, marginBottom: 10 } }, "\u26A0\uFE0F Bu key taray\u0131c\u0131n\u0131zda saklan\u0131r ve do\u011Frudan Google'a g\xF6nderilir. Herkesle payla\u015Fmay\u0131n, ba\u015Fkalar\u0131n\u0131n kulland\u0131\u011F\u0131 bir bilgisayara girmeyin."), /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: aiTestEt, disabled: aiTestDevam }, aiTestDevam ? "\u23F3 Test ediliyor..." : "\u{1F50C} Ba\u011Flant\u0131y\u0131 Test Et"), aiTest === "basarili" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.green + "18", borderRadius: 8, color: C.green, fontSize: 12.5 } }, "\u2705 Yapay zeka ba\u011Flant\u0131s\u0131 \xE7al\u0131\u015F\u0131yor."), aiTest && aiTest !== "basarili" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.red + "18", borderRadius: 8, color: C.red, fontSize: 12.5 } }, "\u26A0\uFE0F ", aiTest))), sekme === "veri" && React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(KatlanirKart, { title: "\u{1F4BE} Veri Y\xF6netimi (Dosya Olarak)" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "T\xFCm verilerinizi tek bir dosya olarak indirin veya geri y\xFCkleyin."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => {
    const veri = {};
    [...ALL_DATA_KEYS, "ayarlar"].forEach((k) => veri[k] = k === "ayarlar" ? getSettings() : LS.get(k));
    const blob = new Blob([JSON.stringify(veri, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atolyepro-yedek-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } }, "\u2B07\uFE0F Yede\u011Fi \u0130ndir"), /* @__PURE__ */ React.createElement("label", { style: { ...S.btnO, cursor: "pointer" } }, "\u2B06\uFE0F Yedek Y\xFCkle", /* @__PURE__ */ React.createElement("input", { type: "file", accept: ".json", style: { display: "none" }, onChange: (e) => {
    const dosya = e.target.files[0];
    if (!dosya) return;
    const okuyucu = new FileReader();
    okuyucu.onload = (ev) => {
      try {
        const veri = JSON.parse(ev.target.result);
        Object.entries(veri).forEach(([k, v]) => k === "ayarlar" ? saveSettings(v) : LS.set(k, v));
        alert("Yedek y\xFCklendi. Sayfa yenilenecek.");
        window.location.reload();
      } catch (err) {
        alert("Dosya okunamad\u0131: " + err.message);
      }
    };
    okuyucu.readAsText(dosya);
  } })))), React.createElement(OtomatikYedeklerYoneticisi, null), /* @__PURE__ */ React.createElement(KatlanirKart, { title: "\u26A0\uFE0F Tehlikeli B\xF6lge", baslikRenk: C.red, kartStil: { ...S.card, border: `1px solid ${C.red}55` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Bu cihazdaki t\xFCm m\xFC\u015Fteri, ara\xE7, servis i\u015Fi, \xFCr\xFCn, fatura ve ayar verilerini kal\u0131c\u0131 olarak siler. Ba\u015Fka bir cihazda bulut senkronizasyonu a\xE7\u0131ksa oradaki veriler etkilenmez, ama bu cihazdan tekrar senkronize edilirse orada da silinebilir. \u0130\u015Flem geri al\u0131namaz."), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnR, padding: "9px 16px", fontSize: 13 }, onClick: () => {
    setSifreGiris("");
    setSifreHata("");
    setSifreModal(true);
  } }, "\u{1F5D1}\uFE0F T\xFCm Verileri S\u0131f\u0131rla"))),
  sifreModal && React.createElement(
    Modal,
    { title: "\u{1F512} \u015Eifre Do\u011Frulama", onClose: () => setSifreModal(false), width: 380 },
    React.createElement("div", { style: { fontSize: 12.5, color: C.muted, marginBottom: 14 } }, "T\xFCm verileri silmek i\xE7in \u015Fifreyi girin."),
    React.createElement(FG, { label: "\u015Eifre" }, React.createElement("input", { type: "password", style: S.inp, value: sifreGiris, autoFocus: true, onChange: (e) => setSifreGiris(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") tumVerileriSifirla(); } })),
    React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 12 } }, "\u{1F4A1} \u0130pucu: Gmail \u015Fifreniz"),
    sifreHata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", sifreHata),
    React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setSifreModal(false) }, "\u0130ptal"), React.createElement("button", { style: S.btnR, onClick: tumVerileriSifirla }, "T\xFCm Verileri Sil"))
  ),
  /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "\u{1F4BE} Ayarlar\u0131 Kaydet"), kaydedildi && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 12, color: C.green, fontSize: 13 } }, "\u2713 Kaydedildi"));
}
const PERSONEL_ODEME_TIP_LABEL = { haftalik: "\u{1F4B5} Haftal\u0131k Maa\u015F", avans: "\u2795 Avans", bahsis: "\u{1F381} Bah\u015Fi\u015F" };
function PersonelKarneModal({ personel, servisler, odemeler, onClose, onGuncelle }) {
  const [sekme, setSekme] = useState("genel");
  const tamamlanan = servisler.filter((s) => s.personelId === personel.id && s.durum === "tamamlandi");
  const acikIs = servisler.filter((s) => s.personelId === personel.id && s.durum !== "tamamlandi" && s.durum !== "iptal");
  const ciro = tamamlanan.reduce((t, s) => t + (+s.tutar || 0), 0);
  const kendiOdemeler = odemeler.filter((o) => o.personelId === personel.id).sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""));
  const belgeEkle = async (e) => {
    const dosyalar = Array.from(e.target.files || []);
    if (dosyalar.length === 0) return;
    const okunanlar = await Promise.all(dosyalar.map(async (d) => {
      const id = uid();
      await dosyaKaydet(id, await dosyaOku(d));
      return { id, ad: d.name, tip: d.type, tarih: today() };
    }));
    onGuncelle({ belgeler: [...(personel.belgeler || []), ...okunanlar] });
    e.target.value = "";
  };
  const belgeSil = (id) => {
    dosyaSil(id);
    onGuncelle({ belgeler: (personel.belgeler || []).filter((b) => b.id !== id) });
  };
  return React.createElement(
    Modal,
    { title: `\u{1F4CB} ${personel.ad} \u2014 Personel Karnesi`, onClose, width: 720 },
    React.createElement(TabBar, { tabs: [["genel", "\u{1F464} Genel"], ["odemeler", `\u{1F4B0} \xD6demeler (${kendiOdemeler.length})`], ["belgeler", `\u{1F4CE} Belgeler (${(personel.belgeler || []).length})`]], active: sekme, onChange: setSekme }),
    sekme === "genel" && React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Grid2,
        null,
        React.createElement(
          "div",
          { style: { ...S.card, marginBottom: 14 } },
          React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 6 } }, "Bilgiler"),
          React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: C.white } }, personel.ad),
          React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: 4 } }, personel.pozisyon || "\u2014"),
          React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: 2 } }, personel.telefon || "Telefon yok"),
          React.createElement("div", { style: { fontSize: 11.5, color: C.accent, marginTop: 4 } }, ROL_LABEL[personel.rol] || personel.rol)
        ),
        React.createElement(
          "div",
          { style: { ...S.card, marginBottom: 14 } },
          React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 6 } }, "Performans"),
          React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: C.white } }, tamamlanan.length, React.createElement("span", { style: { fontSize: 12, color: C.muted, fontWeight: 400 } }, " tamamlanan i\u015F")),
          React.createElement("div", { style: { fontSize: 13, color: C.accent, marginTop: 4 } }, fmtTL(ciro), " ciro"),
          React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: 4 } }, acikIs.length, " a\xE7\u0131k i\u015F")
        )
      ),
      personel.rol !== "patron" && React.createElement(
        "div",
        { style: S.card },
        React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 6 } }, "\xDCcret Durumu"),
        React.createElement("div", { style: { fontSize: 13, color: C.text } }, "Haftal\u0131k Maa\u015F: ", React.createElement("strong", { style: { color: C.white } }, fmtTL(personel.maas))),
        (+personel.avansBakiyesi || 0) > 0 && React.createElement("div", { style: { fontSize: 13, color: C.yellow, marginTop: 4 } }, "Avans Bakiyesi: ", fmtTL(personel.avansBakiyesi))
      )
    ),
    sekme === "odemeler" && (kendiOdemeler.length === 0 ? React.createElement("div", { style: { color: C.muted } }, "Hen\xFCz \xF6deme kayd\u0131 yok.") : React.createElement(SiraliTablo, {
      dosyaAdi: "personel_odemeleri",
      rowKey: (o) => o.id,
      rows: kendiOdemeler,
      columns: [
        { key: "tarih", baslik: "Tarih", sirala: (o) => o.tarih || "", render: (o) => fmtDate(o.tarih) },
        { key: "tip", baslik: "Tip", sirala: (o) => o.tip || "", render: (o) => PERSONEL_ODEME_TIP_LABEL[o.tip] || o.tip },
        { key: "tutar", baslik: "Tutar", sirala: (o) => +o.tutar || 0, render: (o) => fmtTL(o.tutar) }
      ]
    })),
    sekme === "belgeler" && React.createElement(
      React.Fragment,
      null,
      React.createElement("label", { style: { ...S.btnO, display: "inline-block", marginBottom: 14, cursor: "pointer" } }, "\u2795 Belge Ekle", React.createElement("input", { type: "file", multiple: true, style: { display: "none" }, onChange: belgeEkle })),
      (personel.belgeler || []).length === 0 ? React.createElement("div", { style: { color: C.muted } }, "Hen\xFCz belge eklenmedi.") : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, (personel.belgeler || []).map((b) => React.createElement(AracBelgeSatiri, { key: b.id, belge: b, onSil: belgeSil })))
    )
  );
}
function Personel() {
  const [liste, setListe] = useState(LS.get("personel"));
  const [servisler] = useState(LS.get("servisIsleri"));
  const [hesaplar] = useState(LS.get("hesaplar"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [odemeModal, setOdemeModal] = useState(null);
  const [odemeForm, setOdemeForm] = useState({});
  const [odemeHata, setOdemeHata] = useState("");
  const [odemeler, setOdemeler] = useState(LS.get("personelOdemeleri"));
  const [karneAcikId, setKarneAcikId] = useState(null);
  const [topluModAcik, setTopluModAcik] = useState(false);
  const [secilenler, setSecilenler] = useState(() => /* @__PURE__ */ new Set());
  const [whatsappIndex, setWhatsappIndex] = useState(null);
  const kaydet = () => {
    if (!(form.ad || "").trim()) {
      alert("Personel ad\u0131 zorunludur.");
      return;
    }
    const kayit = { ...form, id: form.id || uid(), rol: form.rol || "usta" };
    const yeni = form.id ? liste.map((x) => x.id === form.id ? kayit : x) : [...liste, kayit];
    LS.set("personel", yeni);
    setListe(yeni);
    setModalAcik(false);
  };
  const sil = (id) => {
    if (!confirm("Bu personel silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)")) return;
    const silinen = liste.find((x) => x.id === id);
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("personel", yeni);
    setListe(yeni);
    if (silinen) coplendir("personel", silinen);
  };
  const topluSil = (secilenler) => {
    if (secilenler.length === 0) return;
    if (!confirm(`${secilenler.length} personel silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)`)) return;
    const secilenIdler = new Set(secilenler.map((x) => x.id));
    secilenler.forEach((x) => coplendir("personel", x));
    const yeni = liste.filter((x) => !secilenIdler.has(x.id));
    LS.set("personel", yeni);
    setListe(yeni);
  };
  const netHaftalik = (p) => Math.max(0, (+p.maas || 0) - (+p.avansBakiyesi || 0));
  const odemeAc = (p, tip) => {
    setOdemeHata("");
    setOdemeForm({ hesapId: hesaplar[0] ? hesaplar[0].id : "", tarih: today(), tutar: tip === "haftalik" ? netHaftalik(p) : "" });
    setOdemeModal({ personel: p, tip });
  };
  const odemeYap = () => {
    if (!odemeForm.hesapId) {
      setOdemeHata("Hesap se\xE7imi zorunludur.");
      return;
    }
    if (!(+odemeForm.tutar > 0)) {
      setOdemeHata("Tutar 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    setOdemeHata("");
    const { personel: p, tip } = odemeModal;
    const tutar = +odemeForm.tutar;
    const tarih = odemeForm.tarih || today();
    const TIP_ACIKLAMA = { haftalik: "Haftal\u0131k maa\u015F \xF6demesi", avans: "Avans \xF6demesi", bahsis: "Bah\u015Fi\u015F \xF6demesi" };
    hesapHareketiKaydet(odemeForm.hesapId, "cikis", tutar, tarih, `${TIP_ACIKLAMA[tip]} \u2014 ${p.ad}`, "personel_" + tip, "Nakit");
    const odemeler = LS.get("personelOdemeleri");
    LS.set("personelOdemeleri", [...odemeler, { id: uid(), personelId: p.id, tarih, tip, tutar }]);
    let yeniAvans = +p.avansBakiyesi || 0;
    if (tip === "haftalik") yeniAvans = Math.max(0, yeniAvans - (+p.maas || 0));
    else if (tip === "avans") yeniAvans += tutar;
    const yeni = liste.map((x) => x.id === p.id ? { ...x, avansBakiyesi: yeniAvans } : x);
    LS.set("personel", yeni);
    setListe(yeni);
    setOdemeler(LS.get("personelOdemeleri"));
    setOdemeModal(null);
  };
  const personelGuncelle = (id, patch) => {
    const yeni = liste.map((x) => x.id === id ? { ...x, ...patch } : x);
    LS.set("personel", yeni);
    setListe(yeni);
  };
  const acikIsSayisi = (personelId) => servisler.filter((s) => s.personelId === personelId && s.durum !== "tamamlandi" && s.durum !== "iptal").length;
  const enBostaOlan = liste.length ? [...liste].sort((a, b) => acikIsSayisi(a.id) - acikIsSayisi(b.id))[0] : null;
  const tamamlananIsler = (personelId) => servisler.filter((s) => s.personelId === personelId && s.durum === "tamamlandi");
  const performans = [...liste].map((p) => {
    const isler = tamamlananIsler(p.id);
    return { p, sayi: isler.length, ciro: isler.reduce((t, s) => t + (+s.tutar || 0), 0) };
  }).sort((a, b) => b.ciro - a.ciro);
  const enYuksekCiro = performans.length ? Math.max(...performans.map((x) => x.ciro), 1) : 1;
  const karneAcik = karneAcikId ? liste.find((x) => x.id === karneAcikId) : null;
  const personelIceAktar = (kayitlar) => {
    const yeni = [...liste, ...kayitlar.map((k) => ({ id: uid(), ad: k.ad, pozisyon: k.pozisyon || "", telefon: k.telefon || "", rol: k.rol || "usta", maas: +k.maas || 0 }))];
    LS.set("personel", yeni);
    setListe(yeni);
    alert(`${kayitlar.length} personel eklendi.`);
  };
  const secToggle = (id) => setSecilenler((prev) => {
    const yeni = new Set(prev);
    if (yeni.has(id)) yeni.delete(id); else yeni.add(id);
    return yeni;
  });
  const secilenPersonel = liste.filter((p) => secilenler.has(p.id));
  const topluWhatsappBaslat = () => {
    const p = secilenPersonel[0];
    if (!p) return;
    setWhatsappIndex(0);
    if (p.telefon) whatsappLinkAc(p.telefon, `Merhaba ${p.ad}, size ulaşmak istedik. — As Egzoz & Makine`);
  };
  const topluWhatsappSonraki = () => {
    const sonraki = whatsappIndex + 1;
    if (sonraki >= secilenPersonel.length) {
      setWhatsappIndex(null);
      return;
    }
    setWhatsappIndex(sonraki);
    const p = secilenPersonel[sonraki];
    if (p.telefon) whatsappLinkAc(p.telefon, `Merhaba ${p.ad}, size ulaşmak istedik. — As Egzoz & Makine`);
  };
  const topluSilTikla = () => {
    topluSil(secilenPersonel);
    setSecilenler(/* @__PURE__ */ new Set());
    setWhatsappIndex(null);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F9D1}\u200D\u{1F527} Personel"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(IceAktarButonu, { alanlar: [{ baslik: "Ad", key: "ad", zorunlu: true }, { baslik: "Pozisyon", key: "pozisyon" }, { baslik: "Telefon", key: "telefon" }, { baslik: "Haftal\u0131k Maa\u015F", key: "maas" }], onIceAktar: personelIceAktar }), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setForm({});
    setModalAcik(true);
  } }, "\u2795 Yeni Personel"), /* @__PURE__ */ React.createElement("button", { style: topluModAcik ? S.btn() : S.btnO, onClick: () => { setTopluModAcik((v) => !v); setSecilenler(/* @__PURE__ */ new Set()); setWhatsappIndex(null); } }, "\u2611\ufe0f Toplu \u0130\u015flem"))), topluModAcik && secilenPersonel.length > 0 && /* @__PURE__ */ React.createElement(
    "div",
    { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "8px 14px", background: C.accent + "18", borderRadius: 8, marginBottom: 14 } },
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.text } }, secilenPersonel.length, " personel se\u00e7ili"),
    /* @__PURE__ */ React.createElement(
      "div",
      { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } },
      whatsappIndex !== null && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: C.muted } }, "WhatsApp: ", whatsappIndex + 1, "/", secilenPersonel.length),
      whatsappIndex === null
        ? /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }, onClick: topluWhatsappBaslat }, /* @__PURE__ */ React.createElement(WhatsAppIkon, null), "WhatsApp G\u00f6nder")
        : /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: topluWhatsappSonraki }, "Sonraki \u25b6"),
      /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: topluSilTikla }, "\ud83d\uddd1\ufe0f Se\u00e7ilenleri Sil")
    )
  ), liste.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { ...S.card, borderTop: `3px solid ${C.accent}` } }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u2696\uFE0F Anl\u0131k \u0130\u015F Y\xFCk\xFC"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, 'Her personelin \u015Fu an "Bekliyor" veya "Devam Ediyor" durumundaki a\xE7\u0131k i\u015F say\u0131s\u0131. Yeni bir i\u015F atarken en bo\u015Fta olan\u0131 tercih edebilirsiniz.'), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, liste.map((p) => {
    const sayi = acikIsSayisi(p.id);
    return /* @__PURE__ */ React.createElement("div", { key: p.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: C.surface, borderRadius: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text } }, p.ad, " ", enBostaOlan && enBostaOlan.id === p.id && sayi === 0 && /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(C.green), marginLeft: 8, fontSize: 10 } }, "En bo\u015Fta")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: sayi >= 3 ? C.red : C.white } }, sayi, " a\xE7\u0131k i\u015F"));
  }))), liste.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { ...S.card, borderTop: `3px solid ${C.green}` } }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4C8} Teknisyen Performans Raporu"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Tamamlanm\u0131\u015F i\u015Flere g\xF6re personel ba\u015F\u0131na i\u015F say\u0131s\u0131 ve ciro."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, performans.map(({ p, sayi, ciro }) => /* @__PURE__ */ React.createElement("div", { key: p.id }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text, fontWeight: 600 } }, p.ad), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.muted } }, sayi, " i\u015F \u2022 ", /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, fmtTL(ciro)))), /* @__PURE__ */ React.createElement("div", { style: { height: 6, background: C.surface, borderRadius: 3, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${ciro / enYuksekCiro * 100}%`, background: C.green, borderRadius: 3 } })))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 } }, liste.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Hen\xFCz personel eklenmedi."), liste.map(
    (p) => /* @__PURE__ */ React.createElement("div", { key: p.id, style: S.card }, topluModAcik && /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: secilenler.has(p.id), onChange: () => secToggle(p.id), style: { float: "right", cursor: "pointer", width: 16, height: 16 } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 4 } }, p.ad), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.accent, marginBottom: 8 } }, p.pozisyon || "\u2014"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 2 } }, p.telefon || "Telefon yok"), p.rol === "patron" ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 12 } }, "\u{1F451} Patron \u2014 maa\u015F tan\u0131mlanmaz, gelirler do\u011Frudan kendisinindir.") : /* @__PURE__ */ React.createElement(React.Fragment, null, p.maas > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 2 } }, "Haftal\u0131k Maa\u015F: ", fmtTL(p.maas)), (+p.avansBakiyesi || 0) > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.yellow, marginBottom: 2 } }, "Avans Bakiyesi: ", fmtTL(p.avansBakiyesi)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 12 } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } }, p.maas > 0 && /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => odemeAc(p, "haftalik") }, "\u{1F4B5} Haftal\u0131k \xD6de"), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => odemeAc(p, "avans") }, "\u2795 Avans Ver"), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => odemeAc(p, "bahsis") }, "\u{1F381} Bah\u015Fi\u015F Ver"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 4 } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, flex: 1 }, onClick: () => setKarneAcikId(p.id) }, "\u{1F4CB} Karne"), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "7px 10px" }, onClick: () => {
      setForm(p);
      setModalAcik(true);
    } }, "\u270F\uFE0F"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => sil(p.id) }, "\u{1F5D1}\uFE0F")))
  )), modalAcik && /* @__PURE__ */ React.createElement(Modal, { title: form.id ? "Personeli D\xFCzenle" : "Yeni Personel", onClose: () => setModalAcik(false), width: 420 }, /* @__PURE__ */ React.createElement(FG, { label: "Ad Soyad" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.ad || "", onChange: (e) => setForm((f) => ({ ...f, ad: e.target.value })), autoFocus: true })), /* @__PURE__ */ React.createElement(FG, { label: "Pozisyon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.pozisyon || "", onChange: (e) => setForm((f) => ({ ...f, pozisyon: e.target.value })), placeholder: "\xD6rn: Ustaba\u015F\u0131, Kaynak\xE7\u0131, Tamirci" })), /* @__PURE__ */ React.createElement(FG, { label: "Sistem Yetkisi (Google ile giri\u015Fte g\xF6rebilecekleri)" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.rol || "usta", onChange: (e) => setForm((f) => ({ ...f, rol: e.target.value })) }, Object.entries(ROL_LABEL).map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l)))), /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.telefon || "", onChange: (e) => setForm((f) => ({ ...f, telefon: e.target.value })) })), (form.rol || "usta") !== "patron" && /* @__PURE__ */ React.createElement(FG, { label: "Haftal\u0131k Maa\u015F (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.maas || "", onChange: (e) => setForm((f) => ({ ...f, maas: +e.target.value })) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))), odemeModal && React.createElement(
    Modal,
    { title: odemeModal.tip === "haftalik" ? `\u{1F4B5} ${odemeModal.personel.ad} \u2014 Haftal\u0131k \xD6de` : odemeModal.tip === "avans" ? `\u2795 ${odemeModal.personel.ad} \u2014 Avans Ver` : `\u{1F381} ${odemeModal.personel.ad} \u2014 Bah\u015Fi\u015F Ver`, onClose: () => setOdemeModal(null), width: 400 },
    odemeModal.tip === "haftalik" && (+odemeModal.personel.avansBakiyesi || 0) > 0 && React.createElement("div", { style: { fontSize: 12, color: C.yellow, marginBottom: 12 } }, "\u26A0\uFE0F Bu personelin ", fmtTL(odemeModal.personel.avansBakiyesi), " avans bakiyesi haftal\u0131k maa\u015Ftan d\xFC\u015F\xFCld\xFC."),
    React.createElement(FG, { label: "Tutar (\u20BA)" }, React.createElement("input", { type: "number", style: S.inp, value: odemeForm.tutar ?? "", onChange: (e) => setOdemeForm((f) => ({ ...f, tutar: +e.target.value })) })),
    React.createElement(FG, { label: "Hesap (\xE7\u0131k\u0131\u015F)" }, React.createElement("select", { style: S.sel, value: odemeForm.hesapId || "", onChange: (e) => setOdemeForm((f) => ({ ...f, hesapId: e.target.value })) }, hesaplar.length === 0 && React.createElement("option", { value: "" }, "\xD6nce Muhasebe'den hesap ekleyin"), hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad)))),
    React.createElement(FG, { label: "Tarih" }, React.createElement("input", { type: "date", style: S.inp, value: odemeForm.tarih || "", onChange: (e) => setOdemeForm((f) => ({ ...f, tarih: e.target.value })) })),
    odemeHata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", odemeHata),
    React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setOdemeModal(null) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: odemeYap }, "Onayla"))
  ), karneAcik && React.createElement(PersonelKarneModal, { personel: karneAcik, servisler, odemeler, onClose: () => setKarneAcikId(null), onGuncelle: (patch) => personelGuncelle(karneAcik.id, patch) }));
}
function Araclar({ hedef, hedefTemizle } = {}) {
  const [liste, setListe] = useState(LS.get("araclar"));
  const [cariler, setCariler] = useState(LS.get("cariler"));
  const [servisler] = useState(LS.get("servisIsleri"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [detayAracId, setDetayAracId] = useState(null);
  const [arama, setArama] = useState("");
  useEffect(() => {
    if (!hedef) return;
    if (hedef.tip === "yeni_arac") {
      setForm({});
      setModalAcik(true);
    } else if (hedef.tip === "ac_arac_detay") {
      setDetayAracId(hedef.id);
    }
    hedefTemizle && hedefTemizle();
  }, [hedef]);
  const kaydet = () => {
    const plaka = plakaBirlestir(form.plakaIl, form.plakaHarf, form.plakaRakam);
    if (!plaka.trim()) {
      alert("Plaka zorunludur.");
      return;
    }
    const normalize = plakaNormalize(plaka);
    const cakisan = liste.find((a) => a.id !== form.id && plakaNormalize(a.plaka) === normalize);
    if (cakisan) {
      alert(`Bu plaka zaten kayıtlı: ${cakisan.plaka}`);
      return;
    }
    let cariId = form.musteriId || "";
    let yeniCariler = cariler;
    if ((form.musteriAdi || "").trim()) {
      const cariBilgisi = { ad: form.musteriAdi.trim(), tel: (form.musteriTel || "").trim(), adres: (form.musteriAdres || "").trim() };
      if (cariId && cariler.some((c) => c.id === cariId)) {
        yeniCariler = cariler.map((c) => c.id === cariId ? { ...c, ...cariBilgisi } : c);
      } else {
        const yeniCari = { id: uid(), ...cariBilgisi };
        cariId = yeniCari.id;
        yeniCariler = [...cariler, yeniCari];
      }
      LS.set("cariler", yeniCariler);
      setCariler(yeniCariler);
    }
    const kayit = { ...form, id: form.id || uid(), plaka: normalize, musteriId: cariId };
    delete kayit.musteriAdi;
    delete kayit.musteriTel;
    delete kayit.musteriAdres;
    delete kayit.plakaIl;
    delete kayit.plakaHarf;
    delete kayit.plakaRakam;
    const yeni = form.id ? liste.map((x) => x.id === form.id ? kayit : x) : [...liste, kayit];
    LS.set("araclar", yeni);
    setListe(yeni);
    setModalAcik(false);
  };
  const sil = (id) => {
    if (servisler.some((s) => s.aracId === id)) {
      alert("Bu araca ait servis kayıtları var, önce onları düzenleyin/silin.");
      return;
    }
    if (!confirm("Bu araç silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)")) return;
    const silinen = liste.find((x) => x.id === id);
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("araclar", yeni);
    setListe(yeni);
    if (silinen) coplendir("araclar", silinen);
  };
  const topluSil = (secilenler) => {
    const engellenen = secilenler.filter((a) => servisler.some((s) => s.aracId === a.id));
    if (engellenen.length > 0) {
      alert(`${engellenen.length} araca ait servis kayıtları var, önce onları düzenleyin/silin. Diğerleri silinecek.`);
    }
    const silinebilenler = secilenler.filter((a) => !engellenen.includes(a));
    if (silinebilenler.length === 0) return;
    if (!confirm(`${silinebilenler.length} araç silinsin mi? (Çöp kutusundan geri yükleyebilirsiniz)`)) return;
    const silinebilenIdler = new Set(silinebilenler.map((x) => x.id));
    silinebilenler.forEach((x) => coplendir("araclar", x));
    const yeni = liste.filter((x) => !silinebilenIdler.has(x.id));
    LS.set("araclar", yeni);
    setListe(yeni);
  };
  const aracDuzenle = (a) => {
    const sahip = cariler.find((c) => c.id === a.musteriId) || {};
    const p = plakaParcala(a.plaka);
    setForm({ ...a, musteriAdi: sahip.ad || "", musteriTel: sahip.tel || "", musteriAdres: sahip.adres || "", plakaIl: p.il, plakaHarf: p.harf, plakaRakam: p.rakam });
    setModalAcik(true);
  };
  const aracGuncelle = (aracId, patch) => {
    const yeni = liste.map((x) => x.id === aracId ? { ...x, ...patch } : x);
    LS.set("araclar", yeni);
    setListe(yeni);
  };
  const aracServisleri = (aracId) => servisler.filter((s) => s.aracId === aracId).sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""));
  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const filtreli = !aramaMetni ? liste : liste.filter((a) => (a.plaka + " " + (a.marka || "") + " " + (a.model || "") + " " + cariAd(cariler, a.musteriId)).toLocaleLowerCase("tr-TR").includes(aramaMetni));
  const canliPlaka = plakaBirlestir(form.plakaIl, form.plakaHarf, form.plakaRakam);
  const canliPlakaCakisan = canliPlaka.trim() ? liste.find((a) => a.id !== form.id && plakaNormalize(a.plaka) === plakaNormalize(canliPlaka)) : null;
  const detayArac = detayAracId ? liste.find((a) => a.id === detayAracId) : null;
  const aracIceAktar = (kayitlar) => {
    const yeniKayitlar = [];
    let atlanan = 0;
    kayitlar.forEach((k) => {
      const normalize = plakaNormalize(k.plaka);
      if (!normalize || liste.some((a) => plakaNormalize(a.plaka) === normalize) || yeniKayitlar.some((a) => plakaNormalize(a.plaka) === normalize)) {
        atlanan++;
        return;
      }
      yeniKayitlar.push({ id: uid(), plaka: normalize, marka: k.marka || "", model: k.model || "", yil: k.yil || "" });
    });
    const yeni = [...liste, ...yeniKayitlar];
    LS.set("araclar", yeni);
    setListe(yeni);
    alert(`${yeniKayitlar.length} araç eklendi.${atlanan > 0 ? ` ${atlanan} kayıt (plaka boş veya zaten kayıtlı) atlandı.` : ""}`);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "🚗 Araç Kayıtları"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(IceAktarButonu, { alanlar: [{ baslik: "Plaka", key: "plaka", zorunlu: true }, { baslik: "Marka", key: "marka" }, { baslik: "Model", key: "model" }, { baslik: "Yıl", key: "yil" }], onIceAktar: aracIceAktar }), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setForm({});
    setModalAcik(true);
  } }, "➕ Yeni Araç"))), /* @__PURE__ */ React.createElement(Grid4, null,
    /* @__PURE__ */ React.createElement(StatCard, { color: C.accent, icon: "🚗", value: liste.length, label: "Toplam Araç" }),
    /* @__PURE__ */ React.createElement(StatCard, { color: C.green, icon: "🔧", value: servisler.filter((s) => s.durum !== "iptal").length, label: "Toplam Servis Kaydı" })
  ), /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, marginBottom: 16, maxWidth: 360 }, placeholder: "🔍 Plaka, marka veya müşteri ara…", value: arama, onChange: (e) => setArama(e.target.value) }), liste.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { ...S.card, textAlign: "center", padding: 32 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, marginBottom: 10 } }, "🚗"), /* @__PURE__ */ React.createElement("div", { style: { color: C.white, fontWeight: 700, marginBottom: 6 } }, "Henüz araç eklenmedi"), /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 12.5, marginBottom: 14 } }, "İlk aracınızı ekleyerek başlayın."), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => { setForm({}); setModalAcik(true); } }, "➕ Yeni Araç Ekle")) : /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement(SiraliTablo, {
  dosyaAdi: "araclar",
  rowKey: (a) => a.id,
  bosMesaj: "Kayıt bulunamadı.",
  rows: filtreli,
  columns: [
    { key: "plaka", baslik: "Plaka", sirala: (a) => a.plaka || "", render: (a) => {
      const sadakat = aracSadakatDurumu(a.id, servisler);
      return React.createElement("div", null,
        React.createElement("strong", { style: { color: C.accent, cursor: "pointer", textDecoration: "underline" }, title: "Araç sicilini görüntüle (fotoğraf, belge, servis geçmişi)", onClick: () => setDetayAracId(a.id) }, a.plaka),
        sadakat && React.createElement("div", { title: sadakat.aciklama, style: { fontSize: 10.5, color: sadakat.renk, marginTop: 2 } }, sadakat.etiket)
      );
    } },
    { key: "grup", baslik: "Grup", sirala: (a) => ARAC_GRUP_LABEL[a.grup || "otomobil"] || "", render: (a) => ARAC_GRUP_LABEL[a.grup || "otomobil"] || ARAC_GRUP_LABEL.otomobil },
    { key: "markaModel", baslik: "Marka/Model", sirala: (a) => `${a.marka || ""} ${a.model || ""}`, render: (a) => React.createElement(React.Fragment, null, a.marka, " ", a.model) },
    { key: "yil", baslik: "Yıl", sirala: (a) => a.yil || "", render: (a) => a.yil || "—" },
    { key: "sahibi", baslik: "Sahibi", sirala: (a) => aracSahibiAd(cariler, a.musteriId), render: (a) => aracSahibiAd(cariler, a.musteriId) },
    { key: "gecmis", baslik: "Servis Geçmişi", sirala: (a) => aracServisleri(a.id).length, render: (a) => { const gecmis = aracServisleri(a.id); return React.createElement("span", { style: { ...S.badge(C.blue), cursor: "pointer" }, onClick: () => setDetayAracId(a.id) }, gecmis.length, " servis kaydı"); } },
    { key: "islemler", baslik: "", render: (a) => React.createElement("div", { style: { display: "flex", gap: 6 } }, React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => aracDuzenle(a) }, "✏️"), React.createElement("button", { style: S.btnR, onClick: () => sil(a.id) }, "🗑️")) }
  ],
  topluIslem: {
    onSil: topluSil,
    whatsapp: (a) => {
      const sahip = cariler.find((c) => c.id === a.musteriId);
      if (!sahip || !sahip.tel) return null;
      return { telefon: sahip.tel, mesaj: `Merhaba ${sahip.ad}, ${a.plaka} plakalı aracınızla ilgili size ulaşmak istedik. — As Egzoz & Makine` };
    }
  }
})), modalAcik && /* @__PURE__ */ React.createElement(Modal, { title: form.id ? "Aracı Düzenle" : "Yeni Araç", onClose: () => setModalAcik(false), width: 480 }, !form.id && /* @__PURE__ */ React.createElement(PlakaKameraTarayici, { onSonuc: (deger) => {
    const p = plakaParcala(deger);
    setForm((f) => ({ ...f, plakaIl: p.il, plakaHarf: p.harf, plakaRakam: p.rakam }));
  } }), /* @__PURE__ */ React.createElement(FG, { label: "Plaka" }, /* @__PURE__ */ React.createElement(PlakaGirisi, { il: form.plakaIl, harf: form.plakaHarf, rakam: form.plakaRakam, onIl: (v) => setForm((f) => ({ ...f, plakaIl: v })), onHarf: (v) => setForm((f) => ({ ...f, plakaHarf: v })), onRakam: (v) => setForm((f) => ({ ...f, plakaRakam: v })) })), canliPlakaCakisan && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.red, marginTop: -8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, "⚠️ Bu plaka zaten kayıtlı: ", canliPlakaCakisan.plaka, /* @__PURE__ */ React.createElement("button", { type: "button", style: { ...S.btnO, padding: "3px 10px", fontSize: 11 }, onClick: () => { setModalAcik(false); setDetayAracId(canliPlakaCakisan.id); } }, "Aracı Seç")), /* @__PURE__ */ React.createElement(MarkaModelSecici, { grup: form.grup || "otomobil", marka: form.marka, model: form.model, onGrup: (v) => setForm((f) => ({ ...f, grup: v, marka: "", model: "" })), onMarka: (v) => setForm((f) => ({ ...f, marka: v })), onModel: (v) => setForm((f) => ({ ...f, model: v })) }), /* @__PURE__ */ React.createElement(FG, { label: "Model Yılı" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.yil || "", onChange: (e) => setForm((f) => ({ ...f, yil: +e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Şasi No (opsiyonel)" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.sasiNo || "", onChange: (e) => setForm((f) => ({ ...f, sasiNo: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { style: { ...S.secTitle, fontSize: 13, marginTop: 4 } }, "👤 Araç Sahibi (Müşteri/Firma, opsiyonel)"), /* @__PURE__ */ React.createElement(FG, { label: "Müşteri / Firma Adı (opsiyonel)" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.musteriAdi || "", onChange: (e) => setForm((f) => ({ ...f, musteriAdi: e.target.value })) })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.musteriTel || "", onChange: (e) => setForm((f) => ({ ...f, musteriTel: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.musteriAdres || "", onChange: (e) => setForm((f) => ({ ...f, musteriAdres: e.target.value })) }))), /* @__PURE__ */ React.createElement(BenzerCariUyarisi, { cariler, ad: form.musteriAdi, tel: form.musteriTel, haricId: form.musteriId }), /* @__PURE__ */ React.createElement(FG, { label: "Notlar" }, /* @__PURE__ */ React.createElement("textarea", { style: { ...S.inp, minHeight: 60 }, value: form.notlar || "", onChange: (e) => setForm((f) => ({ ...f, notlar: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "İptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))), detayArac && /* @__PURE__ */ React.createElement(AracDetayModal, { arac: detayArac, cariler, servisler: aracServisleri(detayArac.id), onClose: () => setDetayAracId(null), onGuncelle: (patch) => aracGuncelle(detayArac.id, patch) }));
}
function AracFotoThumb({ foto, onSil }) {
  const [veri, setVeri] = useState(null);
  useEffect(() => {
    let iptal = false;
    dosyaGetir(foto.id).then((v) => {
      if (!iptal) setVeri(v);
    });
    return () => {
      iptal = true;
    };
  }, [foto.id]);
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.surface, minHeight: 110 } }, veri ? /* @__PURE__ */ React.createElement("img", { src: veri, alt: foto.ad, style: { width: "100%", height: 110, objectFit: "cover", display: "block" } }) : /* @__PURE__ */ React.createElement("div", { style: { height: 110, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 11 } }, "Y\xFCkleniyor…"), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnR, position: "absolute", top: 4, right: 4, padding: "2px 6px", fontSize: 10, background: C.card }, onClick: () => onSil(foto.id) }, "\u{1F5D1}️"));
}
function AracBelgeSatiri({ belge, onSil }) {
  const [veri, setVeri] = useState(null);
  useEffect(() => {
    let iptal = false;
    dosyaGetir(belge.id).then((v) => {
      if (!iptal) setVeri(v);
    });
    return () => {
      iptal = true;
    };
  }, [belge.id]);
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: C.surface, borderRadius: 8 } }, veri ? /* @__PURE__ */ React.createElement("a", { href: veri, download: belge.ad, style: { color: C.blue, fontSize: 12.5, textDecoration: "none" } }, "\u{1F4C4} ", belge.ad) : /* @__PURE__ */ React.createElement("span", { style: { color: C.muted, fontSize: 12.5 } }, "\u{1F4C4} ", belge.ad, " (y\xFCkleniyor…)"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => onSil(belge.id) }, "\u{1F5D1}️"));
}
function AracDetayModal({ arac, cariler, servisler, onClose, onGuncelle }) {
  const [sekme, setSekme] = useState("servis");
  const sahip = cariler.find((c) => c.id === arac.musteriId);
  const fotoEkle = async (e) => {
    const dosyalar = Array.from(e.target.files || []);
    if (dosyalar.length === 0) return;
    const okunanlar = await Promise.all(dosyalar.map(async (d) => {
      const id = uid();
      await dosyaKaydet(id, await dosyaOku(d));
      return { id, ad: d.name, tarih: today() };
    }));
    onGuncelle({ fotograflar: [...(arac.fotograflar || []), ...okunanlar] });
    e.target.value = "";
  };
  const fotoSil = (id) => {
    dosyaSil(id);
    onGuncelle({ fotograflar: (arac.fotograflar || []).filter((f) => f.id !== id) });
  };
  const belgeEkle = async (e) => {
    const dosyalar = Array.from(e.target.files || []);
    if (dosyalar.length === 0) return;
    const okunanlar = await Promise.all(dosyalar.map(async (d) => {
      const id = uid();
      await dosyaKaydet(id, await dosyaOku(d));
      return { id, ad: d.name, tip: d.type, tarih: today() };
    }));
    onGuncelle({ belgeler: [...(arac.belgeler || []), ...okunanlar] });
    e.target.value = "";
  };
  const belgeSil = (id) => {
    dosyaSil(id);
    onGuncelle({ belgeler: (arac.belgeler || []).filter((b) => b.id !== id) });
  };
  return /* @__PURE__ */ React.createElement(
    Modal,
    { title: `🚗 ${arac.plaka} — Araç Sicili`, onClose, width: 720 },
    /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement("div", { style: { ...S.card, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 6 } }, "Araç"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: C.white } }, arac.marka || "—", " ", arac.model || "", arac.yil ? ` (${arac.yil})` : ""), arac.sasiNo && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: 4 } }, "Şasi: ", arac.sasiNo), arac.notlar && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: 4 } }, arac.notlar)), /* @__PURE__ */ React.createElement("div", { style: { ...S.card, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginBottom: 6 } }, "👤 Müşteri / Firma"), sahip ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: C.white } }, sahip.ad), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: 4 } }, sahip.tel || "Telefon yok"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginTop: 2 } }, sahip.adres || "Adres yok")) : /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: C.yellow } }, "⚠️ Sahip bilgisi tanımlı değil."))),
    /* @__PURE__ */ React.createElement(TabBar, { tabs: [["servis", `🧾 Servis Geçmişi (${servisler.length})`], ["foto", `🖼️ Fotoğraflar (${(arac.fotograflar || []).length})`], ["belge", `📎 Belgeler (${(arac.belgeler || []).length})`]], active: sekme, onChange: setSekme }),
    sekme === "servis" && (servisler.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Bu araca ait servis kaydı yok.") : /* @__PURE__ */ React.createElement(SiraliTablo, {
      dosyaAdi: "arac_servis_gecmisi",
      rowKey: (s) => s.id,
      rows: servisler,
      columns: [
        { key: "tarih", baslik: "Tarih", sirala: (s) => s.tarih || "", render: (s) => fmtDate(s.tarih) },
        { key: "hizmet", baslik: "Hizmet", sirala: (s) => HIZMET_TIP_LABEL[s.hizmetTuru] || "", render: (s) => React.createElement(React.Fragment, null, HIZMET_TIP_LABEL[s.hizmetTuru], s.aciklama ? ` — ${s.aciklama}` : "") },
        { key: "tutar", baslik: "Tutar", sirala: (s) => +s.tutar || 0, render: (s) => fmtTL(s.tutar) },
        { key: "odeme", baslik: "Ödeme Durumu", sirala: (s) => servisOdemeDurumu(s), render: (s) => {
          const durum = servisOdemeDurumu(s);
          return React.createElement("div", null,
            React.createElement(Badge, { d: durum, map: SERVIS_ODEME_LABEL, renk: SERVIS_ODEME_RENK }),
            durum === "kismi" && React.createElement("div", { style: { fontSize: 10.5, color: C.muted, marginTop: 2 } }, "Kalan: ", fmtTL(servisKalanTutar(s)))
          );
        } }
      ]
    })),
    sekme === "foto" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("label", { style: { ...S.btnO, display: "inline-block", marginBottom: 14, cursor: "pointer" } }, "➕ Fotoğraf Ekle", /* @__PURE__ */ React.createElement("input", { type: "file", accept: "image/*", multiple: true, style: { display: "none" }, onChange: fotoEkle })), (arac.fotograflar || []).length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Henüz fotoğraf eklenmedi.") : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10 } }, (arac.fotograflar || []).map((f) => /* @__PURE__ */ React.createElement(AracFotoThumb, { key: f.id, foto: f, onSil: fotoSil })))),
    sekme === "belge" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("label", { style: { ...S.btnO, display: "inline-block", marginBottom: 14, cursor: "pointer" } }, "➕ Belge Ekle", /* @__PURE__ */ React.createElement("input", { type: "file", multiple: true, style: { display: "none" }, onChange: belgeEkle })), (arac.belgeler || []).length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Henüz belge eklenmedi.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, (arac.belgeler || []).map((b) => /* @__PURE__ */ React.createElement(AracBelgeSatiri, { key: b.id, belge: b, onSil: belgeSil }))))
  );
}
function GirisEkrani({ onGiris }) {
  const butonRef = useRef(null);
  const [hata, setHata] = useState("");
  const clientId = getSettings().googleClientId;
  useEffect(() => {
    if (!clientId || !window.google || !window.google.accounts) return;
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (yanit) => {
          try {
            const parcalar = yanit.credential.split(".");
            const bilgi = JSON.parse(atob(parcalar[1].replace(/-/g, "+").replace(/_/g, "/")));
            const kullanici = { ad: bilgi.name, email: bilgi.email, foto: bilgi.picture };
            sessionStorage.setItem("fp_google_kullanici", JSON.stringify(kullanici));
            onGiris(kullanici);
          } catch (e) {
            setHata("Giri\u015F bilgisi okunamad\u0131: " + e.message);
          }
        }
      });
      if (butonRef.current) {
        window.google.accounts.id.renderButton(butonRef.current, { theme: "filled_black", size: "large", text: "signin_with", shape: "pill" });
      }
    } catch (e) {
      setHata("Google giri\u015F sistemi ba\u015Flat\u0131lamad\u0131: " + e.message);
    }
  }, [clientId]);
  if (!clientId) {
    return /* @__PURE__ */ React.createElement("div", { className: "fp-vh-fix", style: { display: "flex", alignItems: "center", justifyContent: "center", background: C.bg } }, /* @__PURE__ */ React.createElement("div", { style: { ...S.card, maxWidth: 420, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, marginBottom: 10 } }, "\u{1F527}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 8 } }, "Google ile Giri\u015F Kurulmad\u0131"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.muted } }, "Ayarlar \u2192 Google Giri\u015Fi'nden bir Client ID girip kaydedin. O zamana kadar uygulamaya do\u011Frudan devam edebilirsiniz."), /* @__PURE__ */ React.createElement("button", { style: { ...S.btn(), marginTop: 16 }, onClick: () => onGiris(null) }, "Google's\u0131z Devam Et")));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "fp-vh-fix", style: { display: "flex", alignItems: "center", justifyContent: "center", background: C.bg } }, /* @__PURE__ */ React.createElement("div", { style: { ...S.card, maxWidth: 380, textAlign: "center", padding: 32 } }, /* @__PURE__ */ React.createElement(LogoImg, { size: 72, style: { marginBottom: 12 } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 4 } }, getSettings().firmaAdi), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 24 } }, "Devam etmek i\xE7in Google hesab\u0131n\u0131zla giri\u015F yap\u0131n"), /* @__PURE__ */ React.createElement("div", { ref: butonRef, style: { display: "flex", justifyContent: "center" } }), hata && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, color: C.red, fontSize: 12 } }, "\u26A0\uFE0F ", hata)));
}
function CopKutusu() {
  const [liste, setListe] = useState(LS.get("copKutusu"));
  const [secilenler, setSecilenler] = useState(() => /* @__PURE__ */ new Set());
  const guncelle = () => setListe(LS.get("copKutusu"));
  const geriYukle = (id) => {
    copKutusundanGeriYukle(id);
    guncelle();
  };
  const kaliciSil = (id) => {
    if (!confirm("Bu kayıt kalıcı olarak silinsin mi? Bu işlem geri alınamaz.")) return;
    copKutusundanKaliciSil(id);
    guncelle();
  };
  const kalanGun = (oge) => Math.max(0, COP_KUTUSU_SAKLAMA_GUNU - Math.floor((new Date(today()) - new Date(oge.silinmeTarihi)) / 864e5));
  const kaydiEtiketle = (oge) => {
    const k = oge.kayit || {};
    return k.ad || k.isEmriNo || k.plaka || k.baslik || k.faturaNo || k.aciklama || "Kayıt";
  };
  const siraliListe = [...liste].sort((a, b) => (b.silinmeTarihi || "").localeCompare(a.silinmeTarihi || ""));
  const secToggle = (id) => setSecilenler((prev) => {
    const yeni = new Set(prev);
    if (yeni.has(id)) yeni.delete(id); else yeni.add(id);
    return yeni;
  });
  const hepsiSecili = siraliListe.length > 0 && siraliListe.every((oge) => secilenler.has(oge.id));
  const hepsiniSecToggle = () => setSecilenler(() => hepsiSecili ? /* @__PURE__ */ new Set() : new Set(siraliListe.map((oge) => oge.id)));
  const secilenSayisi = secilenler.size;
  const topluGeriYukle = () => {
    if (secilenSayisi === 0) return;
    secilenler.forEach((id) => copKutusundanGeriYukle(id));
    setSecilenler(/* @__PURE__ */ new Set());
    guncelle();
  };
  const topluKaliciSil = () => {
    if (secilenSayisi === 0) return;
    if (!confirm(`${secilenSayisi} kayıt kalıcı olarak silinsin mi? Bu işlem geri alınamaz.`)) return;
    secilenler.forEach((id) => copKutusundanKaliciSil(id));
    setSecilenler(/* @__PURE__ */ new Set());
    guncelle();
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "fp-fade" },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 16 } }, "🗑️ Çöp Kutusu"),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: C.muted, marginBottom: 16 } }, "Silinen kayıtlar burada ", COP_KUTUSU_SAKLAMA_GUNU, " g\xFCn boyunca tutulur, isterseniz geri y\xFCkleyebilirsiniz. Bu s\xFCre sonunda otomatik olarak kalıcı silinir."),
    siraliListe.length === 0
      ? /* @__PURE__ */ React.createElement("div", { style: { ...S.card, textAlign: "center", padding: 32 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, marginBottom: 10 } }, "🗑️"), /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Çöp kutusu boş."))
      : /* @__PURE__ */ React.createElement(React.Fragment, null,
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 } },
            /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.text, cursor: "pointer" } },
              /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: hepsiSecili, onChange: hepsiniSecToggle, style: { cursor: "pointer" } }),
              "Tümünü Seç"
            ),
            secilenSayisi > 0 && /* @__PURE__ */ React.createElement(
              "div",
              { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "8px 14px", background: C.accent + "18", borderRadius: 8 } },
              /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.text } }, secilenSayisi, " kayıt seçili"),
              /* @__PURE__ */ React.createElement(
                "div",
                { style: { display: "flex", gap: 8 } },
                /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: topluGeriYukle }, "♻️ Seçilenleri Geri Yükle"),
                /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: topluKaliciSil }, "🗑️ Seçilenleri Kalıcı Sil")
              )
            )
          ),
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, siraliListe.map((oge) => /* @__PURE__ */ React.createElement(
            "div",
            { key: oge.id, style: { ...S.card, marginBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 } },
            /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 10 } },
              /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: secilenler.has(oge.id), onChange: () => secToggle(oge.id), style: { marginTop: 4, cursor: "pointer", width: 16, height: 16, flexShrink: 0 } }),
              /* @__PURE__ */ React.createElement("div", null,
                /* @__PURE__ */ React.createElement("span", { style: S.badge(C.muted) }, KOLEKSIYON_LABEL[oge.koleksiyon] || oge.koleksiyon),
                /* @__PURE__ */ React.createElement("strong", { style: { color: C.white, marginLeft: 8 } }, kaydiEtiketle(oge)),
                /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 4 } }, "Silindi: ", fmtDate(oge.silinmeTarihi), " — ", kalanGun(oge), " g\xFCn sonra kalıcı silinir")
              )
            ),
            /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } },
              /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => geriYukle(oge.id) }, "♻️ Geri Yükle"),
              /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => kaliciSil(oge.id) }, "🗑️ Kalıcı Sil")
            )
          )))
        )
  );
}
const SAYFALAR = [
  { id: "dashboard", label: "Genel Bak\u0131\u015F", icon: "\u{1F4CA}", comp: Dashboard },
  { id: "takvim", label: "Randevu Takvimi", icon: "\u{1F4C5}", comp: Takvim, gizli: true },
  { id: "servis", label: "\u0130\u015F Emri", icon: "\u{1F527}", comp: ServisIsleri },
  { id: "araclar", label: "Ara\xE7 Kay\u0131tlar\u0131", icon: "\u{1F697}", comp: Araclar },
  { id: "el_arabasi", label: "El Arabas\u0131", icon: "\u{1F6D2}", comp: ElArabasi },
  { id: "personel", label: "Personel", icon: "\u{1F9D1}\u200D\u{1F527}", comp: Personel },
  { id: "cariler", label: "Cariler", icon: "\u{1F465}", comp: Cariler },
  { id: "yapilacaklar", label: "Yapılacaklar", icon: "✅", comp: Yapilacaklar },
  { id: "muhasebe", label: "Muhasebe", icon: "\u{1F4B0}", comp: Muhasebe },
  { id: "cop_kutusu", label: "\u00C7\u00F6p Kutusu", icon: "\u{1F5D1}\uFE0F", comp: CopKutusu },
  { id: "ayarlar", label: "Ayarlar", icon: "\u2699\uFE0F", comp: Ayarlar }
];
function personelMigrasyonu() {
  if (localStorage.getItem("fp_personel_v2")) return;
  const mevcut = LS.get("personel") || [];
  const eklenecekler = [
    { ad: "Ayta\xE7 Sadeer", pozisyon: "Usta" },
    { ad: "Ayhan Sadeer", pozisyon: "Usta" },
    { ad: "Halil Abi", pozisyon: "Teknisyen" }
  ].filter((y) => !mevcut.some((m) => m.ad === y.ad));
  if (eklenecekler.length) {
    const yeni = [...mevcut, ...eklenecekler.map((e) => ({ ...e, id: uid(), telefon: "", maas: 0 }))];
    LS.set("personel", yeni);
  }
  const ayarlar = getSettings();
  if (!ayarlar.firmaAdi || ayarlar.firmaAdi === "At\xF6lye A.\u015E.") {
    saveSettings({ ...ayarlar, firmaAdi: "As Egzoz & Makine" });
  }
  localStorage.setItem("fp_personel_v2", "1");
}
function rolMigrasyonu() {
  if (localStorage.getItem("fp_rol_migrasyon_v1")) return;
  const mevcut = LS.get("personel") || [];
  const yeni = mevcut.map((p) => p.rol ? p : { ...p, rol: "patron" });
  LS.set("personel", yeni);
  localStorage.setItem("fp_rol_migrasyon_v1", "1");
}
function urunMigrasyonu() {
  if (localStorage.getItem("fp_urun_migrasyon_v1")) return;
  let urunler = LS.get("urunler");
  if (urunler.length === 0) {
    const ayarlar = getSettings();
    const kantarli = { id: uid(), ad: "Kantarl\u0131 El Arabas\u0131", kategori: "El Arabas\u0131", kaynak: "uretim", birim: "adet", satisFiyati: +ayarlar.kantarliFiyat || 4500, maliyet: 0, kritikStok: 3, aciklama: "", aktif: true };
    const kantarsiz = { id: uid(), ad: "Kantars\u0131z El Arabas\u0131", kategori: "El Arabas\u0131", kaynak: "uretim", birim: "adet", satisFiyati: +ayarlar.kantarsizFiyat || 3200, maliyet: 0, kritikStok: 3, aciklama: "", aktif: true };
    urunler = [kantarli, kantarsiz];
    LS.set("urunler", urunler);
    const idHaritasi = { kantarli: kantarli.id, kantarsiz: kantarsiz.id };
    const uretim = LS.get("uretimKayitlari").map((u) => u.urunId ? u : { ...u, urunId: idHaritasi[u.tip] || kantarli.id });
    LS.set("uretimKayitlari", uretim);
    const satislar = LS.get("satislar").map((s) => s.urunId ? s : { ...s, urunId: idHaritasi[s.tip] || kantarli.id });
    LS.set("satislar", satislar);
  }
  localStorage.setItem("fp_urun_migrasyon_v1", "1");
}
function servisMigrasyonu() {
  if (localStorage.getItem("fp_servis_migrasyon_v1")) return;
  const liste = LS.get("servisIsleri");
  const siraliListe = [...liste].sort((a, b) => (a.tarih || "").localeCompare(b.tarih || ""));
  let degisti = false;
  const guncel = siraliListe.map((s) => {
    if (s.isEmriNo && s.asama && s.kalemler) return s;
    degisti = true;
    const asama = s.durum === "tamamlandi" ? "teslim_edildi" : s.durum === "iptal" ? "iptal" : s.durum === "devam" ? "tamirde" : "alindi";
    const kalemler = s.kalemler && s.kalemler.length > 0 ? s.kalemler : [{ id: uid(), tur: "iscilik", ad: HIZMET_TIP_LABEL[s.hizmetTuru] || s.aciklama || "Hizmet", adet: 1, birimFiyat: +s.tutar || 0, tutar: +s.tutar || 0 }];
    return {
      ...s,
      isEmriNo: s.isEmriNo || sonrakiIsEmriNo(),
      asama,
      kalemler,
      durumGecmisi: s.durumGecmisi && s.durumGecmisi.length > 0 ? s.durumGecmisi : [{ tarih: s.tarih || today(), asama, not: "Ge\xE7mi\u015F kay\u0131ttan aktar\u0131ld\u0131." }]
    };
  });
  if (degisti) {
    const geriSiraya = liste.map((orj) => guncel.find((g) => g.id === orj.id) || orj);
    LS.set("servisIsleri", geriSiraya);
  }
  localStorage.setItem("fp_servis_migrasyon_v1", "1");
}
function faturaMigrasyonu() {
  if (localStorage.getItem("fp_fatura_migrasyon_v1")) return;
  LS.get("servisIsleri").filter((s) => s.durum === "tamamlandi").forEach((s) => {
    faturaOlustur("servis", s.id, s.musteriId, s.tarih, `${s.isEmriNo || ""} \u2014 ${HIZMET_TIP_LABEL[s.hizmetTuru] || ""}`, s.kalemler, s.tutar);
  });
  LS.get("satislar").forEach((s) => {
    faturaOlustur("urun_satis", s.id, s.musteriId, s.tarih, `${urunAd(LS.get("urunler"), s.urunId)} sat\u0131\u015F\u0131`, [{ ad: urunAd(LS.get("urunler"), s.urunId), adet: s.adet, birimFiyat: s.birimFiyat, tutar: s.toplam }], s.toplam);
  });
  localStorage.setItem("fp_fatura_migrasyon_v1", "1");
}
function elArabasiMigrasyonu() {
  if (localStorage.getItem("fp_el_arabasi_migrasyon_v1")) return;
  const urunler = LS.get("urunler");
  const eskiSatislar = LS.get("satislar");
  if (eskiSatislar.some((s) => s.urunId)) {
    const yeniSatislar = eskiSatislar.map((s) => {
      if (!s.urunId) return s;
      const urun = urunler.find((u) => u.id === s.urunId);
      const ad = ((urun && urun.ad) || "").toLocaleLowerCase("tr-TR");
      const tur = ad.includes("kantarsız") ? "kantarsiz_kasa" : "kantarli_kasa";
      return { id: s.id, tarih: s.tarih, musteriId: s.musteriId, tur, aciklama: urun ? urun.ad : "", toplam: +s.toplam || 0, garantili: false };
    });
    LS.set("satislar", yeniSatislar);
  }
  const faturalar = LS.get("faturalar");
  let degisti = false;
  const yeniFaturalar = faturalar.map((f) => {
    if (f.tur !== "urun_satis") return f;
    degisti = true;
    return { ...f, tur: "el_arabasi", odemeler: [{ id: uid(), tarih: f.tarih, tutar: f.toplam, hesapId: null }] };
  });
  if (degisti) LS.set("faturalar", yeniFaturalar);
  localStorage.setItem("fp_el_arabasi_migrasyon_v1", "1");
}
const AS_SAYFA_IDLERI = ["dashboard", "servis", "takvim", "araclar", "el_arabasi", "personel", "cariler", "yapilacaklar", "muhasebe", "cop_kutusu", "ayarlar"];
function asSistemPromptuOlustur() {
  return `Sen "AS" isimli, bir oto egzoz/chiptuning/el arabas\u0131 \xFCretim at\xF6lyesinin y\xF6netim uygulamas\u0131 i\xE7inde \xE7al\u0131\u015Fan yapay zeka asistan\u0131s\u0131n. Kullan\u0131c\u0131ya (at\xF6lye sahibi/\xE7al\u0131\u015Fan\u0131) T\xFCrk\xE7e cevap ver. Cevaplar\u0131n mutlaka KISA olsun: normal sorularda en fazla 2-3 c\xFCmle, gereksiz gire\u015F/tekrar/\xF6z\xFCr yazma, do\u011Frudan konuya gir. Sana verilen "G\xFCncel Durum" bilgisini kullanarak analiz/\xF6zet sorular\u0131n\u0131 yan\u0131tlayabilirsin.
Eğer kullanıcı senden bir sayfaya gitmeni istiyorsa (örn. "cariler sayfasını aç", "muhasebeye git"), cevabının EN SONUNA yeni bir satırda tam olarak şu formatta yaz:
AKSIYON:{"tip":"sayfaya_git","sayfa":"<id>"}
<id> şunlardan biri olmalı: ${AS_SAYFA_IDLERI.join(", ")}.
Eğer kullanıcı senden bir görev/hatırlatma eklemeni istiyorsa, cevabının sonuna:
AKSIYON:{"tip":"yeni_gorev","baslik":"<başlık>","oncelik":"dusuk|orta|yuksek"}
Eğer kullanıcı senden yeni bir cari/müşteri eklemeni istiyorsa, cevabının sonuna:
AKSIYON:{"tip":"yeni_cari","ad":"<ad>","tel":"<telefon veya boş>"}
Eğer kullanıcı senden yeni bir iş emri oluşturmanı istiyorsa (plaka mutlaka gerekli, yoksa kullanıcıya plaka sor ve AKSIYON yazma), cevabının sonuna:
AKSIYON:{"tip":"yeni_is_emri","musteri":"<ad veya boş>","plaka":"<plaka>","hizmetTuru":"<key>","tutar":<sayı>,"aciklama":"<opsiyonel>"}
hizmetTuru şunlardan biri olmalı: ${Object.keys(HIZMET_TIP_LABEL).join(", ")}.
Eğer kullanıcı bir iş için ödeme/tahsilat almanı istiyorsa, cevabının sonuna:
AKSIYON:{"tip":"odeme_al","isEmriNo":"<varsa, yoksa boş>","plaka":"<varsa, yoksa boş>","musteri":"<varsa, yoksa boş>","tutar":<opsiyonel sayı, verilmezse kalan tutarın tamamı alınır>}
Bu durumların dışında AKSIYON satırı ekleme, sadece normal cevap ver. Emin değilsen ya da uygulamada yapamayacağın bir şey istenirse bunu açıkça söyle, uydurma.`;
}
function asBaglamOlustur() {
  const servisler = LS.get("servisIsleri");
  const cariler = LS.get("cariler");
  const araclar = LS.get("araclar");
  const gorevler = LS.get("yapilacaklar");
  const bugun = today();
  const acikIsler = servisler.filter((s) => s.durum !== "tamamlandi" && s.durum !== "iptal");
  const odenmemis = servisler.filter((s) => servisOdemeDurumu(s) !== "odendi" && s.durum === "tamamlandi");
  const odenmemisToplam = odenmemis.reduce((t, s) => t + servisKalanTutar(s), 0);
  const bugunRandevu = servisler.filter((s) => s.tarih === bugun && s.durum !== "iptal");
  const acikGorevler = gorevler.filter((g) => !g.tamamlandi);
  const gecikenGorevler = acikGorevler.filter((g) => g.bitisTarihi && g.bitisTarihi < bugun);
  return `Bug\xFCn\xFCn tarihi: ${bugun}.
Toplam cari sayısı: ${cariler.length}.
Toplam ara\xE7 sayısı: ${araclar.length}.
A\xE7ık (devam eden) iş sayısı: ${acikIsler.length}.
Bug\xFCn planlı iş/randevu sayısı: ${bugunRandevu.length}.
\xD6denmemiş/kısmi \xF6denmiş iş sayısı: ${odenmemis.length}, toplam alacak: ${fmtTL(odenmemisToplam)}.
A\xE7ık g\xF6rev sayısı: ${acikGorevler.length} (${gecikenGorevler.length} tanesi gecikmiş).`;
}
function asAksiyonAyristir(metin) {
  const m = (metin || "").match(/AKSIYON:\s*(\{[^\n]*\})\s*$/);
  if (!m) return { temizMetin: (metin || "").trim(), aksiyon: null };
  try {
    const aksiyon = JSON.parse(m[1]);
    return { temizMetin: metin.slice(0, m.index).trim(), aksiyon };
  } catch {
    return { temizMetin: metin.trim(), aksiyon: null };
  }
}
function asAksiyonOzetle(aksiyon) {
  if (!aksiyon || !aksiyon.tip) return "";
  if (aksiyon.tip === "yeni_gorev") {
    const oncelikLabel = { dusuk: "d\xFCş\xFCk", orta: "orta", yuksek: "y\xFCksek" }[aksiyon.oncelik] || "orta";
    return `\u{1F4CB} Yeni g\xF6rev eklenecek: "${aksiyon.baslik || ""}" (\xF6ncelik: ${oncelikLabel})`;
  }
  if (aksiyon.tip === "yeni_cari") {
    return `\u{1F465} Yeni cari eklenecek: ${aksiyon.ad || ""}${aksiyon.tel ? " — " + aksiyon.tel : ""}`;
  }
  if (aksiyon.tip === "yeni_is_emri") {
    return `\u{1F527} Yeni iş emri oluşturulacak: ${aksiyon.plaka || ""}${aksiyon.musteri ? " — " + aksiyon.musteri : ""} — ${HIZMET_TIP_LABEL[aksiyon.hizmetTuru] || aksiyon.hizmetTuru || ""} — ${fmtTL(aksiyon.tutar)}`;
  }
  if (aksiyon.tip === "odeme_al") {
    return `\u{1F4B0} \xD6deme alınacak: ${aksiyon.isEmriNo || aksiyon.plaka || aksiyon.musteri || ""}${aksiyon.tutar ? " — " + fmtTL(aksiyon.tutar) : " (kalan tutarın tamamı)"}`;
  }
  return "Bu işlem uygulanacak.";
}
const AS_ONAY_GEREKTIREN_AKSIYONLAR = ["yeni_gorev", "yeni_cari", "yeni_is_emri", "odeme_al"];
const AS_ALAN_LABEL = { baslik: "Başlık", oncelik: "\xD6ncelik", ad: "Ad", tel: "Telefon", musteri: "M\xFCşteri", plaka: "Plaka", hizmetTuru: "Hizmet T\xFCr\xFC", tutar: "Tutar", aciklama: "A\xE7ıklama", isEmriNo: "İş Emri No" };
function asAksiyonUygula(aksiyon, sayfayaGit) {
  if (!aksiyon || !aksiyon.tip) return null;
  if (aksiyon.tip === "sayfaya_git" && AS_SAYFA_IDLERI.includes(aksiyon.sayfa)) {
    sayfayaGit && sayfayaGit(aksiyon.sayfa);
    return `\u{1F4CD} ${aksiyon.sayfa} sayfasına gidildi.`;
  }
  if (aksiyon.tip === "yeni_gorev" && aksiyon.baslik) {
    const liste = LS.get("yapilacaklar");
    const kayit = { id: uid(), baslik: aksiyon.baslik, oncelik: ["dusuk", "orta", "yuksek"].includes(aksiyon.oncelik) ? aksiyon.oncelik : "orta", olusturmaTarihi: today(), tamamlandi: false };
    LS.set("yapilacaklar", [...liste, kayit]);
    return `✅ G\xF6rev eklendi: ${aksiyon.baslik}`;
  }
  if (aksiyon.tip === "yeni_cari" && aksiyon.ad) {
    const liste = LS.get("cariler");
    const kayit = { id: uid(), ad: aksiyon.ad, tel: aksiyon.tel || "", adres: "" };
    LS.set("cariler", [...liste, kayit]);
    return `✅ Cari eklendi: ${aksiyon.ad}`;
  }
  if (aksiyon.tip === "yeni_is_emri") {
    return asYeniIsEmriOlustur(aksiyon);
  }
  if (aksiyon.tip === "odeme_al") {
    return asOdemeAl(aksiyon);
  }
  return null;
}
function asYeniIsEmriOlustur(aksiyon) {
  if (!(aksiyon.plaka || "").trim()) return "⚠️ İş emri oluşturmak için plaka bilgisi gerekli.";
  const cariler = LS.get("cariler");
  const araclar = LS.get("araclar");
  const servisler = LS.get("servisIsleri");
  const musteriAdi = (aksiyon.musteri || "").trim();
  let musteriId = "";
  if (musteriAdi) {
    const musteriNorm = musteriAdi.toLocaleLowerCase("tr-TR");
    const bulunanCari = cariler.find((c) => (c.ad || "").trim().toLocaleLowerCase("tr-TR") === musteriNorm);
    if (bulunanCari) musteriId = bulunanCari.id;
  }
  const normalize = plakaNormalize(aksiyon.plaka);
  let bulunanArac = araclar.find((a) => plakaNormalize(a.plaka) === normalize);
  let guncelCariler = cariler;
  if (!bulunanArac) {
    if (!musteriId && musteriAdi) {
      const yeniCari = { id: uid(), ad: musteriAdi, tel: "", adres: "" };
      guncelCariler = [...cariler, yeniCari];
      LS.set("cariler", guncelCariler);
      musteriId = yeniCari.id;
    }
    bulunanArac = { id: uid(), musteriId, plaka: normalize, grup: "otomobil", marka: "", model: "" };
    LS.set("araclar", [...araclar, bulunanArac]);
  } else if (!musteriId) {
    musteriId = bulunanArac.musteriId || "";
  }
  const hizmetTuru = HIZMET_TIP_LABEL[aksiyon.hizmetTuru] ? aksiyon.hizmetTuru : Object.keys(HIZMET_TIP_LABEL)[0];
  const tutar = +aksiyon.tutar || 0;
  const asama = "teslim_edildi";
  const kayit = {
    id: uid(),
    isEmriNo: sonrakiIsEmriNo(),
    tarih: today(),
    saat: nowTime(),
    musteriId,
    aracId: bulunanArac.id,
    hizmetTuru,
    aciklama: aksiyon.aciklama || "",
    tutar,
    kdvOrani: 0,
    asama,
    durum: asamaDurum(asama),
    kalemler: [{ id: uid(), tur: "iscilik", ad: HIZMET_TIP_LABEL[hizmetTuru] || "Hizmet", adet: 1, birimFiyat: tutar, tutar }],
    durumGecmisi: [{ tarih: today(), asama, not: "AS asistan ile oluşturuldu." }]
  };
  LS.set("servisIsleri", [...servisler, kayit]);
  if (musteriId) {
    faturaOlustur("servis", kayit.id, musteriId, kayit.tarih, `${kayit.isEmriNo} — ${HIZMET_TIP_LABEL[hizmetTuru] || ""}`, kayit.kalemler, tutar);
  }
  return `✅ İş emri oluşturuldu: ${kayit.isEmriNo} — ${bulunanArac.plaka} (${fmtTL(tutar)})`;
}
function asOdemeAl(aksiyon) {
  const servisler = LS.get("servisIsleri");
  const araclar = LS.get("araclar");
  const cariler = LS.get("cariler");
  const hesaplar = LS.get("hesaplar");
  if (hesaplar.length === 0) return "⚠️ Ödeme alınamadı: önce Muhasebe'den bir hesap (kasa/banka) eklemelisin.";
  let adaylar = servisler.filter((s) => servisOdemeDurumu(s) !== "odendi");
  if ((aksiyon.isEmriNo || "").trim()) {
    const norm = aksiyon.isEmriNo.trim().toLocaleLowerCase("tr-TR");
    adaylar = adaylar.filter((s) => (s.isEmriNo || "").toLocaleLowerCase("tr-TR") === norm);
  } else {
    if ((aksiyon.plaka || "").trim()) {
      const normalize = plakaNormalize(aksiyon.plaka);
      adaylar = adaylar.filter((s) => {
        const a = araclar.find((x) => x.id === s.aracId);
        return a && plakaNormalize(a.plaka) === normalize || plakaNormalize(s.aracPlaka || "") === normalize;
      });
    }
    if ((aksiyon.musteri || "").trim()) {
      const musteriNorm = aksiyon.musteri.trim().toLocaleLowerCase("tr-TR");
      adaylar = adaylar.filter((s) => {
        const c = cariler.find((x) => x.id === s.musteriId);
        return c && (c.ad || "").trim().toLocaleLowerCase("tr-TR").includes(musteriNorm);
      });
    }
  }
  adaylar.sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""));
  const hedefIs = adaylar[0];
  if (!hedefIs) return "⚠️ Eşleşen, ödemesi bekleyen bir iş bulunamadı.";
  const kalan = servisKalanTutar(hedefIs);
  const girilenTutar = Math.min(+aksiyon.tutar || kalan, kalan);
  if (!(girilenTutar > 0)) return `⚠️ ${hedefIs.isEmriNo || ""} zaten tamamen ödenmiş.`;
  const hesap = hesaplar[0];
  hesapHareketiKaydet(hesap.id, "giris", girilenTutar, today(), `Servis \xF6demesi (AS) — ${hedefIs.isEmriNo || ""}`, "servis", "Nakit");
  const yeniOdemeler = [...(hedefIs.odemeler || []), { id: uid(), tarih: today(), tutar: girilenTutar, yontem: "Nakit", hesapId: hesap.id }];
  const tamOdendi = servisKalanTutar({ ...hedefIs, odemeler: yeniOdemeler }) <= 0;
  const yeni = servisler.map((x) => x.id === hedefIs.id ? { ...x, odemeler: yeniOdemeler, odendi: tamOdendi, odemeHesapId: hesap.id, odemeYontemi: "Nakit" } : x);
  LS.set("servisIsleri", yeni);
  const yeniKalan = servisKalanTutar({ ...hedefIs, odemeler: yeniOdemeler });
  return `✅ ${hedefIs.isEmriNo || ""} i\xE7in ${fmtTL(girilenTutar)} ödeme alındı (${hesap.ad}, Nakit).${yeniKalan > 0 ? ` Kalan: ${fmtTL(yeniKalan)}` : ""}`;
}
function AsAsistani({ sayfayaGit }) {
  const [acik, setAcik] = useState(false);
  const [mesajlar, setMesajlar] = useState([{ rol: "asistan", metin: "Merhaba, ben AS! Sana nasıl yardımcı olabilirim?" }]);
  const [girdi, setGirdi] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [dinliyor, setDinliyor] = useState(false);
  const [sesliCevap, setSesliCevap] = useState(false);
  const [bekleyenAksiyon, setBekleyenAksiyon] = useState(null);
  const [pos, setPos] = useState(() => {
    try {
      const ham = localStorage.getItem("fp_as_asistan_pos");
      return ham ? JSON.parse(ham) : null;
    } catch {
      return null;
    }
  });
  const taniyiciRef = useRef(null);
  const sohbetSonRef = useRef(null);
  const disRef = useRef(null);
  const surukleRef = useRef({ suruklemeVar: false, tasindi: false });
  const apiKeyVar = !!getSettings().aiApiKey;
  useEffect(() => {
    if (acik && sohbetSonRef.current) sohbetSonRef.current.scrollIntoView({ behavior: "smooth" });
  }, [mesajlar, acik]);
  const surukleDevam = (e) => {
    if (!surukleRef.current.suruklemeVar) return;
    e.preventDefault && e.preventDefault();
    const nokta = e.touches ? e.touches[0] : e;
    const dx = nokta.clientX - surukleRef.current.basX;
    const dy = nokta.clientY - surukleRef.current.basY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) surukleRef.current.tasindi = true;
    let yeniX = surukleRef.current.baslangicX + dx;
    let yeniY = surukleRef.current.baslangicY + dy;
    const maxX = window.innerWidth - surukleRef.current.genislik - 4;
    const maxY = window.innerHeight - surukleRef.current.yukseklik - 4;
    yeniX = Math.max(4, Math.min(maxX, yeniX));
    yeniY = Math.max(4, Math.min(maxY, yeniY));
    setPos({ x: yeniX, y: yeniY });
  };
  const surukleBitir = () => {
    surukleRef.current.suruklemeVar = false;
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", surukleDevam);
    window.removeEventListener("mouseup", surukleBitir);
    window.removeEventListener("touchmove", surukleDevam);
    window.removeEventListener("touchend", surukleBitir);
    setPos((p) => {
      if (p) {
        try {
          localStorage.setItem("fp_as_asistan_pos", JSON.stringify(p));
        } catch {
        }
      }
      return p;
    });
  };
  const suruklemeBaslat = (e) => {
    if (e.button !== void 0 && e.button !== 0) return;
    const nokta = e.touches ? e.touches[0] : e;
    const kutu = disRef.current.getBoundingClientRect();
    surukleRef.current = { suruklemeVar: true, tasindi: false, basX: nokta.clientX, basY: nokta.clientY, baslangicX: kutu.left, baslangicY: kutu.top, genislik: kutu.width, yukseklik: kutu.height };
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", surukleDevam);
    window.addEventListener("mouseup", surukleBitir);
    window.addEventListener("touchmove", surukleDevam, { passive: false });
    window.addEventListener("touchend", surukleBitir);
  };
  const konumStil = pos ? { left: pos.x, top: pos.y, bottom: "auto", right: "auto" } : { bottom: 20, right: 20 };
  const seslendir = (metin) => {
    if (!sesliCevap || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(metin.replace(/AKSIYON:.*$/s, ""));
      u.lang = "tr-TR";
      window.speechSynthesis.speak(u);
    } catch {
    }
  };
  const gonder = async (metinParam) => {
    const metin = (metinParam ?? girdi).trim();
    if (!metin || yukleniyor) return;
    const yeniMesajlar = [...mesajlar, { rol: "kullanici", metin }];
    setMesajlar(yeniMesajlar);
    setGirdi("");
    setYukleniyor(true);
    try {
      const gecmis = yeniMesajlar.slice(-8).map((m) => `${m.rol === "kullanici" ? "Kullanıcı" : "AS"}: ${m.metin}`).join("\n");
      const tamPrompt = `${asSistemPromptuOlustur()}

G\xFCncel Durum:
${asBaglamOlustur()}

${gecmis}
AS:`;
      const cevapHam = await aiSor(tamPrompt);
      const { temizMetin, aksiyon } = asAksiyonAyristir(cevapHam || "");
      let sonMetin = temizMetin || "Anlayamadım, tekrar s\xF6yler misin?";
      if (aksiyon && AS_ONAY_GEREKTIREN_AKSIYONLAR.includes(aksiyon.tip)) {
        setBekleyenAksiyon({ aksiyon, taslak: { ...aksiyon }, duzenleModu: false });
      } else if (aksiyon) {
        const sonuc = asAksiyonUygula(aksiyon, sayfayaGit);
        if (sonuc) sonMetin += `

${sonuc}`;
      }
      setMesajlar((m) => [...m, { rol: "asistan", metin: sonMetin }]);
      seslendir(sonMetin);
    } catch (e) {
      setMesajlar((m) => [...m, { rol: "asistan", metin: `⚠️ ${e.message}` }]);
    } finally {
      setYukleniyor(false);
    }
  };
  const aksiyonOnayla = () => {
    if (!bekleyenAksiyon) return;
    const kaynak = bekleyenAksiyon.duzenleModu ? bekleyenAksiyon.taslak : bekleyenAksiyon.aksiyon;
    const uygulanacak = { ...kaynak };
    if ("tutar" in uygulanacak) uygulanacak.tutar = +uygulanacak.tutar || 0;
    const sonuc = asAksiyonUygula(uygulanacak, sayfayaGit);
    setBekleyenAksiyon(null);
    if (sonuc) setMesajlar((m) => [...m, { rol: "asistan", metin: sonuc }]);
  };
  const aksiyonIptal = () => {
    setBekleyenAksiyon(null);
    setMesajlar((m) => [...m, { rol: "asistan", metin: "❌ İşlem iptal edildi." }]);
  };
  const aksiyonTaslakGuncelle = (alan, deger) => setBekleyenAksiyon((a) => ({ ...a, taslak: { ...a.taslak, [alan]: deger } }));
  const sesleGonder = () => {
    if (!sesTanimaDesteklerMi()) return;
    if (dinliyor) {
      taniyiciRef.current && taniyiciRef.current.stop();
      return;
    }
    const Taniyici = window.SpeechRecognition || window.webkitSpeechRecognition;
    const taniyici = new Taniyici();
    taniyici.lang = "tr-TR";
    taniyici.interimResults = false;
    taniyici.maxAlternatives = 1;
    taniyici.onresult = (e) => {
      const metin = e.results[0][0].transcript;
      gonder(metin);
    };
    taniyici.onerror = () => setDinliyor(false);
    taniyici.onend = () => setDinliyor(false);
    taniyiciRef.current = taniyici;
    taniyici.start();
    setDinliyor(true);
  };
  if (!acik) {
    return /* @__PURE__ */ React.createElement("button", {
      ref: disRef,
      onClick: () => { if (!surukleRef.current.tasindi) setAcik(true); },
      onMouseDown: suruklemeBaslat,
      onTouchStart: suruklemeBaslat,
      title: "AS Asistan (sürükleyebilirsin)",
      style: { position: "fixed", ...konumStil, width: 56, height: 56, borderRadius: "50%", background: "#fff", border: `3px solid ${C.accent}`, boxShadow: "0 4px 16px #00000055", cursor: "grab", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 4, touchAction: "none" }
    }, /* @__PURE__ */ React.createElement(LogoImg, { size: 40 }));
  }
  return /* @__PURE__ */ React.createElement(
    "div",
    { ref: disRef, style: { position: "fixed", ...konumStil, width: "min(360px,92vw)", height: "min(520px,76vh)", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: "0 8px 30px #00000066", zIndex: 900, display: "flex", flexDirection: "column", overflow: "hidden" } },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderBottom: `1px solid ${C.border}` } },
      /* @__PURE__ */ React.createElement("div", { onMouseDown: suruklemeBaslat, onTouchStart: suruklemeBaslat, title: "Sürüklemek için tutun", style: { display: "flex", alignItems: "center", gap: 8, cursor: "grab", touchAction: "none" } },
        /* @__PURE__ */ React.createElement("span", { style: { width: 30, height: 30, borderRadius: "50%", background: "#fff", border: `2px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 3, boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement(LogoImg, { size: 22 })),
        /* @__PURE__ */ React.createElement("strong", { style: { color: C.white, fontSize: 13.5 } }, "AS Asistan")
      ),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
        /* @__PURE__ */ React.createElement("button", { title: sesliCevap ? "Sesli cevabı kapat" : "Sesli cevabı a\xE7", onClick: () => setSesliCevap((v) => !v), style: { background: "none", border: "none", color: sesliCevap ? C.accent : C.muted, cursor: "pointer", fontSize: 15 } }, sesliCevap ? "\u{1F50A}" : "\u{1F507}"),
        /* @__PURE__ */ React.createElement("button", { title: "Kapat", onClick: () => setAcik(false), style: { background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 15 } }, "✕")
      )
    ),
    !apiKeyVar && /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 14px", fontSize: 11.5, color: C.yellow, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" } }, "⚠️ \xD6nce Ayarlar → Yapay Zeka'dan bir Gemini API key girmelisin.", /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "3px 10px", fontSize: 11, flexShrink: 0 }, onClick: () => { sayfayaGit && sayfayaGit("ayarlar"); setAcik(false); } }, "Ayarlar'a Git")),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 } },
      mesajlar.map((m, i) => {
        const hataMi = m.rol === "asistan" && m.metin.startsWith("⚠️");
        return /* @__PURE__ */ React.createElement("div", { key: i, style: { alignSelf: m.rol === "kullanici" ? "flex-end" : "flex-start", maxWidth: "85%", background: m.rol === "kullanici" ? C.accent : hataMi ? C.red + "18" : C.surface, color: m.rol === "kullanici" ? "#161311" : hataMi ? C.red : C.text, padding: "8px 12px", borderRadius: 10, fontSize: 12.5, whiteSpace: "pre-wrap" } }, m.metin);
      }),
      yukleniyor && /* @__PURE__ */ React.createElement("div", { style: { alignSelf: "flex-start", background: C.surface, color: C.muted, fontSize: 12, padding: "8px 12px", borderRadius: 10 } }, "AS yazıyor …"),
      bekleyenAksiyon && React.createElement(
        "div",
        { style: { alignSelf: "flex-start", maxWidth: "95%", background: C.surface, border: `1px solid ${C.accent}88`, borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 } },
        React.createElement("div", { style: { fontSize: 12.5, color: C.text } }, asAksiyonOzetle(bekleyenAksiyon.duzenleModu ? bekleyenAksiyon.taslak : bekleyenAksiyon.aksiyon)),
        bekleyenAksiyon.duzenleModu ? React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 6 } },
          Object.keys(bekleyenAksiyon.taslak).filter((k) => k !== "tip").map((k) => React.createElement(
            "div",
            { key: k, style: { display: "flex", alignItems: "center", gap: 6 } },
            React.createElement("label", { style: { fontSize: 11, color: C.muted, width: 78, flexShrink: 0 } }, AS_ALAN_LABEL[k] || k),
            k === "hizmetTuru" ? React.createElement("select", { style: { ...S.sel, flex: 1, fontSize: 12, padding: "5px 8px" }, value: bekleyenAksiyon.taslak[k] || "", onChange: (e) => aksiyonTaslakGuncelle(k, e.target.value) }, Object.entries(HIZMET_TIP_LABEL).map(([key, label]) => React.createElement("option", { key, value: key }, label))) : k === "oncelik" ? React.createElement("select", { style: { ...S.sel, flex: 1, fontSize: 12, padding: "5px 8px" }, value: bekleyenAksiyon.taslak[k] || "orta", onChange: (e) => aksiyonTaslakGuncelle(k, e.target.value) }, React.createElement("option", { value: "dusuk" }, "D\xFCş\xFCk"), React.createElement("option", { value: "orta" }, "Orta"), React.createElement("option", { value: "yuksek" }, "Y\xFCksek")) : React.createElement("input", { type: k === "tutar" ? "number" : "text", style: { ...S.inp, flex: 1, fontSize: 12, padding: "5px 8px" }, value: bekleyenAksiyon.taslak[k] ?? "", onChange: (e) => aksiyonTaslakGuncelle(k, e.target.value) })
          )),
          React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 4 } },
            React.createElement("button", { type: "button", style: { ...S.btn(), padding: "5px 12px", fontSize: 11.5 }, onClick: aksiyonOnayla }, "✅ Uygula"),
            React.createElement("button", { type: "button", style: { ...S.btnO, padding: "5px 12px", fontSize: 11.5 }, onClick: () => setBekleyenAksiyon((a) => ({ ...a, duzenleModu: false })) }, "◀ Geri")
          )
        ) : React.createElement(
          "div",
          { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
          React.createElement("button", { type: "button", style: { ...S.btn(), padding: "5px 12px", fontSize: 11.5 }, onClick: aksiyonOnayla }, "✅ Onayla"),
          React.createElement("button", { type: "button", style: { ...S.btnO, padding: "5px 12px", fontSize: 11.5 }, onClick: () => setBekleyenAksiyon((a) => ({ ...a, duzenleModu: true })) }, "✏️ D\xFCzenle"),
          React.createElement("button", { type: "button", style: { ...S.btnR, padding: "5px 12px", fontSize: 11.5 }, onClick: aksiyonIptal }, "✖ İptal")
        )
      ),
      /* @__PURE__ */ React.createElement("div", { ref: sohbetSonRef })
    ),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, padding: 10, borderTop: `1px solid ${C.border}` } },
      sesTanimaDesteklerMi() && /* @__PURE__ */ React.createElement("button", { type: "button", title: dinliyor ? "Dinlemeyi durdur" : "Sesle konuş", onClick: sesleGonder, style: { ...S.btnO, padding: "6px 10px", background: dinliyor ? C.red + "22" : void 0, borderColor: dinliyor ? C.red : void 0 } }, dinliyor ? "\u{1F534}" : "\u{1F3A4}"),
      /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, flex: 1 }, placeholder: "Bir şey yaz…", value: girdi, onChange: (e) => setGirdi(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") gonder(); } }),
      /* @__PURE__ */ React.createElement("button", { type: "button", style: S.btn(), onClick: () => gonder(), disabled: yukleniyor }, "G\xF6nder")
    )
  );
}
function App() {
  seedVeri();
  personelMigrasyonu();
  rolMigrasyonu();
  urunMigrasyonu();
  servisMigrasyonu();
  faturaMigrasyonu();
  elArabasiMigrasyonu();
  dosyaMigrasyonuYap();
  copKutusuTemizle();
  const [sayfa, setSayfa] = useState(() => location.hash.replace("#", "") || "dashboard");
  const [sidebarAcik, setSidebarAcik] = useState(false);
  const [hedef, setHedef] = useState(null);
  const [globalArama, setGlobalArama] = useState("");
  const globalSonuclar = useMemo(() => {
    const q = globalArama.trim().toLocaleLowerCase("tr-TR");
    if (q.length < 2) return [];
    const sonuclar = [];
    LS.get("cariler").forEach((c) => {
      if ((`${c.ad || ""} ${c.tel || ""}`).toLocaleLowerCase("tr-TR").includes(q)) sonuclar.push({ tip: "cari", id: c.id, baslik: c.ad, alt: c.tel || "", icon: "\u{1F465}" });
    });
    LS.get("araclar").forEach((a) => {
      if ((`${a.plaka || ""} ${a.marka || ""} ${a.model || ""}`).toLocaleLowerCase("tr-TR").includes(q)) sonuclar.push({ tip: "arac", id: a.id, baslik: a.plaka, alt: `${a.marka || ""} ${a.model || ""}`.trim(), icon: "\u{1F697}" });
    });
    LS.get("servisIsleri").forEach((s) => {
      if ((s.isEmriNo || "").toLocaleLowerCase("tr-TR").includes(q)) sonuclar.push({ tip: "servis", id: s.id, baslik: s.isEmriNo, alt: HIZMET_TIP_LABEL[s.hizmetTuru] || "", icon: "\u{1F527}" });
    });
    return sonuclar.slice(0, 8);
  }, [globalArama]);
  const [hizliMenuAcik, setHizliMenuAcik] = useState(false);
  const [kullanici, setKullanici] = useState(() => {
    try {
      const v = sessionStorage.getItem("fp_google_kullanici");
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  });
  const [girisYapildi, setGirisYapildi] = useState(() => !!kullanici || !getSettings().googleClientId);
  useEffect(() => {
    location.hash = sayfa;
  }, [sayfa]);
  useEffect(() => {
    otomatikYedekAl();
    bildirimleriKontrolEt();
    gununOzetiBildirimiGonder();
    const zamanlayici = setInterval(gununOzetiBildirimiGonder, 3e5);
    return () => clearInterval(zamanlayici);
  }, []);
  const [yeniVeriVar, setYeniVeriVar] = useState(false);
  useEffect(() => {
    if (!bulutHazirMi()) return;
    const kontrolEt = async () => {
      try {
        const uzakZaman = await buluttanOku("_sonGuncelleme");
        const yerelZaman = +(localStorage.getItem("fp_son_yerel_degisim") || 0);
        if (uzakZaman && uzakZaman > yerelZaman + 2e3) setYeniVeriVar(true);
      } catch {
      }
    };
    const zamanlayici = setInterval(kontrolEt, 5e3);
    return () => clearInterval(zamanlayici);
  }, []);
  if (!girisYapildi) {
    return /* @__PURE__ */ React.createElement(GirisEkrani, { onGiris: (k) => {
      setKullanici(k);
      setGirisYapildi(true);
    } });
  }
  const cikisYap = () => {
    sessionStorage.removeItem("fp_google_kullanici");
    setKullanici(null);
    setGirisYapildi(!getSettings().googleClientId);
  };
  const girisliPersonel = (() => {
    if (!kullanici || !kullanici.ad) return null;
    const personelListesi = LS.get("personel") || [];
    return personelListesi.find((p) => (p.ad || "").trim().toLocaleLowerCase("tr-TR") === kullanici.ad.trim().toLocaleLowerCase("tr-TR")) || null;
  })();
  const izinliSayfaIdleri = girisliPersonel ? ROL_SAYFA_IZIN[girisliPersonel.rol] : null;
  const gorunurSayfalar = izinliSayfaIdleri ? SAYFALAR.filter((s) => izinliSayfaIdleri.includes(s.id)) : SAYFALAR;
  if (izinliSayfaIdleri && !izinliSayfaIdleri.includes(sayfa)) {
    setSayfa(gorunurSayfalar[0]?.id || "dashboard");
  }
  const AktifBilesen = (gorunurSayfalar.find((s) => s.id === sayfa) || gorunurSayfalar[0] || SAYFALAR[0]).comp;
  const aktifSayfaBilgi = gorunurSayfalar.find((s) => s.id === sayfa) || gorunurSayfalar[0] || SAYFALAR[0];
  const sayfayaGit = (id) => {
    setSayfa(id);
    setSidebarAcik(false);
  };
  const hedefeGit = (sayfaId, eylem) => {
    setSayfa(sayfaId);
    setHedef(eylem);
    setSidebarAcik(false);
    setGlobalArama("");
    setHizliMenuAcik(false);
  };
  const sonucaGit = (sonuc) => {
    if (sonuc.tip === "cari") hedefeGit("cariler", { tip: "ac_ekstre", id: sonuc.id });
    else if (sonuc.tip === "arac") hedefeGit("araclar", { tip: "ac_arac_detay", id: sonuc.id });
    else if (sonuc.tip === "servis") hedefeGit("servis", { tip: "duzenle_servis", id: sonuc.id });
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "fp-app", style: S.app },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "fp-mobile-topbar" },
      /* @__PURE__ */ React.createElement("button", { className: "fp-hamburger", "aria-label": "Men\xFCy\xFC a\xE7", onClick: () => setSidebarAcik(true) }, "\u2630"),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: C.white } }, aktifSayfaBilgi.icon, " ", aktifSayfaBilgi.label)
    ),
    sidebarAcik && /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-backdrop", onClick: () => setSidebarAcik(false) }),
    /* @__PURE__ */ React.createElement("div", { className: sidebarAcik ? "fp-sidebar fp-sidebar-open" : "fp-sidebar", style: S.sidebar }, /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-brand", style: { padding: "6px 10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center" } }, /* @__PURE__ */ React.createElement(LogoImg, { size: 44 }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: C.white } }, getSettings().firmaAdi)),
    /* @__PURE__ */ React.createElement("div", { style: { padding: "0 4px 14px", display: "flex", gap: 6 } },
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, position: "relative" } },
        /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, fontSize: 12.5, height: 38 }, placeholder: "\u{1F50D} Plaka, m\xFCşteri, iş emri ara…", value: globalArama, onChange: (e) => setGlobalArama(e.target.value) }),
        globalSonuclar.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "100%", left: 0, right: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 4, zIndex: 650, maxHeight: 320, overflowY: "auto" } }, globalSonuclar.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, onClick: () => sonucaGit(s), style: { padding: "8px 10px", cursor: "pointer", borderBottom: i < globalSonuclar.length - 1 ? `1px solid ${C.border}` : "none", display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", null, s.icon), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: C.white, fontWeight: 600 } }, s.baslik), s.alt && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted } }, s.alt)))))
      ),
      /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } },
        /* @__PURE__ */ React.createElement("button", { type: "button", title: "H\u0131zl\u0131 Ekle", style: { ...S.btn(), height: 38, padding: "0 13px", fontSize: 15, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }, onClick: () => setHizliMenuAcik((v) => !v) }, "\u2795"),
        hizliMenuAcik && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "100%", right: 0, minWidth: 190, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 4, zIndex: 650, overflow: "hidden" } },
          /* @__PURE__ */ React.createElement("div", { onClick: () => hedefeGit("servis", { tip: "yeni_is_emri" }), style: { padding: "9px 12px", cursor: "pointer", fontSize: 12.5, color: C.text, borderBottom: `1px solid ${C.border}` } }, "\u{1F527} İş Emri Oluştur"),
          /* @__PURE__ */ React.createElement("div", { onClick: () => hedefeGit("cariler", { tip: "yeni_cari" }), style: { padding: "9px 12px", cursor: "pointer", fontSize: 12.5, color: C.text, borderBottom: `1px solid ${C.border}` } }, "\u{1F465} Yeni Cari"),
          /* @__PURE__ */ React.createElement("div", { onClick: () => hedefeGit("araclar", { tip: "yeni_arac" }), style: { padding: "9px 12px", cursor: "pointer", fontSize: 12.5, color: C.text, borderBottom: `1px solid ${C.border}` } }, "\u{1F697} Yeni Ara\xE7"),
          /* @__PURE__ */ React.createElement("div", { onClick: () => hedefeGit("el_arabasi", { tip: "yeni_satis" }), style: { padding: "9px 12px", cursor: "pointer", fontSize: 12.5, color: C.text } }, "\u{1F6D2} El Arabas\u0131")
        )
      )
    ),
    /* @__PURE__ */ React.createElement("div", { className: "fp-navlist" }, gorunurSayfalar.filter((s) => !s.gizli).map(
    (s) => /* @__PURE__ */ React.createElement("div", { key: s.id, className: "fp-navitem", style: S.navBtn(sayfa === s.id), onClick: () => sayfayaGit(s.id) }, /* @__PURE__ */ React.createElement("span", { className: "fp-navicon" }, s.icon), /* @__PURE__ */ React.createElement("span", { className: "fp-navlabel" }, s.label))
  )), /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-spacer", style: { flex: 1 } }), kullanici && /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-footer", style: { padding: "10px", display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 14 } }, kullanici.foto && /* @__PURE__ */ React.createElement("img", { src: kullanici.foto, alt: "", style: { width: 28, height: 28, borderRadius: "50%" } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, kullanici.ad)), /* @__PURE__ */ React.createElement("button", { onClick: cikisYap, title: "\xC7\u0131k\u0131\u015F Yap", style: { background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 } }, "\u23FB")), /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-footer", style: { padding: "12px 10px", fontSize: 10.5, color: C.muted, borderTop: kullanici ? "none" : `1px solid ${C.border}`, marginTop: kullanici ? 0 : 12, paddingTop: kullanici ? 4 : 14 } }, "As v1.0 \u2014 Yerel veri deposu")), /* @__PURE__ */ React.createElement("div", { className: "fp-main", style: S.main }, yeniVeriVar && /* @__PURE__ */ React.createElement("div", { className: "fp-yeni-veri-uyari", style: { position: "sticky", top: 0, zIndex: 50, background: C.accent, color: "#161311", padding: "10px 16px", borderRadius: 8, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700 } }, "\u{1F504} Ba\u015Fka bir cihazda de\u011Fi\u015Fiklik yap\u0131ld\u0131.", /* @__PURE__ */ React.createElement("button", { style: { background: "#161311", color: C.white, border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }, onClick: async () => {
    for (const anahtar of ALL_DATA_KEYS) {
      const veri = await buluttanOku(anahtar);
      if (veri !== null) localStorage.setItem(anahtar, JSON.stringify(veri));
    }
    const uzakZaman = await buluttanOku("_sonGuncelleme");
    if (uzakZaman) localStorage.setItem("fp_son_yerel_degisim", String(uzakZaman));
    window.location.reload();
  } }, "\u015Eimdi Yenile")), /* @__PURE__ */ React.createElement(AktifBilesen, { hedef, hedefTemizle: () => setHedef(null), sayfayaGit })), /* @__PURE__ */ React.createElement(AsAsistani, { sayfayaGit }));
}
function AnketSayfasi({ isEmriNo, supabaseUrl, anonKey }) {
  const [puan, setPuan] = useState(0);
  const [yorum, setYorum] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);
  const [hata, setHata] = useState("");
  const gonder = async () => {
    if (!puan) {
      setHata("L\u00FCtfen bir puan se\u00E7in.");
      return;
    }
    setHata("");
    setGonderiliyor(true);
    try {
      await anketKaydet(supabaseUrl, anonKey, isEmriNo, puan, yorum);
      setGonderildi(true);
    } catch (e) {
      setHata("G\u00F6nderilemedi: " + e.message);
    }
    setGonderiliyor(false);
  };
  return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#161311", padding: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#211d1a", border: "1px solid #3a332d", borderRadius: 14, padding: 28, maxWidth: 420, width: "100%", textAlign: "center" } },
    gonderildi
      ? /* @__PURE__ */ React.createElement(React.Fragment, null,
          /* @__PURE__ */ React.createElement("div", { style: { fontSize: 40, marginBottom: 10 } }, "\uD83D\uDE4F"),
          /* @__PURE__ */ React.createElement("div", { style: { color: "#fff", fontSize: 16, fontWeight: 700 } }, "Te\u015Fekk\u00FCrler!"),
          /* @__PURE__ */ React.createElement("div", { style: { color: "#a89f96", fontSize: 13, marginTop: 6 } }, "De\u011Ferlendirmeniz bize ula\u015Ft\u0131.")
        )
      : /* @__PURE__ */ React.createElement(React.Fragment, null,
          /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, marginBottom: 10 } }, "\u2B50"),
          /* @__PURE__ */ React.createElement("div", { style: { color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 4 } }, "\u0130\u015Fimizi Nas\u0131l Buldunuz?"),
          /* @__PURE__ */ React.createElement("div", { style: { color: "#a89f96", fontSize: 12.5, marginBottom: 18 } }, isEmriNo || ""),
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 18 } }, [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, onClick: () => setPuan(n), style: { background: "none", border: "none", fontSize: 32, cursor: "pointer", opacity: n <= puan ? 1 : 0.3 } }, "\u2B50"))),
          /* @__PURE__ */ React.createElement("textarea", { value: yorum, onChange: (e) => setYorum(e.target.value), placeholder: "\u0130sterseniz k\u0131sa bir not b\u0131rak\u0131n (opsiyonel)", style: { width: "100%", minHeight: 70, background: "#161311", border: "1px solid #3a332d", borderRadius: 8, padding: 10, color: "#fff", fontSize: 13, marginBottom: 14, boxSizing: "border-box" } }),
          hata && /* @__PURE__ */ React.createElement("div", { style: { color: "#e05252", fontSize: 12.5, marginBottom: 12 } }, hata),
          /* @__PURE__ */ React.createElement("button", { onClick: gonder, disabled: gonderiliyor, style: { width: "100%", background: "#e8622c", color: "#161311", border: "none", borderRadius: 8, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" } }, gonderiliyor ? "G\u00F6nderiliyor\u2026" : "G\u00F6nder")
        )
  ));
}
const _urlParams = new URLSearchParams(location.search);
const _anketIsEmriNo = _urlParams.get("anket");
if (_anketIsEmriNo) {
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(AnketSayfasi, { isEmriNo: _anketIsEmriNo, supabaseUrl: _urlParams.get("db"), anonKey: _urlParams.get("key") }));
} else {
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
}
