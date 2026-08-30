const { useState, useEffect, useMemo, useRef } = React;
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
const HIZMET_TIP_LABEL = {
  egzoz_tamir: "\u{1F529} Egzoz Tamiri",
  egzoz_degisim: "\u{1F527} Egzoz De\u011Fi\u015Fimi",
  egzoz_kaynak: "\u{1F525} Egzoz Kaynak/Onar\u0131m",
  chiptuning: "\u26A1 Chiptuning",
  motor_bakim: "\u{1F6E0}\uFE0F Motor Bak\u0131m\u0131",
  elektrik_ariza: "\u{1F50C} Elektrik Ar\u0131za",
  akilli_makine_kurulum: "\u{1F916} Ak\u0131ll\u0131 Makine Kurulumu",
  akilli_makine_bakim: "\u{1F916} Ak\u0131ll\u0131 Makine Bak\u0131m\u0131",
  periyodik_bakim: "\u{1F9F0} Periyodik Bak\u0131m",
  diger: "\u270F\uFE0F Di\u011Fer (\xF6zel)"
};
const ASAMA_LABEL = {
  alindi: "\u{1F697} Ara\xE7/\xDCr\xFCn Al\u0131nd\u0131",
  teshis: "\u{1F50D} Te\u015Fhis",
  onay_bekliyor: "\u23F3 M\xFC\u015Fteri Onay\u0131 Bekliyor",
  parca_bekliyor: "\u{1F4E6} Par\xE7a Bekleniyor",
  tamirde: "\u{1F527} Tamirde",
  test: "\u2705 Test Ediliyor",
  teslim_hazir: "\u{1F4CB} Teslime Haz\u0131r",
  teslim_edildi: "\u{1F3C1} Teslim Edildi",
  iptal: "\u274C \u0130ptal"
};
const ASAMA_SIRA = ["alindi", "teshis", "onay_bekliyor", "parca_bekliyor", "tamirde", "test", "teslim_hazir", "teslim_edildi"];
function asamaRenk(asama) {
  if (asama === "iptal") return C.muted;
  if (asama === "teslim_edildi") return C.green;
  if (asama === "onay_bekliyor" || asama === "parca_bekliyor") return C.yellow;
  if (asama === "alindi" || asama === "teshis") return C.blue;
  return C.accent;
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
const URUN_KATEGORILERI = ["Egzoz", "Chiptuning", "El Arabas\u0131", "Ak\u0131ll\u0131 Makine", "Yedek Par\xE7a", "Di\u011Fer"];
const URUN_KAYNAK_LABEL = { uretim: "\u{1F3ED} Kendi \xDCretimimiz", disardan: "\u{1F69A} D\u0131\u015Fardan Al\u0131nan" };
const DURUM_LABEL = { bekliyor: "Bekliyor", devam: "Devam Ediyor", tamamlandi: "Tamamland\u0131", iptal: "\u0130ptal" };
const DURUM_RENK = { bekliyor: C.yellow, devam: C.blue, tamamlandi: C.green, iptal: C.red };
const GIDER_KATEGORILERI = ["Malzeme/Hammadde", "Kira", "Elektrik/Su", "Personel Maa\u015F\u0131", "Yak\u0131t", "Bak\u0131m-Onar\u0131m", "Vergi/SGK", "Di\u011Fer"];
const HESAP_TUR_LABEL = { kasa: "\u{1F4B5} Kasa", banka: "\u{1F3E6} Banka", kredi_karti: "\u{1F4B3} Kredi Kart\u0131", pos: "\u{1F5A5}\uFE0F POS" };
const CEK_SENET_TUR_LABEL = { cek: "\u{1F4C4} \xC7ek", senet: "\u{1F4DD} Senet" };
const CEK_SENET_DURUM_LABEL = { portfoyde: "Portf\xF6yde", tahsil: "Tahsil Edildi", karsiliksiz: "Kar\u015F\u0131l\u0131ks\u0131z" };
const CEK_SENET_DURUM_RENK = { portfoyde: C.yellow, tahsil: C.green, karsiliksiz: C.red };
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
  return !!s.bulutKutuAdi;
}
function bulutUrl(anahtar) {
  return `https://kvdb.io/${getSettings().bulutKutuAdi}/${anahtar}`;
}
function _b64Encode(bytes) {
  let ikili = "";
  bytes.forEach((b) => ikili += String.fromCharCode(b));
  return btoa(ikili);
}
function _b64Decode(str) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}
async function _bulutAnahtarTuret(sifre, saltBytes) {
  const temelAnahtar = await crypto.subtle.importKey("raw", new TextEncoder().encode(sifre), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations: 150000, hash: "SHA-256" },
    temelAnahtar,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
async function _bulutSifrele(deger, sifre) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const anahtar = await _bulutAnahtarTuret(sifre, salt);
  const veriBytes = new TextEncoder().encode(JSON.stringify(deger));
  const sifreliBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, anahtar, veriBytes);
  return { __enc: 1, salt: _b64Encode(salt), iv: _b64Encode(iv), veri: _b64Encode(new Uint8Array(sifreliBuffer)) };
}
async function _bulutCoz(paket, sifre) {
  const anahtar = await _bulutAnahtarTuret(sifre, _b64Decode(paket.salt));
  const cozulmusBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: _b64Decode(paket.iv) }, anahtar, _b64Decode(paket.veri));
  return JSON.parse(new TextDecoder().decode(cozulmusBuffer));
}
async function _bulutYaz(anahtar, deger) {
  const sifre = getSettings().bulutSifre;
  const gonderilecek = sifre ? await _bulutSifrele(deger, sifre) : deger;
  return fetch(bulutUrl(anahtar), { method: "PUT", body: JSON.stringify(gonderilecek) });
}
let _bulutGonderZamanlayici = {};
function bulutaGonder(anahtar, deger) {
  if (!bulutHazirMi()) return;
  clearTimeout(_bulutGonderZamanlayici[anahtar]);
  _bulutGonderZamanlayici[anahtar] = setTimeout(async () => {
    const zamanDamgasi = Date.now();
    try {
      await _bulutYaz(anahtar, deger);
      localStorage.setItem("fp_son_senkron", (/* @__PURE__ */ new Date()).toISOString());
      localStorage.setItem("fp_son_yerel_degisim", String(zamanDamgasi));
      if (anahtar !== "_sonGuncelleme") await _bulutYaz("_sonGuncelleme", zamanDamgasi);
    } catch {
    }
  }, 600);
}
async function buluttanOku(anahtar) {
  const r = await fetch(bulutUrl(anahtar));
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("Bulut kutusuna eri\u015Filemedi.");
  const veri = await r.json();
  if (veri && typeof veri === "object" && veri.__enc) {
    const sifre = getSettings().bulutSifre;
    if (!sifre) throw new Error("Bu veriler \u015Fifreli. \xD6nce Ayarlar \u2192 Bulut Senkronizasyonu'ndan \u015Fifreyi girin.");
    try {
      return await _bulutCoz(veri, sifre);
    } catch {
      throw new Error("\u015Eifre yanl\u0131\u015F, veriler \xE7\xF6z\xFClemedi.");
    }
  }
  return veri;
}
async function aiSor(promptMetni) {
  const apiKey = getSettings().aiApiKey;
  if (!apiKey) throw new Error("\xD6nce Ayarlar \u2192 Yapay Zeka'dan bir API key girin.");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: promptMetni }]
    })
  });
  if (!r.ok) {
    const hata = await r.text();
    throw new Error(`AI iste\u011Fi ba\u015Far\u0131s\u0131z (${r.status}): ${hata.slice(0, 200)}`);
  }
  const veri = await r.json();
  return veri.content && veri.content[0] ? veri.content[0].text : "";
}
const ALL_DATA_KEYS = ["cariler", "servisIsleri", "urunler", "uretimKayitlari", "satislar", "faturalar", "giderler", "malzemeler", "personel", "araclar", "hesaplar", "kasaHareketleri", "cekSenetler"];
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
const fmtDate = (d) => {
  if (!d) return "\u2014";
  const [y, m, g] = d.split("-");
  return g ? `${g}.${m}.${y}` : d;
};
const fmtTL = (n) => `\u20BA${(+n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const DEFAULT_SETTINGS = {
  firmaAdi: "As Egzoz & Makine",
  firmaAdres: "",
  firmaTel: "",
  kdvOrani: 20,
  bulutKutuAdi: "",
  bulutSifre: "",
  aiApiKey: "",
  googleClientId: ""
};
const getSettings = () => ({ ...DEFAULT_SETTINGS, ...LS.get("ayarlar", {}) });
const saveSettings = (s) => LS.set("ayarlar", s);
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
  LS.set("urunler", [
    { id: "ur1", ad: "Kantarl\u0131 El Arabas\u0131", kategori: "El Arabas\u0131", kaynak: "uretim", birim: "adet", satisFiyati: 4500, maliyet: 2800, kritikStok: 3, aciklama: "", aktif: true },
    { id: "ur2", ad: "Kantars\u0131z El Arabas\u0131", kategori: "El Arabas\u0131", kaynak: "uretim", birim: "adet", satisFiyati: 3200, maliyet: 1900, kritikStok: 3, aciklama: "", aktif: true },
    { id: "ur3", ad: "Standart Egzoz Sistemi", kategori: "Egzoz", kaynak: "uretim", birim: "adet", satisFiyati: 2600, maliyet: 1400, kritikStok: 2, aciklama: "", aktif: true },
    { id: "ur4", ad: "Chiptuning Cihaz\u0131 (Haz\u0131r)", kategori: "Ak\u0131ll\u0131 Makine", kaynak: "disardan", birim: "adet", satisFiyati: 6800, maliyet: 5200, kritikStok: 1, aciklama: "Tedarik\xE7iden haz\u0131r al\u0131n\u0131r, elde stoklan\u0131r.", aktif: true }
  ]);
  LS.set("uretimKayitlari", [
    { id: "u1", tarih: today(), urunId: "ur1", adet: 6, aciklama: "Haftal\u0131k \xFCretim" },
    { id: "u2", tarih: today(), urunId: "ur2", adet: 10, aciklama: "Haftal\u0131k \xFCretim" }
  ]);
  LS.set("satislar", []);
  LS.set("giderler", []);
  LS.set("malzemeler", []);
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
  LS.set("cekSenetler", []);
  LS.set("faturalar", []);
  localStorage.setItem("fp_seed_v1", "1");
}
const S = {
  app: { display: "flex", minHeight: "100vh" },
  sidebar: { width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "18px 12px", flexShrink: 0 },
  main: { flex: 1, padding: "24px 28px", maxWidth: 1200, margin: "0 auto", width: "100%" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16, overflowX: "auto", WebkitOverflowScrolling: "touch" },
  navBtn: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13.5, marginBottom: 2, color: active ? C.white : C.muted, background: active ? C.accent + "22" : "transparent", border: active ? `1px solid ${C.accent}55` : "1px solid transparent", fontWeight: active ? 600 : 400 }),
  btn: (bg = C.accent) => ({ background: bg, color: "#161311", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }),
  btnO: { background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer" },
  btnR: { background: "transparent", color: C.red, border: `1px solid ${C.red}55`, borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer" },
  inp: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.white, fontSize: 13.5 },
  sel: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.white, fontSize: 13.5 },
  th: { textAlign: "left", padding: "9px 10px", fontSize: 11.5, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `1px solid ${C.border}` },
  td: { padding: "11px 10px", fontSize: 13.5, borderBottom: `1px solid ${C.border}55`, color: C.text },
  tbl: { width: "100%", borderCollapse: "collapse" },
  secTitle: { fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 14 },
  modal: { position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 },
  mbox: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, maxHeight: "88vh", overflowY: "auto" },
  badge: (c) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: c + "22", color: c })
};
function FG({ label, children }) {
  return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: 12, color: C.muted, marginBottom: 6 } }, label), children);
}
function StatCard({ color, value, label, sub, icon }) {
  return /* @__PURE__ */ React.createElement("div", { style: { ...S.card, marginBottom: 0, borderTop: `3px solid ${color}` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: C.white } }, value), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginTop: 4 } }, label), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 } }, sub)), icon && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, opacity: 0.8 } }, icon)));
}
function Badge({ d, map = DURUM_LABEL, renk = DURUM_RENK }) {
  return /* @__PURE__ */ React.createElement("span", { style: S.badge(renk[d] || C.muted) }, map[d] || d);
}
function Modal({ title, onClose, width = 520, children }) {
  return /* @__PURE__ */ React.createElement("div", { style: S.modal, onClick: (e) => e.target === e.currentTarget && onClose() }, /* @__PURE__ */ React.createElement("div", { style: { ...S.mbox, width: `min(${width}px,94vw)` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 18 } }, title), children));
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
function cariAd(cariler, id) {
  return (cariler.find((c) => c.id === id) || {}).ad || "\u2014";
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
function whatsappLinkOlustur(telefon, mesaj) {
  const temiz = String(telefon || "").replace(/[^0-9]/g, "");
  const numara = temiz.startsWith("0") ? "90" + temiz.slice(1) : temiz.startsWith("90") ? temiz : "90" + temiz;
  return `https://wa.me/${numara}?text=${encodeURIComponent(mesaj)}`;
}
function whatsappLinkAc(telefon, mesaj) {
  if (!telefon || !String(telefon).replace(/[^0-9]/g, "")) {
    alert("Bu m\xFC\u015Fterinin telefon numaras\u0131 kay\u0131tl\u0131 de\u011Fil.");
    return;
  }
  window.open(whatsappLinkOlustur(telefon, mesaj), "_blank");
}
function hesapHareketiKaydet(hesapId, yon, tutar, tarih, aciklama, kaynak) {
  if (!hesapId || !(+tutar > 0)) return;
  const hesaplar = LS.get("hesaplar");
  const hareketler = LS.get("kasaHareketleri");
  const yeniHareket = { id: uid(), hesapId, tur: yon, tutar: +tutar, tarih: tarih || today(), aciklama: aciklama || "", kaynak: kaynak || "otomatik" };
  LS.set("kasaHareketleri", [...hareketler, yeniHareket]);
  const yeniHesaplar = hesaplar.map((h) => h.id === hesapId ? { ...h, bakiye: (+h.bakiye || 0) + (yon === "giris" ? +tutar : -tutar) } : h);
  LS.set("hesaplar", yeniHesaplar);
}
function fisYazdir(baslik, satirlar, toplam, musteriAdi) {
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
  <div class="toplam">Toplam: ${fmtTL(toplam)}</div>
  </body></html>`;
  const pencere = window.open("", "_blank");
  pencere.document.write(html);
  pencere.document.close();
  setTimeout(() => pencere.print(), 300);
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
  <div class="muted">${fmtDate(s.tarih)}</div></div>
  <div class="etiket">${s.isEmriNo || ""}</div>
  <h2 style="font-size:18px;margin:0 0 10px;">${HIZMET_TIP_LABEL[s.hizmetTuru] || "Servis \u0130\u015Fi"}</h2>
  <div class="satir"><strong>M\xFC\u015Fteri:</strong> ${musteriAdi || ""}</div>
  <div class="satir"><strong>Ara\xE7/\xDCr\xFCn:</strong> ${aracEtiket || ""}</div>
  ${s.aciklama ? `<div class="satir"><strong>A\xE7\u0131klama:</strong> ${s.aciklama}</div>` : ""}
  <table><thead><tr><th>Kalem</th><th>Adet</th><th style="text-align:right;">Birim</th><th style="text-align:right;">Tutar</th></tr></thead>
  <tbody>${kalemler.map((k) => `<tr><td>${k.ad}</td><td>${k.adet || 1}</td><td style="text-align:right;">${fmtTL(k.birimFiyat)}</td><td style="text-align:right;">${fmtTL(k.tutar)}</td></tr>`).join("")}</tbody></table>
  <div class="toplam">Toplam: ${fmtTL(s.tutar)}</div>
  ${s.garantili ? `<div class="satir" style="margin-top:14px;">\u{1F6E1}\uFE0F Bu i\u015Flem ${s.garantiBitis ? fmtDate(s.garantiBitis) + " tarihine kadar" : ""} garanti kapsam\u0131ndad\u0131r.</div>` : ""}
  </body></html>`;
  const pencere = window.open("", "_blank");
  pencere.document.write(html);
  pencere.document.close();
  setTimeout(() => pencere.print(), 300);
}
function malzemeStokDegistir(malzemeId, delta) {
  if (!malzemeId) return;
  const liste = LS.get("malzemeler");
  const yeni = liste.map((m) => m.id === malzemeId ? { ...m, stokMiktari: Math.max(0, (+m.stokMiktari || 0) + delta) } : m);
  LS.set("malzemeler", yeni);
}
function sonrakiFaturaNo() {
  const mevcut = +(localStorage.getItem("fp_fatura_sayac") || "0") + 1;
  localStorage.setItem("fp_fatura_sayac", String(mevcut));
  return `FTR-${String(mevcut).padStart(4, "0")}`;
}
function faturaOlustur(tur, kaynakId, musteriId, tarih, aciklama, kalemler, toplam) {
  const mevcut = LS.get("faturalar");
  if (mevcut.some((f) => f.kaynakId === kaynakId)) return null;
  const kdvOrani = +getSettings().kdvOrani || 0;
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
  const pencere = window.open("", "_blank");
  pencere.document.write(html);
  pencere.document.close();
  setTimeout(() => pencere.print(), 300);
}
