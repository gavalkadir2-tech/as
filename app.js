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
let _bulutGonderZamanlayici = {};
function bulutaGonder(anahtar, deger) {
  if (!bulutHazirMi()) return;
  clearTimeout(_bulutGonderZamanlayici[anahtar]);
  _bulutGonderZamanlayici[anahtar] = setTimeout(() => {
    const zamanDamgasi = Date.now();
    fetch(bulutUrl(anahtar), { method: "PUT", body: JSON.stringify(deger) }).then(() => {
      localStorage.setItem("fp_son_senkron", (/* @__PURE__ */ new Date()).toISOString());
      localStorage.setItem("fp_son_yerel_degisim", String(zamanDamgasi));
      if (anahtar !== "_sonGuncelleme") fetch(bulutUrl("_sonGuncelleme"), { method: "PUT", body: JSON.stringify(zamanDamgasi) }).catch(() => {
      });
    }).catch(() => {
    });
  }, 600);
}
async function buluttanOku(anahtar) {
  const r = await fetch(bulutUrl(anahtar));
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("Bulut kutusuna eri\u015Filemedi.");
  return r.json();
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
    const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
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
const fmtTL = (n) => `\u20BA${(+n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const DEFAULT_SETTINGS = {
  firmaAdi: "As Egzoz & Makine",
  firmaAdres: "",
  firmaTel: "",
  kdvOrani: 20,
  bulutKutuAdi: "",
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
  modal: { position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600, padding: 16 },
  mbox: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, maxHeight: "88vh", overflowY: "auto", overflowX: "auto" },
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
  htmlBelgeIndir(html, `${s.isEmriNo || "is-emri"}.pdf`);
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
  htmlBelgeIndir(html, `${f.faturaNo || "fatura"}.pdf`);
}
function Dashboard() {
  const [servisler] = useState(LS.get("servisIsleri"));
  const [uretim] = useState(LS.get("uretimKayitlari"));
  const [satislar] = useState(LS.get("satislar"));
  const [urunler] = useState(LS.get("urunler"));
  const [giderler] = useState(LS.get("giderler"));
  const [cariler] = useState(LS.get("cariler"));
  const [personelListesi] = useState(LS.get("personel"));
  const acikServisSayisi = servisler.filter((s) => s.durum !== "tamamlandi" && s.durum !== "iptal").length;
  const buAyGelir = servisler.filter((s) => s.tarih && s.tarih.startsWith(today().slice(0, 7)) && s.durum === "tamamlandi").reduce((t, s) => t + (+s.tutar || 0), 0) + satislar.filter((s) => s.tarih && s.tarih.startsWith(today().slice(0, 7))).reduce((t, s) => t + (+s.toplam || 0), 0);
  const buAyGider = giderler.filter((g) => g.tarih && g.tarih.startsWith(today().slice(0, 7))).reduce((t, g) => t + (+g.tutar || 0), 0);
  const buAyNetKar = buAyGelir - buAyGider;
  const odenmemis = servisler.filter((s) => !s.odendi && s.durum === "tamamlandi").reduce((t, s) => t + (+s.tutar || 0), 0);
  const teknisyenYuku = personelListesi.map((p) => ({
    ad: p.ad,
    acikIsSayisi: servisler.filter((s) => s.personelId === p.id && s.durum !== "tamamlandi" && s.durum !== "iptal").length
  })).sort((a, b) => a.acikIsSayisi - b.acikIsSayisi);
  const atanmamisIsSayisi = servisler.filter((s) => !s.personelId && s.durum !== "tamamlandi" && s.durum !== "iptal").length;
  const stokHesapla = (urunId) => uretim.filter((u) => u.urunId === urunId).reduce((t, u) => t + (+u.adet || 0), 0) - satislar.filter((s) => s.urunId === urunId).reduce((t, s) => t + (+s.adet || 0), 0);
  const aktifUrunler = urunler.filter((u) => u.aktif !== false);
  const stokListesi = aktifUrunler.map((u) => ({ ...u, stok: stokHesapla(u.id) }));
  const toplamStok = stokListesi.reduce((t, u) => t + u.stok, 0);
  const kritikUrunler = stokListesi.filter((u) => u.stok <= (+u.kritikStok || 3));
  const hizmetDagilimi = Object.entries(
    servisler.reduce((acc, s) => {
      const l = HIZMET_TIP_LABEL[s.hizmetTuru] || s.hizmetTuru;
      acc[l] = (acc[l] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
  const renkler = [C.accent, C.blue, C.green, C.yellow, C.purple];
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 4 } }, "Genel Bak\u0131\u015F"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.muted, marginBottom: 20 } }, (/* @__PURE__ */ new Date()).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })), /* @__PURE__ */ React.createElement(Grid4, null, /* @__PURE__ */ React.createElement(StatCard, { color: C.accent, icon: "\u{1F527}", value: acikServisSayisi, label: "A\xE7\u0131k Servis \u0130\u015Fi" }), /* @__PURE__ */ React.createElement(StatCard, { color: buAyNetKar >= 0 ? C.green : C.red, icon: "\u{1F4B0}", value: fmtTL(buAyNetKar), label: "Bu Ay Net K\xE2r", sub: `Gelir ${fmtTL(buAyGelir)} \u2212 Gider ${fmtTL(buAyGider)}` }), /* @__PURE__ */ React.createElement(StatCard, { color: C.red, icon: "\u23F3", value: fmtTL(odenmemis), label: "Tahsil Edilecek" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.blue, icon: "\u{1F6D2}", value: `${toplamStok} adet`, label: "Toplam \xDCr\xFCn Stoku", sub: `${aktifUrunler.length} aktif \xFCr\xFCn \xE7e\u015Fidi` })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4E6} Stok Durumu"), stokListesi.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Hen\xFCz \xFCr\xFCn eklenmedi.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, stokListesi.slice(0, 5).map(
    (u) => /* @__PURE__ */ React.createElement("div", { key: u.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderRadius: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text } }, u.ad), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, fontWeight: 800, color: u.stok <= (+u.kritikStok || 3) ? C.red : C.white } }, u.stok, " adet"))
  )), kritikUrunler.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.red + "18", borderRadius: 8, fontSize: 12, color: C.red } }, "\u26A0\uFE0F ", kritikUrunler.length, " \xFCr\xFCn kritik stok seviyesinde \u2014 \xFCretim/al\u0131m planlamay\u0131 d\xFC\u015F\xFCn\xFCn.")), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4CA} Hizmet T\xFCr\xFC Da\u011F\u0131l\u0131m\u0131"), RC.PieChart && hizmetDagilimi.length > 0 ? /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 200 }, /* @__PURE__ */ React.createElement(PieChart, null, /* @__PURE__ */ React.createElement(Pie, { data: hizmetDagilimi, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 78, paddingAngle: 3, label: ({ name, value }) => `${name}: ${value}` }, hizmetDagilimi.map((e, i) => /* @__PURE__ */ React.createElement(Cell, { key: i, fill: renkler[i % renkler.length] }))), /* @__PURE__ */ React.createElement(Tooltip, { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 } }))) : /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Hen\xFCz veri yok."))), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F9D1}\u200D\u{1F527} Teknisyen \u0130\u015F Y\xFCk\xFC"), personelListesi.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Hen\xFCz personel eklenmedi.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, teknisyenYuku.map(
    (t) => /* @__PURE__ */ React.createElement("div", { key: t.ad, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderRadius: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text } }, t.ad), /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(t.acikIsSayisi === 0 ? C.green : t.acikIsSayisi <= 2 ? C.blue : C.yellow) } }, t.acikIsSayisi, " a\xE7\u0131k i\u015F"))
  ), atanmamisIsSayisi > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, padding: "10px 14px", background: C.red + "18", borderRadius: 8, fontSize: 12, color: C.red } }, "\u26A0\uFE0F ", atanmamisIsSayisi, " i\u015F hen\xFCz kimseye atanmam\u0131\u015F \u2014 en bo\u015Fta olan ", teknisyenYuku[0]?.ad || "bir teknisyen", " \xF6nerilir."))), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F552} Son Servis \u0130\u015Fleri"), servisler.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Hen\xFCz kay\u0131t yok.") : /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "M\xFC\u015Fteri"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Ara\xE7"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Hizmet"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tutar"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Durum"))), /* @__PURE__ */ React.createElement("tbody", null, [...servisler].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).slice(0, 6).map(
    (s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(s.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, cariAd(cariler, s.musteriId)), /* @__PURE__ */ React.createElement("td", { style: S.td }, s.aracPlaka), /* @__PURE__ */ React.createElement("td", { style: S.td }, HIZMET_TIP_LABEL[s.hizmetTuru]), /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtTL(s.tutar)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement(Badge, { d: s.durum })))
  )))));
}
function ServisIsleri() {
  const [cariler, setCariler] = useState(LS.get("cariler"));
  const [araclar, setAraclar] = useState(LS.get("araclar"));
  const [personelListesi] = useState(LS.get("personel"));
  const [hesaplar] = useState(LS.get("hesaplar"));
  const [malzemeler] = useState(LS.get("malzemeler"));
  const [liste, setListe] = useState(LS.get("servisIsleri"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [hata, setHata] = useState("");
  const [durumFiltre, setDurumFiltre] = useState("acik");
  const [yeniAracAcik, setYeniAracAcik] = useState(false);
  const [sahipDuzenAcik, setSahipDuzenAcik] = useState(false);
  const [sahipForm, setSahipForm] = useState({});
  const [arama, setArama] = useState("");
  const [odemeModal, setOdemeModal] = useState(null);
  const [odemeHesapId, setOdemeHesapId] = useState("");
  const [aiOneriDevam, setAiOneriDevam] = useState(false);
  const [aiOneriMetni, setAiOneriMetni] = useState("");
  const [gecmisModal, setGecmisModal] = useState(null);
  const [detayAracId, setDetayAracId] = useState(null);
  const [personelFiltre, setPersonelFiltre] = useState("");
  const [sadeceBenim, setSadeceBenim] = useState(false);
  const benimPersonelim = (() => {
    const k = googleKullanici();
    if (!k || !k.ad) return null;
    return personelListesi.find((p) => (p.ad || "").trim().toLocaleLowerCase("tr-TR") === k.ad.trim().toLocaleLowerCase("tr-TR")) || null;
  })();

  const aiTeknisyenOner = async () => {
    if (!form.hizmetTuru) {
      setAiOneriMetni("\xD6nce hizmet t\xFCr\xFCn\xFC se\xE7in.");
      return;
    }
    setAiOneriDevam(true);
    setAiOneriMetni("");
    try {
      const yukListesi = personelListesi.map((p) => {
        const acikIs = liste.filter((s) => s.personelId === p.id && s.durum !== "tamamlandi" && s.durum !== "iptal").length;
        return `${p.ad} (${p.pozisyon || "pozisyon belirtilmemi\u015F"}): ${acikIs} a\xE7\u0131k i\u015F`;
      }).join("\\n");
      const prompt = `Bir oto tamir at\xF6lyesinde yeni bir servis i\u015Fi geldi: "${HIZMET_TIP_LABEL[form.hizmetTuru]}".
Mevcut teknisyenler ve a\xE7\u0131k i\u015F y\xFCkleri:
${yukListesi}
Bu i\u015Fi hangi teknisyene atamal\u0131y\u0131m? Sadece teknisyenin ad\u0131n\u0131 ve 1 k\u0131sa c\xFCmlelik gerek\xE7eyi yaz, ba\u015Fka hi\xE7bir \u015Fey ekleme. Format: "\u0130sim \u2014 gerek\xE7e"`;
      const cevap = await aiSor(prompt);
      setAiOneriMetni(cevap.trim());
    } catch (e) {
      setAiOneriMetni("Hata: " + e.message);
    }
    setAiOneriDevam(false);
  };

  const kalemEkle = (tur) => {
    setForm((f) => ({ ...f, kalemler: [...(f.kalemler || []), { id: uid(), tur, ad: "", malzemeId: "", adet: 1, birimFiyat: 0, tutar: 0 }] }));
  };
  const kalemGuncelle = (kalemId, patch) => {
    setForm((f) => ({
      ...f,
      kalemler: (f.kalemler || []).map((k) => {
        if (k.id !== kalemId) return k;
        const yeniK = { ...k, ...patch };
        yeniK.tutar = (+yeniK.adet || 0) * (+yeniK.birimFiyat || 0);
        return yeniK;
      })
    }));
  };
  const kalemMalzemeSec = (kalemId, malzemeId) => {
    const m = malzemeler.find((x) => x.id === malzemeId);
    kalemGuncelle(kalemId, { malzemeId, ad: m ? m.ad : "", birimFiyat: m ? +m.satisFiyati || +m.birimMaliyet || 0 : 0 });
  };
  const kalemSil = (kalemId) => {
    setForm((f) => ({ ...f, kalemler: (f.kalemler || []).filter((k) => k.id !== kalemId) }));
  };
  const formToplam = (form.kalemler || []).reduce((t, k) => t + (+k.tutar || 0), 0);

  const kaydet = () => {
    if (!form.aracId) {
      setHata("Ara\xE7 se\xE7imi zorunludur.");
      return;
    }
    if (!form.musteriId) {
      setHata("Bu ara\xE7\u0131n sahibi tan\u0131ml\u0131 de\u011Fil \u2014 \xF6nce sahibini d\xFCzenleyin.");
      return;
    }
    if (!form.hizmetTuru) {
      setHata("Hizmet t\xFCr\xFC se\xE7imi zorunludur.");
      return;
    }
    if (!form.kalemler || form.kalemler.length === 0) {
      setHata("En az bir i\u015F kalemi (i\u015F\xE7ilik veya par\xE7a) eklemelisiniz.");
      return;
    }
    if (form.kalemler.some((k) => !(k.ad || "").trim())) {
      setHata("T\xFCm kalemler i\xE7in bir a\xE7\u0131klama/ad girin.");
      return;
    }
    setHata("");
    const yeniKayit = !form.id;
    const asama = form.asama || "alindi";
    const kayit = {
      ...form,
      id: form.id || uid(),
      tarih: form.tarih || today(),
      isEmriNo: form.isEmriNo || sonrakiIsEmriNo(),
      tutar: formToplam,
      asama,
      durum: asamaDurum(asama)
    };
    if (yeniKayit) {
      kayit.durumGecmisi = [{ tarih: today(), asama, not: "\u0130\u015F emri olu\u015Fturuldu." }];
      form.kalemler.filter((k) => k.tur === "parca" && k.malzemeId).forEach((k) => malzemeStokDegistir(k.malzemeId, -(+k.adet || 0)));
    } else {
      const eski = liste.find((x) => x.id === form.id);
      if (eski && eski.asama !== asama) {
        kayit.durumGecmisi = [...(eski.durumGecmisi || []), { tarih: today(), asama, not: "A\u015Fama g\xFCncellendi." }];
      } else {
        kayit.durumGecmisi = eski ? eski.durumGecmisi : kayit.durumGecmisi;
      }
    }
    const yeni = form.id ? liste.map((x) => x.id === form.id ? kayit : x) : [...liste, kayit];
    LS.set("servisIsleri", yeni);
    setListe(yeni);
    setModalAcik(false);
    if (kayit.asama === "teslim_edildi") {
      faturaOlustur("servis", kayit.id, kayit.musteriId, kayit.tarih, `${kayit.isEmriNo} \u2014 ${HIZMET_TIP_LABEL[kayit.hizmetTuru] || ""}`, kayit.kalemler, kayit.tutar);
    }
  };

  const sil = (id) => {
    if (!confirm("Bu servis kayd\u0131 silinsin mi? (Kullan\u0131lan par\xE7a stoklar\u0131 geri eklenir)")) return;
    const kayit = liste.find((x) => x.id === id);
    if (kayit && kayit.kalemler) {
      kayit.kalemler.filter((k) => k.tur === "parca" && k.malzemeId).forEach((k) => malzemeStokDegistir(k.malzemeId, +k.adet || 0));
    }
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("servisIsleri", yeni);
    setListe(yeni);
  };

  const ilerlet = (s) => {
    const suankiIndex = ASAMA_SIRA.indexOf(s.asama);
    if (suankiIndex === -1 || suankiIndex >= ASAMA_SIRA.length - 1) return;
    const yeniAsama = ASAMA_SIRA[suankiIndex + 1];
    const yeni = liste.map((x) => x.id === s.id ? { ...x, asama: yeniAsama, durum: asamaDurum(yeniAsama), durumGecmisi: [...(x.durumGecmisi || []), { tarih: today(), asama: yeniAsama, not: "\u0130lerletildi." }] } : x);
    LS.set("servisIsleri", yeni);
    setListe(yeni);
    if (yeniAsama === "teslim_edildi") {
      faturaOlustur("servis", s.id, s.musteriId, today(), `${s.isEmriNo} \u2014 ${HIZMET_TIP_LABEL[s.hizmetTuru] || ""}`, s.kalemler, s.tutar);
    }
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
      kalemler: [{ id: uid(), tur: "iscilik", ad: "Garanti kapsam\u0131nda \xFCcretsiz i\u015Flem", adet: 1, birimFiyat: 0, tutar: 0 }],
      asama: "alindi"
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
    hesapHareketiKaydet(odemeHesapId, "giris", s.tutar, today(), `Servis \xF6demesi \u2014 ${s.isEmriNo || ""} ${HIZMET_TIP_LABEL[s.hizmetTuru] || ""} (${cariAd(cariler, s.musteriId)})`, "servis");
    const yeni = liste.map((x) => x.id === s.id ? { ...x, odendi: true, odemeHesapId } : x);
    LS.set("servisIsleri", yeni);
    setListe(yeni);
    setOdemeModal(null);
    setOdemeHesapId("");
  };

  const durumaGoreFiltreli = durumFiltre === "tumu" ? liste : durumFiltre === "acik" ? liste.filter((s) => s.durum !== "tamamlandi" && s.durum !== "iptal") : liste.filter((s) => s.durum === durumFiltre);
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
  const metneGoreFiltreli = !aramaMetni ? durumaGoreFiltreli : durumaGoreFiltreli.filter((s) => (cariAd(cariler, s.musteriId) + " " + aracEtiket(s) + " " + (s.aciklama || "") + " " + (s.isEmriNo || "")).toLocaleLowerCase("tr-TR").includes(aramaMetni));
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
  const gecikti = (s) => s.teslimTarihi && s.durum !== "tamamlandi" && s.durum !== "iptal" && s.teslimTarihi < today();

  const acikSayisi = liste.filter((s) => s.durum !== "tamamlandi" && s.durum !== "iptal").length;
  const onayBekleyen = liste.filter((s) => s.asama === "onay_bekliyor").length;
  const parcaBekleyen = liste.filter((s) => s.asama === "parca_bekliyor").length;
  const gecikenSayisi = liste.filter(gecikti).length;

  return React.createElement(
    "div",
    { className: "fp-fade" },
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } },
      React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F527} Servis \u0130\u015Fleri"),
      React.createElement("button", { style: S.btn(), onClick: () => {
        setForm({ tarih: today(), asama: "alindi", kalemler: [] });
        setHata("");
        setModalAcik(true);
      } }, "\u2795 Yeni \u0130\u015F Emri")
    ),
    React.createElement(
      Grid4,
      null,
      React.createElement(StatCard, { color: C.accent, icon: "\u{1F527}", value: acikSayisi, label: "A\xE7\u0131k \u0130\u015F Emri" }),
      React.createElement(StatCard, { color: C.yellow, icon: "\u23F3", value: onayBekleyen, label: "Onay Bekleyen" }),
      React.createElement(StatCard, { color: C.blue, icon: "\u{1F4E6}", value: parcaBekleyen, label: "Par\xE7a Bekleyen" }),
      React.createElement(StatCard, { color: gecikenSayisi > 0 ? C.red : C.green, icon: "\u23F0", value: gecikenSayisi, label: "Gecikmi\u015F \u0130\u015F" })
    ),
    React.createElement(TabBar, { tabs: [["acik", "A\xE7\u0131k \u0130\u015Fler"], ["tumu", "T\xFCm\xFC"], ["bekliyor", "Bekliyor"], ["devam", "Devam Ediyor"], ["tamamlandi", "Tamamland\u0131"], ["iptal", "\u0130ptal"]], active: durumFiltre, onChange: setDurumFiltre }),
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
      React.createElement(
        "table",
        { className: "fp-liste-masaustu", style: S.tbl },
        React.createElement("thead", null, React.createElement(
          "tr",
          null,
          React.createElement("th", { style: S.th }, "\u0130\u015F Emri"),
          React.createElement("th", { style: S.th }, "M\xFC\u015Fteri"),
          React.createElement("th", { style: S.th }, "Ara\xE7/\xDCr\xFCn"),
          React.createElement("th", { style: S.th }, "Hizmet"),
          React.createElement("th", { style: S.th }, "Sorumlu"),
          React.createElement("th", { style: S.th }, "Tutar"),
          React.createElement("th", { style: S.th }, "\xD6deme"),
          React.createElement("th", { style: S.th }, "A\u015Fama"),
          React.createElement("th", { style: S.th })
        )),
        React.createElement(
          "tbody",
          null,
          gosterilecek.length === 0
            ? React.createElement("tr", null, React.createElement("td", { style: S.td, colSpan: 9 }, React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Kay\u0131t bulunamad\u0131.")))
            : [...gosterilecek].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).map((s) => {
                const garanti = garantiDurumu(s);
                const sorumlu = personelListesi.find((p) => p.id === s.personelId);
                const gecikmis = gecikti(s);
                return React.createElement(
                  "tr",
                  { key: s.id },
                  React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.accent } }, s.isEmriNo || "\u2014"), React.createElement("div", { style: { fontSize: 10.5, color: C.muted, marginTop: 2 } }, fmtDate(s.tarih))),
                  React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, s.musteriId))),
                  React.createElement("td", { style: S.td }, s.aracId ? React.createElement("strong", { style: { color: C.accent, cursor: "pointer", textDecoration: "underline" }, title: "Araç sicilini görüntüle (fotoğraf, belge, servis geçmişi)", onClick: () => setDetayAracId(s.aracId) }, aracEtiket(s)) : aracEtiket(s)),
                  React.createElement("td", { style: S.td }, HIZMET_TIP_LABEL[s.hizmetTuru]),
                  React.createElement("td", { style: S.td }, sorumlu ? sorumlu.ad : "\u2014"),
                  React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.accent } }, fmtTL(s.tutar))),
                  React.createElement("td", { style: S.td }, s.odendi
                    ? React.createElement(Badge, { d: "tamamlandi", map: { tamamlandi: "\xD6dendi" }, renk: { tamamlandi: C.green } })
                    : React.createElement("button", { style: { ...S.btnO, padding: "4px 10px", fontSize: 11 }, onClick: () => { setOdemeModal(s); setOdemeHesapId(hesaplar[0] ? hesaplar[0].id : ""); } }, "\xD6dendi \u0130\u015Faretle")),
                  React.createElement(
                    "td",
                    { style: S.td },
                    React.createElement("span", { style: { ...S.badge(asamaRenk(s.asama)), cursor: "pointer" }, title: "A\u015Fama ge\xE7mi\u015Fini g\xF6rmek i\xE7in t\u0131kla", onClick: () => setGecmisModal(s) }, ASAMA_LABEL[s.asama] || s.asama),
                    gecikmis && React.createElement("div", { style: { fontSize: 10.5, color: C.red, marginTop: 4, fontWeight: 700 } }, "\u26A0\uFE0F Teslim tarihi ge\xE7ti"),
                    garanti && React.createElement("div", { style: { fontSize: 10.5, color: garanti.renk, marginTop: 4 } }, "\u{1F6E1}\uFE0F ", garanti.metin),
                    s.asama !== "teslim_edildi" && s.asama !== "iptal" && React.createElement("button", { style: { ...S.btnO, padding: "2px 8px", fontSize: 10.5, marginTop: 4 }, onClick: () => ilerlet(s) }, "\u25B6\uFE0F \u0130lerlet")
                  ),
                  React.createElement(
                    "td",
                    { style: S.td },
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
                      React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "WhatsApp ile durum bildir", onClick: () => {
                        const musteri = cariler.find((c) => c.id === s.musteriId);
                        const mesaj = `Merhaba ${musteri ? musteri.ad : ""}, ${s.isEmriNo || ""} numaral\u0131 ${aracEtiket(s)} i\u015Fleminizin durumu: ${ASAMA_LABEL[s.asama] || s.durum}.${s.durum === "tamamlandi" ? ` Tutar: ${fmtTL(s.tutar)}.` : ""} \u2014 As Egzoz & Makine`;
                        whatsappLinkAc(musteri ? musteri.tel : "", mesaj);
                      } }, "\u{1F4AC}"),
                      React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "PDF indir", onClick: () => isEmriYazdir(s, cariAd(cariler, s.musteriId), aracEtiket(s)) }, "\u{1F4C4}"),
                      s.durum === "tamamlandi" && s.garantili && (!s.garantiBitis || s.garantiBitis >= today()) && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, title: "Garanti Kapsam\u0131nda Tekrar \u0130\u015F A\xE7", onClick: () => garantiTekrarAc(s) }, "\u{1F6E1}\uFE0F"),
                      s.asama !== "iptal" && s.asama !== "teslim_edildi" && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11, color: C.red }, title: "\u0130ptal Et", onClick: () => iptalEt(s) }, "\u2715"),
                      React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => { setForm(s); setHata(""); setModalAcik(true); } }, "\u270F\uFE0F"),
                      React.createElement("button", { style: S.btnR, onClick: () => sil(s.id) }, "\u{1F5D1}\uFE0F")
                    )
                  )
                );
              })
        )
      ),
      React.createElement(
        "div",
        { className: "fp-liste-mobil", style: { flexDirection: "column", gap: 10 } },
        gosterilecek.length === 0
          ? React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Kayıt bulunamadı.")
          : [...gosterilecek].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).map((s) => {
              const garanti = garantiDurumu(s);
              const sorumlu = personelListesi.find((p) => p.id === s.personelId);
              const gecikmis = gecikti(s);
              return React.createElement(
                "div",
                { key: s.id, style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } }, React.createElement("div", null, React.createElement("strong", { style: { color: C.accent } }, s.isEmriNo || "—"), React.createElement("div", { style: { fontSize: 10.5, color: C.muted, marginTop: 2 } }, fmtDate(s.tarih))), React.createElement("span", { style: { ...S.badge(asamaRenk(s.asama)), cursor: "pointer" }, onClick: () => setGecmisModal(s) }, ASAMA_LABEL[s.asama] || s.asama)),
                React.createElement("div", { style: { fontSize: 13.5, color: C.white, fontWeight: 700, marginBottom: 2 } }, cariAd(cariler, s.musteriId)),
                React.createElement("div", { style: { fontSize: 12.5, color: C.text, marginBottom: 4 } }, s.aracId ? React.createElement("span", { style: { color: C.accent, cursor: "pointer", textDecoration: "underline" }, onClick: () => setDetayAracId(s.aracId) }, aracEtiket(s)) : aracEtiket(s)),
                React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 6 } }, HIZMET_TIP_LABEL[s.hizmetTuru], sorumlu ? ` \xB7 ${sorumlu.ad}` : ""),
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } }, React.createElement("strong", { style: { color: C.accent, fontSize: 15 } }, fmtTL(s.tutar)), s.odendi ? React.createElement(Badge, { d: "tamamlandi", map: { tamamlandi: "\xD6dendi" }, renk: { tamamlandi: C.green } }) : React.createElement("button", { style: { ...S.btnO, padding: "4px 10px", fontSize: 11 }, onClick: () => { setOdemeModal(s); setOdemeHesapId(hesaplar[0] ? hesaplar[0].id : ""); } }, "\xD6dendi İşaretle")),
                gecikmis && React.createElement("div", { style: { fontSize: 11, color: C.red, marginBottom: 4, fontWeight: 700 } }, "⚠️ Teslim tarihi ge\xE7ti"),
                garanti && React.createElement("div", { style: { fontSize: 11, color: garanti.renk, marginBottom: 4 } }, "\u{1F6E1}️ ", garanti.metin),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 } },
                  s.asama !== "teslim_edildi" && s.asama !== "iptal" && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => ilerlet(s) }, "▶️ İlerlet"),
                  React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "WhatsApp ile durum bildir", onClick: () => {
                    const musteri = cariler.find((c) => c.id === s.musteriId);
                    const mesaj = `Merhaba ${musteri ? musteri.ad : ""}, ${s.isEmriNo || ""} numaralı ${aracEtiket(s)} işleminizin durumu: ${ASAMA_LABEL[s.asama] || s.durum}.${s.durum === "tamamlandi" ? ` Tutar: ${fmtTL(s.tutar)}.` : ""} — As Egzoz & Makine`;
                    whatsappLinkAc(musteri ? musteri.tel : "", mesaj);
                  } }, "\u{1F4AC}"),
                  React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "PDF indir", onClick: () => isEmriYazdir(s, cariAd(cariler, s.musteriId), aracEtiket(s)) }, "\u{1F4C4}"),
                  s.durum === "tamamlandi" && s.garantili && (!s.garantiBitis || s.garantiBitis >= today()) && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, title: "Garanti Kapsamında Tekrar İş A\xE7", onClick: () => garantiTekrarAc(s) }, "\u{1F6E1}️"),
                  s.asama !== "iptal" && s.asama !== "teslim_edildi" && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11, color: C.red }, title: "İptal Et", onClick: () => iptalEt(s) }, "✕"),
                  React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => { setForm(s); setHata(""); setModalAcik(true); } }, "✏️"),
                  React.createElement("button", { style: S.btnR, onClick: () => sil(s.id) }, "\u{1F5D1}️")
                )
              );
            })
      )
    ),
    modalAcik && React.createElement(
      Modal,
      { title: form.id ? `\u0130\u015F Emrini D\xFCzenle \u2014 ${form.isEmriNo || ""}` : "Yeni \u0130\u015F Emri", onClose: () => setModalAcik(false), width: 640 },
      React.createElement(
        Grid2,
        null,
        React.createElement(FG, { label: "Tarih" }, React.createElement("input", { type: "date", style: S.inp, value: form.tarih || "", onChange: (e) => setForm((f) => ({ ...f, tarih: e.target.value })) })),
        React.createElement(FG, { label: "Tahmini Teslim Tarihi (opsiyonel)" }, React.createElement("input", { type: "date", style: S.inp, value: form.teslimTarihi || "", onChange: (e) => setForm((f) => ({ ...f, teslimTarihi: e.target.value })) }))
      ),
      React.createElement(FG, { label: "Hizmet T\xFCr\xFC" }, React.createElement("select", { style: S.sel, value: form.hizmetTuru || "", onChange: (e) => setForm((f) => ({ ...f, hizmetTuru: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), Object.entries(HIZMET_TIP_LABEL).map(([k, l]) => React.createElement("option", { key: k, value: k }, l)))),
      React.createElement(FG, { label: "Ara\xE7 (Plaka)" }, React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement("select", { style: S.sel, value: form.aracId || "", onChange: (e) => aracSec(e.target.value) }, React.createElement("option", { value: "" }, "\u2014 Plaka se\xE7iniz \u2014"), araclarSirali.map((a) => React.createElement("option", { key: a.id, value: a.id }, a.plaka, a.marka ? ` \xB7 ${a.marka} ${a.model || ""}` : "", " ", `(${cariAd(cariler, a.musteriId)})`))),
        React.createElement("button", { type: "button", style: S.btnO, onClick: () => setYeniAracAcik(true) }, "\u2795 Yeni Ara\xE7")
      )),
      secilenArac && React.createElement(
        "div",
        { style: { background: C.surface, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, color: C.text } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, React.createElement("strong", { style: { color: C.white } }, "\u{1F464} Ara\xE7 Sahibi"), React.createElement("button", { type: "button", style: { ...S.btnO, padding: "3px 10px", fontSize: 11 }, onClick: () => {
          setSahipForm({ ad: secilenAracSahibi ? secilenAracSahibi.ad : "", tel: secilenAracSahibi ? secilenAracSahibi.tel : "", adres: secilenAracSahibi ? secilenAracSahibi.adres : "" });
          setSahipDuzenAcik(true);
        } }, "\u270F\uFE0F D\xFCzenle")),
        secilenAracSahibi ? React.createElement(React.Fragment, null, React.createElement("div", { style: { marginTop: 6 } }, secilenAracSahibi.ad), React.createElement("div", { style: { color: C.muted, marginTop: 2 } }, secilenAracSahibi.tel || "Telefon yok"), React.createElement("div", { style: { color: C.muted, marginTop: 2 } }, secilenAracSahibi.adres || "Adres yok")) : React.createElement("div", { style: { color: C.yellow, marginTop: 6 } }, "\u26A0\uFE0F Bu ara\xE7\u0131n sahibi tan\u0131ml\u0131 de\u011Fil, l\xFCtfen d\xFCzenleyin.")
      ),
      React.createElement(FG, { label: "Sorumlu Personel (opsiyonel)" }, React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement("select", { style: S.sel, value: form.personelId || "", onChange: (e) => setForm((f) => ({ ...f, personelId: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), personelListesi.map((p) => React.createElement("option", { key: p.id, value: p.id }, p.ad, p.pozisyon ? ` (${p.pozisyon})` : ""))),
        React.createElement("button", { type: "button", style: S.btnO, onClick: aiTeknisyenOner, disabled: aiOneriDevam }, aiOneriDevam ? "\u23F3" : "\u{1F916} AI \xD6ner")
      ), aiOneriMetni && React.createElement("div", { style: { marginTop: 8, padding: "8px 12px", background: C.surface, borderRadius: 8, fontSize: 12, color: C.text } }, aiOneriMetni)),
      React.createElement(FG, { label: "A\xE7\u0131klama" }, React.createElement("textarea", { style: { ...S.inp, minHeight: 60 }, value: form.aciklama || "", onChange: (e) => setForm((f) => ({ ...f, aciklama: e.target.value })) })),

      React.createElement("div", { style: S.secTitle }, "\u{1F9FE} \u0130\u015F Kalemleri (\u0130\u015F\xE7ilik / Par\xE7a)"),
      (form.kalemler || []).map((k) => React.createElement(
        "div",
        { key: k.id, style: { display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 8, padding: 10, background: C.surface, borderRadius: 8, flexWrap: "wrap" } },
        React.createElement("span", { style: { ...S.badge(k.tur === "parca" ? C.blue : C.purple), flexShrink: 0, marginTop: 8 } }, k.tur === "parca" ? "Par\xE7a" : "\u0130\u015F\xE7ilik"),
        k.tur === "parca"
          ? React.createElement("select", { style: { ...S.sel, flex: "1 1 160px" }, value: k.malzemeId || "", onChange: (e) => kalemMalzemeSec(k.id, e.target.value) }, React.createElement("option", { value: "" }, "\u2014 Par\xE7a se\xE7 \u2014"), malzemeler.map((m) => React.createElement("option", { key: m.id, value: m.id }, m.ad, " (", m.stokMiktari, " ", m.birim || "", " stokta)")))
          : React.createElement("input", { style: { ...S.inp, flex: "1 1 160px" }, placeholder: "\u0130\u015F\xE7ilik a\xE7\u0131klamas\u0131", value: k.ad || "", onChange: (e) => kalemGuncelle(k.id, { ad: e.target.value }) }),
        React.createElement("input", { type: "number", style: { ...S.inp, width: 64 }, title: "Adet", value: k.adet ?? 1, onChange: (e) => kalemGuncelle(k.id, { adet: +e.target.value }) }),
        React.createElement("input", { type: "number", style: { ...S.inp, width: 90 }, title: "Birim Fiyat", value: k.birimFiyat ?? 0, onChange: (e) => kalemGuncelle(k.id, { birimFiyat: +e.target.value }) }),
        React.createElement("div", { style: { minWidth: 80, textAlign: "right", fontWeight: 700, color: C.accent, marginTop: 8 } }, fmtTL(k.tutar)),
        k.tur === "parca" && k.malzemeId && (() => {
          const m = malzemeler.find((x) => x.id === k.malzemeId);
          return m && +k.adet > +m.stokMiktari ? React.createElement("div", { style: { fontSize: 10.5, color: C.red, width: "100%" } }, "\u26A0\uFE0F Stokta yeterli yok (", m.stokMiktari, " ", m.birim || "", " var)") : null;
        })(),
        React.createElement("button", { style: S.btnR, onClick: () => kalemSil(k.id) }, "\u2715")
      )),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 14 } },
        React.createElement("button", { type: "button", style: S.btnO, onClick: () => kalemEkle("iscilik") }, "\u2795 \u0130\u015F\xE7ilik Ekle"),
        React.createElement("button", { type: "button", style: S.btnO, onClick: () => kalemEkle("parca") }, "\u2795 Par\xE7a Ekle")
      ),
      React.createElement("div", { style: { textAlign: "right", fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 16 } }, "Toplam: ", React.createElement("span", { style: { color: C.accent } }, fmtTL(formToplam))),

      React.createElement(FG, { label: "A\u015Fama" }, React.createElement("select", { style: S.sel, value: form.asama || "alindi", onChange: (e) => setForm((f) => ({ ...f, asama: e.target.value })) }, ASAMA_SIRA.map((k) => React.createElement("option", { key: k, value: k }, ASAMA_LABEL[k])), React.createElement("option", { value: "iptal" }, ASAMA_LABEL.iptal))),
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 14px", background: C.surface, borderRadius: 8 } },
        React.createElement("input", { type: "checkbox", checked: !!form.garantili, onChange: (e) => setForm((f) => ({ ...f, garantili: e.target.checked })), style: { width: 16, height: 16 } }),
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
    yeniAracAcik && React.createElement(Modal, { title: "\u2795 Yeni Ara\xE7 Ekle", onClose: () => setYeniAracAcik(false), width: 460 }, React.createElement(HizliAracFormu, { onClose: () => setYeniAracAcik(false), onEklendi: (yeni, tumAraclar, tumCariler) => {
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
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setSahipDuzenAcik(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: sahipKaydet }, "Kaydet"))
    ),
    odemeModal && React.createElement(
      Modal,
      { title: "\u{1F4B0} \xD6deme Al", onClose: () => setOdemeModal(null), width: 400 },
      React.createElement("div", { style: { fontSize: 13, color: C.muted, marginBottom: 14 } }, "Tutar: ", React.createElement("strong", { style: { color: C.white } }, fmtTL(odemeModal.tutar)), " \u2014 hangi hesaba girdi?"),
      React.createElement(FG, { label: "Hesap" }, React.createElement("select", { style: S.sel, value: odemeHesapId, onChange: (e) => setOdemeHesapId(e.target.value) }, hesaplar.length === 0 && React.createElement("option", { value: "" }, "\xD6nce Kasa & Banka'dan hesap ekleyin"), hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad, " (", fmtTL(h.bakiye), ")")))),
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
            React.createElement("div", { style: { fontSize: 12.5, color: C.white, fontWeight: 700 } }, ASAMA_LABEL[h.asama] || h.asama),
            React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 } }, fmtDate(h.tarih), h.not ? " \xB7 " + h.not : "")
          )))
    ),
    detayArac && React.createElement(AracDetayModal, { arac: detayArac, cariler, servisler: detayAracServisleri, onClose: () => setDetayAracId(null), onGuncelle: detayAracGuncelle })
  );
}
function PlakaKameraTarayici({ onSonuc }) {
  const [acik, setAcik] = useState(false);
  const [tarama, setTarama] = useState(false);
  const [hata, setHata] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const kamerayiKapat = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setAcik(false);
  };
  useEffect(() => () => kamerayiKapat(), []);

  const kamerayiAc = async () => {
    setHata("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHata("Bu cihaz/tarayıcı kamera erişimini desteklemiyor.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setAcik(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 0);
    } catch (e) {
      setHata("Kameraya erişilemedi: " + e.message);
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
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const { data } = await window.Tesseract.recognize(canvas, "eng");
      const ham = (data.text || "").toUpperCase();
      const eslesme = ham.match(/\d{2}\s?[A-Z]{1,3}\s?\d{2,4}/);
      const sonuc = eslesme ? plakaNormalize(eslesme[0]) : "";
      if (!sonuc) {
        setHata("Plaka okunamadı, ışığı/açıyı düzeltip tekrar deneyin veya elle girin.");
      } else {
        onSonuc(sonuc);
        kamerayiKapat();
      }
    } catch (e) {
      setHata("Okuma hatası: " + e.message);
    }
    setTarama(false);
  };

  if (!acik) {
    return /* @__PURE__ */ React.createElement("button", { type: "button", style: { ...S.btnO, marginBottom: 10 }, onClick: kamerayiAc }, "📷 Kamera ile Plaka Tara");
  }
  return /* @__PURE__ */ React.createElement("div", { style: { border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 10, background: C.surface } }, /* @__PURE__ */ React.createElement("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: { width: "100%", borderRadius: 8, marginBottom: 8, maxHeight: 240, objectFit: "cover", background: "#000" } }), hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12, marginBottom: 8 } }, "⚠️ ", hata), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { type: "button", style: { ...S.btn(), flex: 1 }, disabled: tarama, onClick: cekVeOku }, tarama ? "Okunuyor…" : "📸 Çek ve Oku"), /* @__PURE__ */ React.createElement("button", { type: "button", style: S.btnO, onClick: kamerayiKapat }, "İptal")));
}
function HizliAracFormu({ onClose, onEklendi }) {
  const [plaka, setPlaka] = useState("");
  const [marka, setMarka] = useState("");
  const [model, setModel] = useState("");
  const [musteriAdi, setMusteriAdi] = useState("");
  const [tel, setTel] = useState("");
  const [adres, setAdres] = useState("");
  const [hata, setHata] = useState("");
  const kaydet = () => {
    if (!plaka.trim()) {
      setHata("Plaka zorunludur.");
      return;
    }
    if (!musteriAdi.trim()) {
      setHata("M\xFC\u015Fteri / Firma ad\u0131 zorunludur.");
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
    const yeniCari = { id: uid(), ad: musteriAdi.trim(), tel: tel.trim(), adres: adres.trim() };
    const tumCariler = [...cariler, yeniCari];
    LS.set("cariler", tumCariler);
    const yeniArac = { id: uid(), musteriId: yeniCari.id, plaka: normalize, marka: marka.trim(), model: model.trim() };
    const tumAraclar = [...araclar, yeniArac];
    LS.set("araclar", tumAraclar);
    onEklendi(yeniArac, tumAraclar, tumCariler);
  };
  return /* @__PURE__ */ React.createElement(
    React.Fragment,
    null,
    /* @__PURE__ */ React.createElement(PlakaKameraTarayici, { onSonuc: (p) => setPlaka(p) }),
    /* @__PURE__ */ React.createElement(FG, { label: "Plaka" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: plaka, onChange: (e) => setPlaka(e.target.value), autoFocus: true, placeholder: "45 ABC 123" })),
    /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Marka" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: marka, onChange: (e) => setMarka(e.target.value) })), /* @__PURE__ */ React.createElement(FG, { label: "Model" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: model, onChange: (e) => setModel(e.target.value) }))),
    /* @__PURE__ */ React.createElement("div", { style: { ...S.secTitle, fontSize: 13, marginTop: 4 } }, "\u{1F464} Ara\xE7 Sahibi"),
    /* @__PURE__ */ React.createElement(FG, { label: "M\xFC\u015Fteri / Firma Ad\u0131" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: musteriAdi, onChange: (e) => setMusteriAdi(e.target.value) })),
    /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: tel, onChange: (e) => setTel(e.target.value) })), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: adres, onChange: (e) => setAdres(e.target.value) }))),
    hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: onClose }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))
  );
}
function UretimStok() {
  const [urunler, setUrunler] = useState(LS.get("urunler"));
  const [uretim, setUretim] = useState(LS.get("uretimKayitlari"));
  const [satislar, setSatislar] = useState(LS.get("satislar"));
  const [cariler] = useState(LS.get("cariler"));
  const [hesaplar] = useState(LS.get("hesaplar"));
  const [sekme, setSekme] = useState("stok");
  const [urunModal, setUrunModal] = useState(false);
  const [urunForm, setUrunForm] = useState({});
  const [girisModal, setGirisModal] = useState(false);
  const [girisForm, setGirisForm] = useState({});
  const [satisModal, setSatisModal] = useState(false);
  const [satisForm, setSatisForm] = useState({});
  const [hata, setHata] = useState("");
  const [arama, setArama] = useState("");

  const stokHesapla = (urunId) => uretim.filter((u) => u.urunId === urunId).reduce((t, u) => t + (+u.adet || 0), 0) - satislar.filter((s) => s.urunId === urunId).reduce((t, s) => t + (+s.adet || 0), 0);

  const aktifUrunler = urunler.filter((u) => u.aktif !== false);

  const urunKaydet = () => {
    if (!(urunForm.ad || "").trim()) {
      setHata("\xDCr\xFCn ad\u0131 zorunludur.");
      return;
    }
    if (!(+urunForm.satisFiyati >= 0)) {
      setHata("Ge\xE7erli bir sat\u0131\u015F fiyat\u0131 girin.");
      return;
    }
    setHata("");
    const kayit = { ...urunForm, id: urunForm.id || uid(), ad: urunForm.ad.trim(), kategori: urunForm.kategori || "Di\u011Fer", kaynak: urunForm.kaynak || "uretim", birim: urunForm.birim || "adet", satisFiyati: +urunForm.satisFiyati || 0, maliyet: +urunForm.maliyet || 0, kritikStok: +urunForm.kritikStok || 3, aktif: urunForm.aktif !== false };
    const yeni = urunForm.id ? urunler.map((u) => u.id === urunForm.id ? kayit : u) : [...urunler, kayit];
    LS.set("urunler", yeni);
    setUrunler(yeni);
    setUrunModal(false);
  };

  const urunSil = (id) => {
    if (uretim.some((u) => u.urunId === id) || satislar.some((s) => s.urunId === id)) {
      alert("Bu \xFCr\xFCne ait \xFCretim/sat\u0131\u015F kay\u0131tlar\u0131 var, \xF6nce onlar\u0131 silin ya da \xFCr\xFCn\xFC pasife al\u0131n.");
      return;
    }
    if (!confirm("Bu \xFCr\xFCn silinsin mi?")) return;
    const yeni = urunler.filter((u) => u.id !== id);
    LS.set("urunler", yeni);
    setUrunler(yeni);
  };

  const urunPasifYap = (u) => {
    const yeni = urunler.map((x) => x.id === u.id ? { ...x, aktif: !x.aktif } : x);
    LS.set("urunler", yeni);
    setUrunler(yeni);
  };

  const girisKaydet = () => {
    if (!girisForm.urunId) {
      setHata("\xDCr\xFCn se\xE7imi zorunludur.");
      return;
    }
    if (!(+girisForm.adet > 0)) {
      setHata("Adet 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    if (girisForm.odemeYapildi && !girisForm.hesapId) {
      setHata("\xD6demenin \xE7\u0131kaca\u011F\u0131 hesab\u0131 se\xE7in.");
      return;
    }
    setHata("");
    const kayit = { id: uid(), urunId: girisForm.urunId, tarih: girisForm.tarih || today(), adet: +girisForm.adet, birimMaliyet: +girisForm.birimMaliyet || 0, kaynak: girisForm.kaynak || (urunBul(urunler, girisForm.urunId) || {}).kaynak || "uretim", aciklama: girisForm.aciklama || "" };
    const yeni = [...uretim, kayit];
    LS.set("uretimKayitlari", yeni);
    setUretim(yeni);
    if (girisForm.odemeYapildi && +girisForm.odemeTutari > 0) {
      hesapHareketiKaydet(girisForm.hesapId, "cikis", +girisForm.odemeTutari, kayit.tarih, `\xDCr\xFCn al\u0131m\u0131 \u2014 ${urunAd(urunler, girisForm.urunId)} (${girisForm.adet} adet)`, "alim");
    }
    setGirisModal(false);
  };

  const girisSil = (id) => {
    if (!confirm("Bu stok giri\u015Fi kayd\u0131 silinsin mi?")) return;
    const yeni = uretim.filter((x) => x.id !== id);
    LS.set("uretimKayitlari", yeni);
    setUretim(yeni);
  };

  const satisKaydet = () => {
    if (!satisForm.musteriId) {
      setHata("M\xFC\u015Fteri se\xE7imi zorunludur.");
      return;
    }
    if (!satisForm.urunId) {
      setHata("\xDCr\xFCn se\xE7imi zorunludur.");
      return;
    }
    if (!(+satisForm.adet > 0)) {
      setHata("Adet 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    if (!satisForm.hesapId) {
      setHata("\xD6demenin girece\u011Fi hesab\u0131 se\xE7in.");
      return;
    }
    const mevcutStok = stokHesapla(satisForm.urunId);
    if (+satisForm.adet > mevcutStok) {
      setHata(`Yetersiz stok. Depoda ${mevcutStok} adet var.`);
      return;
    }
    setHata("");
    const urun = urunBul(urunler, satisForm.urunId);
    const birimFiyat = +satisForm.birimFiyat || (urun ? urun.satisFiyati : 0);
    const toplam = birimFiyat * +satisForm.adet;
    const kayit = { ...satisForm, id: uid(), tarih: satisForm.tarih || today(), birimFiyat, toplam, durum: satisForm.durum || "tamamlandi" };
    const yeni = [...satislar, kayit];
    LS.set("satislar", yeni);
    setSatislar(yeni);
    setSatisModal(false);
    hesapHareketiKaydet(satisForm.hesapId, "giris", toplam, kayit.tarih, `\xDCr\xFCn sat\u0131\u015F\u0131 \u2014 ${urunAd(urunler, satisForm.urunId)} (${cariAd(cariler, satisForm.musteriId)})`, "satis");
    faturaOlustur("urun_satis", kayit.id, kayit.musteriId, kayit.tarih, `${urunAd(urunler, kayit.urunId)} sat\u0131\u015F\u0131`, [{ ad: urunAd(urunler, kayit.urunId), adet: kayit.adet, birimFiyat: kayit.birimFiyat, tutar: kayit.toplam }], kayit.toplam);
  };

  const satisSil = (id) => {
    if (!confirm("Bu sat\u0131\u015F kayd\u0131 silinsin mi? (stok geri eklenir)")) return;
    const yeni = satislar.filter((x) => x.id !== id);
    LS.set("satislar", yeni);
    setSatislar(yeni);
  };

  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const filtreliUrunler = !aramaMetni ? urunler : urunler.filter((u) => (u.ad + " " + (u.kategori || "")).toLocaleLowerCase("tr-TR").includes(aramaMetni));

  return React.createElement(
    "div",
    { className: "fp-fade" },
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } },
      React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F6D2} \xDCretim & Stok"),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
        React.createElement("button", { style: S.btnO, onClick: () => { setUrunForm({ kategori: "Egzoz", kaynak: "uretim", birim: "adet", aktif: true }); setHata(""); setUrunModal(true); } }, "\u2795 Yeni \xDCr\xFCn"),
        React.createElement("button", { style: S.btnO, onClick: () => { setGirisForm({ tarih: today(), urunId: aktifUrunler[0]?.id || "" }); setHata(""); setGirisModal(true); } }, "\u{1F3ED} Stok Giri\u015Fi"),
        React.createElement("button", { style: S.btn(), onClick: () => { setSatisForm({ tarih: today(), urunId: aktifUrunler[0]?.id || "" }); setHata(""); setSatisModal(true); } }, "\u{1F4B0} Sat\u0131\u015F Yap")
      )
    ),
    React.createElement(
      Grid4,
      null,
      React.createElement(StatCard, { color: C.blue, icon: "\u{1F4E6}", value: aktifUrunler.length, label: "Aktif \xDCr\xFCn \xC7e\u015Fidi" }),
      React.createElement(StatCard, { color: C.purple, icon: "\u2696\uFE0F", value: `${aktifUrunler.reduce((t, u) => t + stokHesapla(u.id), 0)} adet`, label: "Toplam Stok" }),
      React.createElement(StatCard, { color: C.green, icon: "\u{1F3ED}", value: uretim.reduce((t, u) => t + (+u.adet || 0), 0), label: "Toplam Giren (T\xFCm Zamanlar)" }),
      React.createElement(StatCard, { color: C.accent, icon: "\u{1F4B0}", value: fmtTL(satislar.reduce((t, s) => t + (+s.toplam || 0), 0)), label: "Toplam Sat\u0131\u015F Geliri" })
    ),
    React.createElement(TabBar, { tabs: [["stok", "\u2696\uFE0F Stok \xD6zeti"], ["urunler", "\u{1F4E6} \xDCr\xFCn Katalo\u011Fu"], ["giris", "\u{1F3ED} Stok Giri\u015Fleri"], ["satis", "\u{1F4B0} Sat\u0131\u015F Kay\u0131tlar\u0131"]], active: sekme, onChange: setSekme }),

    sekme === "stok" && React.createElement(
      "div",
      { style: S.card },
      React.createElement("div", { style: S.secTitle }, "Anl\u0131k Stok Durumu"),
      aktifUrunler.length === 0
        ? React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Hen\xFCz \xFCr\xFCn eklenmedi. \xD6nce \u2795 Yeni \xDCr\xFCn ile \xFCr\xFCn kataloğunuzu olu\u015Fturun.")
        : aktifUrunler.map((u) => {
            const stok = stokHesapla(u.id);
            return React.createElement(
              "div",
              { key: u.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: C.surface, borderRadius: 10, marginBottom: 10, flexWrap: "wrap", gap: 8 } },
              React.createElement(
                "div",
                null,
                React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: C.white } }, u.ad),
                React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 } }, u.kategori, " \xB7 ", URUN_KAYNAK_LABEL[u.kaynak] || "", " \xB7 sat\u0131\u015F fiyat\u0131: ", fmtTL(u.satisFiyati))
              ),
              React.createElement(
                "div",
                { style: { fontSize: 24, fontWeight: 800, color: stok <= (+u.kritikStok || 3) ? C.red : C.white } },
                stok,
                " ",
                React.createElement("span", { style: { fontSize: 12, color: C.muted, fontWeight: 400 } }, u.birim || "adet")
              )
            );
          })
    ),

    sekme === "urunler" && React.createElement(
      "div",
      null,
      React.createElement("input", { style: { ...S.inp, marginBottom: 14, maxWidth: 360 }, placeholder: "\u{1F50D} \xDCr\xFCn veya kategori ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }),
      React.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 } },
        filtreliUrunler.length === 0 && React.createElement("div", { style: { color: C.muted } }, "Kay\u0131t bulunamad\u0131."),
        filtreliUrunler.map((u) => React.createElement(
          "div",
          { key: u.id, style: { ...S.card, marginBottom: 0, opacity: u.aktif === false ? 0.55 : 1 } },
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
            React.createElement(
              "div",
              null,
              React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: C.white } }, u.ad),
              React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 } }, u.kategori)
            ),
            React.createElement("span", { style: S.badge(u.kaynak === "disardan" ? C.blue : C.green) }, URUN_KAYNAK_LABEL[u.kaynak] || "")
          ),
          React.createElement("div", { style: { fontSize: 12, color: C.text, marginBottom: 4 } }, "Sat\u0131\u015F: ", React.createElement("strong", { style: { color: C.accent } }, fmtTL(u.satisFiyati)), u.maliyet > 0 && React.createElement("span", { style: { color: C.muted } }, " \xB7 maliyet: ", fmtTL(u.maliyet))),
          React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 10 } }, "Stok: ", React.createElement("strong", { style: { color: stokHesapla(u.id) <= (+u.kritikStok || 3) ? C.red : C.white } }, stokHesapla(u.id), " ", u.birim || "adet")),
          u.aciklama && React.createElement("div", { style: { fontSize: 11.5, color: C.muted, marginBottom: 10 } }, u.aciklama),
          React.createElement(
            "div",
            { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
            React.createElement("button", { style: { ...S.btnO, flex: 1, padding: "6px 10px", fontSize: 12 }, onClick: () => { setUrunForm(u); setHata(""); setUrunModal(true); } }, "\u270F\uFE0F D\xFCzenle"),
            React.createElement("button", { style: { ...S.btnO, flex: 1, padding: "6px 10px", fontSize: 12 }, onClick: () => urunPasifYap(u) }, u.aktif === false ? "\u2705 Aktif Et" : "\u23F8\uFE0F Pasife Al"),
            React.createElement("button", { style: S.btnR, onClick: () => urunSil(u.id) }, "\u{1F5D1}\uFE0F")
          )
        ))
      )
    ),

    sekme === "giris" && React.createElement(
      "div",
      { style: S.card },
      React.createElement(
        "table",
        { style: S.tbl },
        React.createElement("thead", null, React.createElement(
          "tr",
          null,
          React.createElement("th", { style: S.th }, "Tarih"),
          React.createElement("th", { style: S.th }, "\xDCr\xFCn"),
          React.createElement("th", { style: S.th }, "Kaynak"),
          React.createElement("th", { style: S.th }, "Adet"),
          React.createElement("th", { style: S.th }, "A\xE7\u0131klama"),
          React.createElement("th", { style: S.th })
        )),
        React.createElement(
          "tbody",
          null,
          uretim.length === 0
            ? React.createElement("tr", null, React.createElement("td", { style: S.td, colSpan: 6 }, React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Kay\u0131t yok.")))
            : [...uretim].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).map((u) => React.createElement(
                "tr",
                { key: u.id },
                React.createElement("td", { style: S.td }, fmtDate(u.tarih)),
                React.createElement("td", { style: S.td }, urunAd(urunler, u.urunId)),
                React.createElement("td", { style: S.td }, URUN_KAYNAK_LABEL[u.kaynak] || "\u2014"),
                React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.green } }, "+", u.adet)),
                React.createElement("td", { style: S.td }, u.aciklama || "\u2014"),
                React.createElement("td", { style: S.td }, React.createElement("button", { style: S.btnR, onClick: () => girisSil(u.id) }, "\u{1F5D1}\uFE0F"))
              ))
        )
      )
    ),

    sekme === "satis" && React.createElement(
      "div",
      { style: S.card },
      React.createElement(
        "table",
        { style: S.tbl },
        React.createElement("thead", null, React.createElement(
          "tr",
          null,
          React.createElement("th", { style: S.th }, "Tarih"),
          React.createElement("th", { style: S.th }, "M\xFC\u015Fteri"),
          React.createElement("th", { style: S.th }, "\xDCr\xFCn"),
          React.createElement("th", { style: S.th }, "Adet"),
          React.createElement("th", { style: S.th }, "Birim Fiyat"),
          React.createElement("th", { style: S.th }, "Toplam"),
          React.createElement("th", { style: S.th })
        )),
        React.createElement(
          "tbody",
          null,
          satislar.length === 0
            ? React.createElement("tr", null, React.createElement("td", { style: S.td, colSpan: 7 }, React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Kay\u0131t yok.")))
            : [...satislar].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).map((s) => React.createElement(
                "tr",
                { key: s.id },
                React.createElement("td", { style: S.td }, fmtDate(s.tarih)),
                React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, s.musteriId))),
                React.createElement("td", { style: S.td }, urunAd(urunler, s.urunId)),
                React.createElement("td", { style: S.td }, s.adet),
                React.createElement("td", { style: S.td }, fmtTL(s.birimFiyat)),
                React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.accent } }, fmtTL(s.toplam))),
                React.createElement("td", { style: S.td }, React.createElement(
                  "div",
                  { style: { display: "flex", gap: 6 } },
                  React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "PDF indir", onClick: () => fisYazdir("Sat\u0131\u015F Fi\u015Fi", [{ aciklama: `${urunAd(urunler, s.urunId)} \u2014 ${s.adet} adet x ${fmtTL(s.birimFiyat)}`, tutar: s.toplam }], s.toplam, cariAd(cariler, s.musteriId)) }, "\u{1F4C4}"),
                  React.createElement("button", { style: S.btnR, onClick: () => satisSil(s.id) }, "\u{1F5D1}\uFE0F")
                ))
              ))
        )
      )
    ),

    urunModal && React.createElement(
      Modal,
      { title: urunForm.id ? "\xDCr\xFCn\xFC D\xFCzenle" : "Yeni \xDCr\xFCn", onClose: () => setUrunModal(false) },
      React.createElement(FG, { label: "\xDCr\xFCn Ad\u0131" }, React.createElement("input", { style: S.inp, value: urunForm.ad || "", onChange: (e) => setUrunForm((f) => ({ ...f, ad: e.target.value })), placeholder: "\xD6rn: Sport Egzoz Ucu, Chiptuning Cihaz\u0131...", autoFocus: true })),
      React.createElement(
        Grid2,
        null,
        React.createElement(FG, { label: "Kategori" }, React.createElement("select", { style: S.sel, value: urunForm.kategori || "Di\u011Fer", onChange: (e) => setUrunForm((f) => ({ ...f, kategori: e.target.value })) }, URUN_KATEGORILERI.map((k) => React.createElement("option", { key: k, value: k }, k)))),
        React.createElement(FG, { label: "Kaynak" }, React.createElement("select", { style: S.sel, value: urunForm.kaynak || "uretim", onChange: (e) => setUrunForm((f) => ({ ...f, kaynak: e.target.value })) }, Object.entries(URUN_KAYNAK_LABEL).map(([k, l]) => React.createElement("option", { key: k, value: k }, l))))
      ),
      React.createElement(
        Grid2,
        null,
        React.createElement(FG, { label: "Sat\u0131\u015F Fiyat\u0131 (\u20BA)" }, React.createElement("input", { type: "number", style: S.inp, value: urunForm.satisFiyati ?? "", onChange: (e) => setUrunForm((f) => ({ ...f, satisFiyati: +e.target.value })) })),
        React.createElement(FG, { label: "Maliyet (\u20BA, opsiyonel)" }, React.createElement("input", { type: "number", style: S.inp, value: urunForm.maliyet ?? "", onChange: (e) => setUrunForm((f) => ({ ...f, maliyet: +e.target.value })) }))
      ),
      React.createElement(
        Grid2,
        null,
        React.createElement(FG, { label: "Birim" }, React.createElement("input", { style: S.inp, value: urunForm.birim || "adet", onChange: (e) => setUrunForm((f) => ({ ...f, birim: e.target.value })), placeholder: "adet, metre, kg..." })),
        React.createElement(FG, { label: "Kritik Stok Seviyesi" }, React.createElement("input", { type: "number", style: S.inp, value: urunForm.kritikStok ?? 3, onChange: (e) => setUrunForm((f) => ({ ...f, kritikStok: +e.target.value })) }))
      ),
      React.createElement(FG, { label: "A\xE7\u0131klama (opsiyonel)" }, React.createElement("input", { style: S.inp, value: urunForm.aciklama || "", onChange: (e) => setUrunForm((f) => ({ ...f, aciklama: e.target.value })) })),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 10, justifyContent: "flex-end" } },
        React.createElement("button", { style: S.btnO, onClick: () => setUrunModal(false) }, "\u0130ptal"),
        React.createElement("button", { style: S.btn(), onClick: urunKaydet }, "Kaydet")
      )
    ),

    girisModal && React.createElement(
      Modal,
      { title: "\u{1F3ED} Stok Giri\u015Fi (\xDCretim / Al\u0131m)", onClose: () => setGirisModal(false) },
      aktifUrunler.length === 0
        ? React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "\xD6nce \xFCr\xFCn kataloğuna en az bir \xFCr\xFCn ekleyin.")
        : React.createElement(
            React.Fragment,
            null,
            React.createElement(FG, { label: "\xDCr\xFCn" }, React.createElement("select", { style: S.sel, value: girisForm.urunId || "", onChange: (e) => setGirisForm((f) => ({ ...f, urunId: e.target.value })) }, aktifUrunler.map((u) => React.createElement("option", { key: u.id, value: u.id }, u.ad, " (\u015Fu an ", stokHesapla(u.id), " ", u.birim || "adet", ")")))),
            React.createElement(
              Grid2,
              null,
              React.createElement(FG, { label: "Tarih" }, React.createElement("input", { type: "date", style: S.inp, value: girisForm.tarih || "", onChange: (e) => setGirisForm((f) => ({ ...f, tarih: e.target.value })) })),
              React.createElement(FG, { label: "Adet" }, React.createElement("input", { type: "number", style: S.inp, value: girisForm.adet || "", onChange: (e) => setGirisForm((f) => ({ ...f, adet: +e.target.value })) }))
            ),
            React.createElement(FG, { label: "Kaynak" }, React.createElement("select", { style: S.sel, value: girisForm.kaynak || (urunBul(urunler, girisForm.urunId) || {}).kaynak || "uretim", onChange: (e) => setGirisForm((f) => ({ ...f, kaynak: e.target.value })) }, Object.entries(URUN_KAYNAK_LABEL).map(([k, l]) => React.createElement("option", { key: k, value: k }, l)))),
            React.createElement(FG, { label: "Birim Maliyet (\u20BA, opsiyonel)" }, React.createElement("input", { type: "number", style: S.inp, value: girisForm.birimMaliyet || "", onChange: (e) => setGirisForm((f) => ({ ...f, birimMaliyet: +e.target.value })) })),
            React.createElement(FG, { label: "A\xE7\u0131klama (opsiyonel)" }, React.createElement("input", { style: S.inp, value: girisForm.aciklama || "", onChange: (e) => setGirisForm((f) => ({ ...f, aciklama: e.target.value })) })),
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 } },
              React.createElement("input", { type: "checkbox", checked: !!girisForm.odemeYapildi, onChange: (e) => setGirisForm((f) => ({ ...f, odemeYapildi: e.target.checked })) }),
              React.createElement("label", { style: { fontSize: 12.5, color: C.text } }, "Bu al\u0131m i\xE7in \u015Fimdi \xF6deme yap\u0131ld\u0131 (kasadan/bankadan d\xFC\u015F\xFCls\xFCn)")
            ),
            girisForm.odemeYapildi && React.createElement(
              Grid2,
              null,
              React.createElement(FG, { label: "\xD6demenin \xC7\u0131kaca\u011F\u0131 Hesap" }, React.createElement("select", { style: S.sel, value: girisForm.hesapId || "", onChange: (e) => setGirisForm((f) => ({ ...f, hesapId: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad)))),
              React.createElement(FG, { label: "\xD6deme Tutar\u0131 (\u20BA)" }, React.createElement("input", { type: "number", style: S.inp, value: girisForm.odemeTutari || "", onChange: (e) => setGirisForm((f) => ({ ...f, odemeTutari: +e.target.value })) }))
            )
          ),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 10, justifyContent: "flex-end" } },
        React.createElement("button", { style: S.btnO, onClick: () => setGirisModal(false) }, "\u0130ptal"),
        aktifUrunler.length > 0 && React.createElement("button", { style: S.btn(), onClick: girisKaydet }, "Kaydet")
      )
    ),

    satisModal && React.createElement(
      Modal,
      { title: "Sat\u0131\u015F Yap", onClose: () => setSatisModal(false) },
      aktifUrunler.length === 0
        ? React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "\xD6nce \xFCr\xFCn kataloğuna en az bir \xFCr\xFCn ekleyin.")
        : React.createElement(
            React.Fragment,
            null,
            React.createElement(FG, { label: "M\xFC\u015Fteri" }, React.createElement("select", { style: S.sel, value: satisForm.musteriId || "", onChange: (e) => setSatisForm((f) => ({ ...f, musteriId: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), cariler.map((c) => React.createElement("option", { key: c.id, value: c.id }, c.ad)))),
            React.createElement(
              Grid2,
              null,
              React.createElement(FG, { label: "\xDCr\xFCn" }, React.createElement("select", { style: S.sel, value: satisForm.urunId || "", onChange: (e) => setSatisForm((f) => ({ ...f, urunId: e.target.value })) }, aktifUrunler.map((u) => React.createElement("option", { key: u.id, value: u.id }, u.ad, " (", stokHesapla(u.id), " ", u.birim || "adet", " var)")))),
              React.createElement(FG, { label: "Adet" }, React.createElement("input", { type: "number", style: S.inp, value: satisForm.adet || "", onChange: (e) => setSatisForm((f) => ({ ...f, adet: +e.target.value })) }))
            ),
            React.createElement(FG, { label: `Birim Fiyat (\u20BA) \u2014 bo\u015F b\u0131rak\u0131l\u0131rsa \xFCr\xFCn\xFCn varsay\u0131lan fiyat\u0131 ${satisForm.urunId ? fmtTL((urunBul(urunler, satisForm.urunId) || {}).satisFiyati || 0) : ""} kullan\u0131l\u0131r` }, React.createElement("input", { type: "number", style: S.inp, value: satisForm.birimFiyat || "", onChange: (e) => setSatisForm((f) => ({ ...f, birimFiyat: +e.target.value })) })),
            React.createElement(FG, { label: "\xD6demenin Girece\u011Fi Hesap" }, React.createElement("select", { style: S.sel, value: satisForm.hesapId || "", onChange: (e) => setSatisForm((f) => ({ ...f, hesapId: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad))))
          ),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 10, justifyContent: "flex-end" } },
        React.createElement("button", { style: S.btnO, onClick: () => setSatisModal(false) }, "\u0130ptal"),
        aktifUrunler.length > 0 && React.createElement("button", { style: S.btn(), onClick: satisKaydet }, "Kaydet")
      )
    )
  );
}
function Cariler() {
  const [liste, setListe] = useState(LS.get("cariler"));
  const [servisler] = useState(LS.get("servisIsleri"));
  const [satislar] = useState(LS.get("satislar"));
  const [urunler] = useState(LS.get("urunler"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [arama, setArama] = useState("");
  const [ekstreId, setEkstreId] = useState(null);
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
    if (servisler.some((s) => s.musteriId === id) || satislar.some((s) => s.musteriId === id)) {
      alert("Bu m\xFC\u015Fteriye ait kay\u0131tlar var, \xF6nce onlar\u0131 d\xFCzenleyin/silin.");
      return;
    }
    if (!confirm("Bu m\xFC\u015Fteri silinsin mi?")) return;
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("cariler", yeni);
    setListe(yeni);
  };
  const harcama = (id) => servisler.filter((s) => s.musteriId === id).reduce((t, s) => t + (+s.tutar || 0), 0) + satislar.filter((s) => s.musteriId === id).reduce((t, s) => t + (+s.toplam || 0), 0);
  const borc = (id) => servisler.filter((s) => s.musteriId === id && !s.odendi).reduce((t, s) => t + (+s.tutar || 0), 0);
  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const filtreliListe = !aramaMetni ? liste : liste.filter((c) => (c.ad + " " + (c.tel || "") + " " + (c.adres || "")).toLocaleLowerCase("tr-TR").includes(aramaMetni));
  const ekstreCari = ekstreId && liste.find((c) => c.id === ekstreId);
  const ekstreHareketleri = ekstreId ? [
    ...servisler.filter((s) => s.musteriId === ekstreId).map((s) => ({ tarih: s.tarih, aciklama: `\u{1F527} ${HIZMET_TIP_LABEL[s.hizmetTuru] || ""}`, tutar: s.tutar, odendi: s.odendi })),
    ...satislar.filter((s) => s.musteriId === ekstreId).map((s) => ({ tarih: s.tarih, aciklama: `\u{1F6D2} ${urunAd(urunler, s.urunId)} (${s.adet} adet)`, tutar: s.toplam, odendi: true }))
  ].sort((a, b) => (a.tarih || "").localeCompare(b.tarih || "")) : [];
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F465} M\xFC\u015Fteriler"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setForm({});
    setModalAcik(true);
  } }, "\u2795 Yeni M\xFC\u015Fteri")), /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, marginBottom: 16, maxWidth: 360 }, placeholder: "\u{1F50D} \u0130sim, telefon veya adreste ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 } }, filtreliListe.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Kay\u0131t bulunamad\u0131."), filtreliListe.map((c) => {
    const acikBorc = borc(c.id);
    return /* @__PURE__ */ React.createElement("div", { key: c.id, style: S.card }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 4 } }, c.ad), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 2 } }, c.tel || "Telefon yok"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 12 } }, c.adres || "Adres yok"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.accent, fontWeight: 700, marginBottom: 4 } }, "Toplam i\u015Flem: ", fmtTL(harcama(c.id))), acikBorc > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 8 } }, "A\xE7\u0131k bor\xE7: ", fmtTL(acikBorc)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, flex: 1 }, onClick: () => setEkstreId(c.id) }, "\u{1F4CB} Ekstre"), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, flex: 1 }, onClick: () => {
      setForm(c);
      setModalAcik(true);
    } }, "\u270F\uFE0F"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => sil(c.id) }, "\u{1F5D1}\uFE0F")));
  })), modalAcik && /* @__PURE__ */ React.createElement(Modal, { title: form.id ? "M\xFC\u015Fteriyi D\xFCzenle" : "Yeni M\xFC\u015Fteri", onClose: () => setModalAcik(false), width: 420 }, /* @__PURE__ */ React.createElement(FG, { label: "M\xFC\u015Fteri / Firma Ad\u0131" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.ad || "", onChange: (e) => setForm((f) => ({ ...f, ad: e.target.value })), autoFocus: true })), /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.tel || "", onChange: (e) => setForm((f) => ({ ...f, tel: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.adres || "", onChange: (e) => setForm((f) => ({ ...f, adres: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))), ekstreCari && /* @__PURE__ */ React.createElement(Modal, { title: `\u{1F4CB} ${ekstreCari.ad} \u2014 Cari Hesap Ekstresi`, onClose: () => setEkstreId(null), width: 640 }, /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement("div", { style: { ...S.card, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted } }, "Toplam \u0130\u015Flem Hacmi"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, fmtTL(harcama(ekstreCari.id)))), /* @__PURE__ */ React.createElement("div", { style: { ...S.card, marginBottom: 14, borderTop: `3px solid ${C.red}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted } }, "A\xE7\u0131k Bor\xE7"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.red } }, fmtTL(borc(ekstreCari.id))))), ekstreHareketleri.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Hen\xFCz i\u015Flem yok.") : /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "A\xE7\u0131klama"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tutar"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Durum"))), /* @__PURE__ */ React.createElement("tbody", null, ekstreHareketleri.map(
    (h, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(h.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, h.aciklama), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.accent } }, fmtTL(h.tutar))), /* @__PURE__ */ React.createElement("td", { style: S.td }, h.odendi ? /* @__PURE__ */ React.createElement(Badge, { d: "tamamlandi", map: { tamamlandi: "\xD6dendi" }, renk: { tamamlandi: C.green } }) : /* @__PURE__ */ React.createElement(Badge, { d: "bekliyor", map: { bekliyor: "Bekliyor" }, renk: { bekliyor: C.yellow } })))
  )))));
}
function Muhasebe() {
  const [servisler] = useState(LS.get("servisIsleri"));
  const [satislar] = useState(LS.get("satislar"));
  const [faturalar, setFaturalar] = useState(LS.get("faturalar"));
  const [faturaModal, setFaturaModal] = useState(false);
  const [faturaForm, setFaturaForm] = useState({});
  const [hesaplar, setHesaplar] = useState(LS.get("hesaplar"));
  const [hareketler, setHareketler] = useState(LS.get("kasaHareketleri"));
  const [cekSenetler, setCekSenetler] = useState(LS.get("cekSenetler"));
  const [giderler, setGiderler] = useState(LS.get("giderler"));
  const [cariler] = useState(LS.get("cariler"));
  const [sekme, setSekme] = useState("faturalar");
  const [arama, setArama] = useState("");
  const [giderModal, setGiderModal] = useState(false);
  const [giderForm, setGiderForm] = useState({});
  const [hesapModal, setHesapModal] = useState(false);
  const [hesapForm, setHesapForm] = useState({});
  const [hareketModal, setHareketModal] = useState(false);
  const [hareketForm, setHareketForm] = useState({});
  const [cekModal, setCekModal] = useState(false);
  const [cekForm, setCekForm] = useState({});
  const [detayHesapId, setDetayHesapId] = useState(null);
  const [hata, setHata] = useState("");

  const faturaOdendiMi = (f) => f.tur === "urun_satis" ? true : !!(servisler.find((s) => s.id === f.kaynakId) || {}).odendi;

  const toplamGelir = [...servisler.map((s) => +s.tutar || 0), ...satislar.map((s) => +s.toplam || 0)].reduce((t, v) => t + v, 0);
  const toplamGider = giderler.reduce((t, g) => t + (+g.tutar || 0), 0);
  const netKar = toplamGelir - toplamGider;
  const tahsilEdilecek = servisler.filter((s) => !s.odendi && s.durum === "tamamlandi").reduce((t, s) => t + (+s.tutar || 0), 0);
  const toplamBakiye = hesaplar.reduce((t, h) => t + (+h.bakiye || 0), 0);
  const portfoyToplam = cekSenetler.filter((c) => c.durum === "portfoyde").reduce((t, c) => t + (+c.tutar || 0), 0);
  const vadesiYaklasanlar = cekSenetler.filter((c) => {
    if (c.durum !== "portfoyde" || !c.vadeTarihi) return false;
    const kalanGun = Math.ceil((new Date(c.vadeTarihi) - new Date(today())) / 864e5);
    return kalanGun <= 7;
  });

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
      hesapHareketiKaydet(giderForm.hesapId, "cikis", kayit.tutar, kayit.tarih, `${kayit.kategori}${kayit.aciklama ? " \u2014 " + kayit.aciklama : ""}`, "gider");
      setHesaplar(LS.get("hesaplar"));
    }
  };
  const giderSil = (id) => {
    if (!confirm("Bu gider kayd\u0131 silinsin mi?")) return;
    const yeni = giderler.filter((x) => x.id !== id);
    LS.set("giderler", yeni);
    setGiderler(yeni);
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
    const kayit = { id: uid(), hesapId: hareketForm.hesapId, tur: yon, tutar: +hareketForm.tutar, tarih: hareketForm.tarih || today(), aciklama: hareketForm.aciklama || "", kaynak: "manuel" };
    const yeniHareketler = [...hareketler, kayit];
    LS.set("kasaHareketleri", yeniHareketler);
    setHareketler(yeniHareketler);
    const yeniHesaplar = hesaplar.map((h) => h.id === hareketForm.hesapId ? { ...h, bakiye: (+h.bakiye || 0) + (yon === "giris" ? +hareketForm.tutar : -hareketForm.tutar) } : h);
    LS.set("hesaplar", yeniHesaplar);
    setHesaplar(yeniHesaplar);
    setHareketModal(false);
    setHareketForm({});
  };
  const cekKaydet = () => {
    if (!cekForm.musteriId) {
      setHata("Cari se\xE7imi zorunludur.");
      return;
    }
    if (!(+cekForm.tutar > 0)) {
      setHata("Tutar 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    if (!cekForm.vadeTarihi) {
      setHata("Vade tarihi zorunludur.");
      return;
    }
    setHata("");
    const kayit = { ...cekForm, id: cekForm.id || uid(), durum: cekForm.durum || "portfoyde", tur: cekForm.tur || "cek" };
    const yeni = cekForm.id ? cekSenetler.map((x) => x.id === cekForm.id ? kayit : x) : [...cekSenetler, kayit];
    LS.set("cekSenetler", yeni);
    setCekSenetler(yeni);
    setCekModal(false);
  };
  const cekSil = (id) => {
    if (!confirm("Bu kay\u0131t silinsin mi?")) return;
    const yeni = cekSenetler.filter((x) => x.id !== id);
    LS.set("cekSenetler", yeni);
    setCekSenetler(yeni);
  };
  const cekDurumGuncelle = (id, durum) => {
    const yeni = cekSenetler.map((x) => x.id === id ? { ...x, durum } : x);
    LS.set("cekSenetler", yeni);
    setCekSenetler(yeni);
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
    if (!confirm("Bu fatura kalıcı olarak silinsin mi?")) return;
    const yeni = faturalar.filter((x) => x.id !== id);
    LS.set("faturalar", yeni);
    setFaturalar(yeni);
  };

  const detayHareketler = detayHesapId ? hareketler.filter((h) => h.hesapId === detayHesapId).sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")) : [];
  const detayHesap = detayHesapId && hesaplar.find((h) => h.id === detayHesapId);

  return React.createElement(
    "div",
    { className: "fp-fade" },
    React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 4 } }, "\u{1F4B0} Muhasebe"),
    React.createElement("div", { style: { fontSize: 13, color: C.muted, marginBottom: 16 } }, "Faturalar, gelir/gider, kasa/banka hesaplar\u0131 ve \xE7ek/senet takibi tek yerde."),
    React.createElement(
      Grid4,
      null,
      React.createElement(StatCard, { color: C.green, icon: "\u{1F4B0}", value: fmtTL(toplamGelir), label: "Toplam Gelir" }),
      React.createElement(StatCard, { color: C.red, icon: "\u{1F4C9}", value: fmtTL(toplamGider), label: "Toplam Gider" }),
      React.createElement(StatCard, { color: netKar >= 0 ? C.accent : C.red, icon: "\u{1F4CA}", value: fmtTL(netKar), label: "Net K\xE2r/Zarar" }),
      React.createElement(StatCard, { color: C.blue, icon: "\u23F3", value: fmtTL(tahsilEdilecek), label: "Tahsil Edilecek" }),
      React.createElement(StatCard, { color: C.accent, icon: "\u{1F3E6}", value: fmtTL(toplamBakiye), label: "Toplam Bakiye (T\xFCm Hesaplar)" }),
      React.createElement(StatCard, { color: vadesiYaklasanlar.length > 0 ? C.red : C.green, icon: "\u{1F4C4}", value: fmtTL(portfoyToplam), label: "Portf\xF6ydeki \xC7ek/Senet", sub: vadesiYaklasanlar.length > 0 ? `${vadesiYaklasanlar.length} tanesinin vadesi yakla\u015Ft\u0131` : "" })
    ),
    React.createElement(TabBar, { tabs: [["faturalar", `\u{1F9FE} Faturalar (${faturalar.length})`], ["giderler", `\u{1F4C9} Giderler (${giderler.length})`], ["hesaplar", "\u{1F3E6} Hesaplar"], ["cekSenet", `\u{1F4C4} \xC7ek/Senet (${cekSenetler.length})`]], active: sekme, onChange: setSekme }),

    sekme === "faturalar" && React.createElement(
      "div",
      { style: S.card },
      React.createElement("input", { style: { ...S.inp, marginBottom: 14 }, placeholder: "\u{1F50D} Fatura no, m\xFC\u015Fteri veya a\xE7\u0131klamada ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }),
      React.createElement(
        "table",
        { style: S.tbl },
        React.createElement("thead", null, React.createElement(
          "tr",
          null,
          React.createElement("th", { style: S.th }, "Fatura No"),
          React.createElement("th", { style: S.th }, "Tarih"),
          React.createElement("th", { style: S.th }, "M\xFC\u015Fteri"),
          React.createElement("th", { style: S.th }, "A\xE7\u0131klama"),
          React.createElement("th", { style: S.th }, "Ara Toplam"),
          React.createElement("th", { style: S.th }, "KDV"),
          React.createElement("th", { style: S.th }, "Toplam"),
          React.createElement("th", { style: S.th }, "Ödeme"),
          React.createElement("th", { style: S.th })
        )),
        React.createElement(
          "tbody",
          null,
          filtreliFaturalar.length === 0
            ? React.createElement("tr", null, React.createElement("td", { style: S.td, colSpan: 9 }, React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Hen\xFCz fatura yok. Bir servis i\u015Fi \"Teslim Edildi\" a\u015Famas\u0131na ge\xE7ti\u011Finde veya bir \xFCr\xFCn sat\u0131ld\u0131\u011F\u0131nda otomatik olu\u015Fur.")))
            : [...filtreliFaturalar].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).map((f) => React.createElement(
                "tr",
                { key: f.id },
                React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.accent } }, f.faturaNo)),
                React.createElement("td", { style: S.td }, fmtDate(f.tarih)),
                React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, f.musteriId))),
                React.createElement("td", { style: S.td }, f.aciklama),
                React.createElement("td", { style: S.td }, fmtTL(f.araToplam)),
                React.createElement("td", { style: S.td }, fmtTL(f.kdvTutari)),
                React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.accent } }, fmtTL(f.toplam))),
                React.createElement("td", { style: S.td }, faturaOdendiMi(f) ? React.createElement(Badge, { d: "tamamlandi", map: { tamamlandi: "\xD6dendi" }, renk: { tamamlandi: C.green } }) : React.createElement(Badge, { d: "bekliyor", map: { bekliyor: "Bekliyor" }, renk: { bekliyor: C.yellow } })),
                React.createElement("td", { style: S.td }, React.createElement("div", { style: { display: "flex", gap: 6 } },
                  React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => faturaYazdir(f, cariAd(cariler, f.musteriId)) }, "\u{1F4C4} PDF"),
                  React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => faturaDuzenle(f) }, "\u270F\uFE0F"),
                  React.createElement("button", { style: S.btnR, onClick: () => faturaSil(f.id) }, "\u{1F5D1}\uFE0F")
                ))
              ))
        )
      )
    ),

    sekme === "giderler" && React.createElement(
      "div",
      null,
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 14 } }, React.createElement("button", { style: S.btn(), onClick: () => { setGiderForm({ tarih: today(), kategori: GIDER_KATEGORILERI[0] }); setHata(""); setGiderModal(true); } }, "\u2796 Yeni Gider Ekle")),
      React.createElement(
        "div",
        { style: S.card },
        React.createElement(
          "table",
          { style: S.tbl },
          React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", { style: S.th }, "Tarih"), React.createElement("th", { style: S.th }, "Kategori"), React.createElement("th", { style: S.th }, "A\xE7\u0131klama"), React.createElement("th", { style: S.th }, "Tutar"), React.createElement("th", { style: S.th }))),
          React.createElement(
            "tbody",
            null,
            giderler.length === 0
              ? React.createElement("tr", null, React.createElement("td", { style: S.td, colSpan: 5 }, React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Hen\xFCz gider kayd\u0131 yok.")))
              : [...giderler].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).map((g) => React.createElement(
                  "tr",
                  { key: g.id },
                  React.createElement("td", { style: S.td }, fmtDate(g.tarih)),
                  React.createElement("td", { style: S.td }, React.createElement(Badge, { d: g.kategori, map: Object.fromEntries(GIDER_KATEGORILERI.map((k) => [k, k])), renk: Object.fromEntries(GIDER_KATEGORILERI.map((k) => [k, C.steel])) })),
                  React.createElement("td", { style: S.td }, g.aciklama || "\u2014"),
                  React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.red } }, "-", fmtTL(g.tutar))),
                  React.createElement("td", { style: S.td }, React.createElement("div", { style: { display: "flex", gap: 6 } }, React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => { setGiderForm(g); setHata(""); setGiderModal(true); } }, "\u270F\uFE0F"), React.createElement("button", { style: S.btnR, onClick: () => giderSil(g.id) }, "\u{1F5D1}\uFE0F")))
                ))
          )
        )
      )
    ),

    sekme === "hesaplar" && React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 14 } },
        React.createElement("button", { style: S.btnO, onClick: () => { setHesapForm({ tur: "kasa" }); setHata(""); setHesapModal(true); } }, "\u2795 Yeni Hesap"),
        React.createElement("button", { style: S.btn(), onClick: () => { setHareketForm({ tarih: today(), yon: "giris" }); setHata(""); setHareketModal(true); } }, "\u{1F4B5} Yeni \u0130\u015Flem")
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

    sekme === "cekSenet" && React.createElement(
      "div",
      null,
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 14 } }, React.createElement("button", { style: S.btn(), onClick: () => { setCekForm({ tur: "cek", durum: "portfoyde" }); setHata(""); setCekModal(true); } }, "\u2795 Yeni \xC7ek/Senet")),
      React.createElement(
        "div",
        { style: S.card },
        React.createElement(
          "table",
          { style: S.tbl },
          React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", { style: S.th }, "T\xFCr"), React.createElement("th", { style: S.th }, "Cari"), React.createElement("th", { style: S.th }, "Vade Tarihi"), React.createElement("th", { style: S.th }, "Tutar"), React.createElement("th", { style: S.th }, "Durum"), React.createElement("th", { style: S.th }))),
          React.createElement(
            "tbody",
            null,
            cekSenetler.length === 0
              ? React.createElement("tr", null, React.createElement("td", { style: S.td, colSpan: 6 }, React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Hen\xFCz kay\u0131t yok.")))
              : [...cekSenetler].sort((a, b) => (a.vadeTarihi || "").localeCompare(b.vadeTarihi || "")).map((c) => React.createElement(
                  "tr",
                  { key: c.id },
                  React.createElement("td", { style: S.td }, CEK_SENET_TUR_LABEL[c.tur]),
                  React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, c.musteriId))),
                  React.createElement("td", { style: S.td }, fmtDate(c.vadeTarihi)),
                  React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: C.accent } }, fmtTL(c.tutar))),
                  React.createElement("td", { style: S.td }, React.createElement(Badge, { d: c.durum, map: CEK_SENET_DURUM_LABEL, renk: CEK_SENET_DURUM_RENK })),
                  React.createElement("td", { style: S.td }, React.createElement("div", { style: { display: "flex", gap: 6 } }, c.durum === "portfoyde" && React.createElement("button", { style: { ...S.btnO, padding: "5px 8px", fontSize: 11 }, onClick: () => cekDurumGuncelle(c.id, "tahsil") }, "\u2713 Tahsil Et"), React.createElement("button", { style: S.btnR, onClick: () => cekSil(c.id) }, "\u{1F5D1}\uFE0F")))
                ))
          )
        )
      )
    ),

    giderModal && React.createElement(
      Modal,
      { title: giderForm.id ? "Gideri D\xFCzenle" : "Yeni Gider", onClose: () => setGiderModal(false), width: 460 },
      React.createElement(FG, { label: "Tarih" }, React.createElement("input", { type: "date", style: S.inp, value: giderForm.tarih || "", onChange: (e) => setGiderForm((f) => ({ ...f, tarih: e.target.value })) })),
      React.createElement(FG, { label: "Kategori" }, React.createElement("select", { style: S.sel, value: giderForm.kategori || "", onChange: (e) => setGiderForm((f) => ({ ...f, kategori: e.target.value })) }, GIDER_KATEGORILERI.map((k) => React.createElement("option", { key: k, value: k }, k)))),
      React.createElement(FG, { label: "A\xE7\u0131klama" }, React.createElement("input", { style: S.inp, value: giderForm.aciklama || "", onChange: (e) => setGiderForm((f) => ({ ...f, aciklama: e.target.value })) })),
      React.createElement(FG, { label: "Tutar (\u20BA)" }, React.createElement("input", { type: "number", style: S.inp, value: giderForm.tutar || "", onChange: (e) => setGiderForm((f) => ({ ...f, tutar: +e.target.value })) })),
      !giderForm.id && React.createElement(FG, { label: "\xD6demenin \xC7\u0131kt\u0131\u011F\u0131 Hesap (opsiyonel)" }, React.createElement("select", { style: S.sel, value: giderForm.hesapId || "", onChange: (e) => setGiderForm((f) => ({ ...f, hesapId: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Sadece kayda ge\xE7sin, hesaptan d\xFC\u015F\xFClmesin \u2014"), hesaplar.map((h) => React.createElement("option", { key: h.id, value: h.id }, h.ad, " (", fmtTL(h.bakiye), ")")))),
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
        React.createElement("input", { type: "number", style: { ...S.inp, width: 90 }, title: "Birim Fiyat", value: k.birimFiyat ?? 0, onChange: (e) => faturaKalemGuncelle(k.id, { birimFiyat: +e.target.value }) }),
        React.createElement("span", { style: { fontSize: 12.5, color: C.muted, minWidth: 70, textAlign: "right" } }, fmtTL(k.tutar)),
        React.createElement("button", { style: S.btnR, onClick: () => faturaKalemSil(k.id) }, "\u2715")
      ))),
      React.createElement("button", { type: "button", style: { ...S.btnO, marginBottom: 14 }, onClick: faturaKalemEkle }, "\u2795 Kalem Ekle"),
      React.createElement("div", { style: { textAlign: "right", fontSize: 15, fontWeight: 800, color: C.accent, marginBottom: 12 } }, "Toplam: ", fmtTL((faturaForm.kalemler || []).reduce((t, k) => t + (+k.tutar || 0), 0))),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26a0\ufe0f ", hata),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setFaturaModal(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: faturaKaydet }, "Kaydet"))
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
      React.createElement(FG, { label: "Tarih" }, React.createElement("input", { type: "date", style: S.inp, value: hareketForm.tarih || "", onChange: (e) => setHareketForm((f) => ({ ...f, tarih: e.target.value })) })),
      React.createElement(FG, { label: "A\xE7\u0131klama" }, React.createElement("input", { style: S.inp, value: hareketForm.aciklama || "", onChange: (e) => setHareketForm((f) => ({ ...f, aciklama: e.target.value })) })),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setHareketModal(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: hareketKaydet }, "Kaydet"))
    ),

    cekModal && React.createElement(
      Modal,
      { title: "Yeni \xC7ek/Senet", onClose: () => setCekModal(false), width: 440 },
      React.createElement(
        Grid2,
        null,
        React.createElement(FG, { label: "T\xFCr" }, React.createElement("select", { style: S.sel, value: cekForm.tur || "cek", onChange: (e) => setCekForm((f) => ({ ...f, tur: e.target.value })) }, Object.entries(CEK_SENET_TUR_LABEL).map(([k, l]) => React.createElement("option", { key: k, value: k }, l)))),
        React.createElement(FG, { label: "Vade Tarihi" }, React.createElement("input", { type: "date", style: S.inp, value: cekForm.vadeTarihi || "", onChange: (e) => setCekForm((f) => ({ ...f, vadeTarihi: e.target.value })) }))
      ),
      React.createElement(FG, { label: "Cari" }, React.createElement("select", { style: S.sel, value: cekForm.musteriId || "", onChange: (e) => setCekForm((f) => ({ ...f, musteriId: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), cariler.map((c) => React.createElement("option", { key: c.id, value: c.id }, c.ad)))),
      React.createElement(FG, { label: "Tutar (\u20BA)" }, React.createElement("input", { type: "number", style: S.inp, value: cekForm.tutar || "", onChange: (e) => setCekForm((f) => ({ ...f, tutar: +e.target.value })) })),
      React.createElement(FG, { label: "Not (opsiyonel)" }, React.createElement("input", { style: S.inp, value: cekForm.not || "", onChange: (e) => setCekForm((f) => ({ ...f, not: e.target.value })) })),
      hata && React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata),
      React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, React.createElement("button", { style: S.btnO, onClick: () => setCekModal(false) }, "\u0130ptal"), React.createElement("button", { style: S.btn(), onClick: cekKaydet }, "Kaydet"))
    ),

    detayHesap && React.createElement(
      Modal,
      { title: `${detayHesap.ad} \u2014 \u0130\u015Flem Ge\xE7mi\u015Fi`, onClose: () => setDetayHesapId(null), width: 560 },
      detayHareketler.length === 0
        ? React.createElement("div", { style: { color: C.muted } }, "Bu hesapta i\u015Flem yok.")
        : React.createElement(
            "table",
            { style: S.tbl },
            React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", { style: S.th }, "Tarih"), React.createElement("th", { style: S.th }, "A\xE7\u0131klama"), React.createElement("th", { style: S.th }, "Y\xF6n"), React.createElement("th", { style: S.th }, "Tutar"))),
            React.createElement("tbody", null, detayHareketler.map((h) => React.createElement(
              "tr",
              { key: h.id },
              React.createElement("td", { style: S.td }, fmtDate(h.tarih)),
              React.createElement("td", { style: S.td }, h.aciklama || "\u2014"),
              React.createElement("td", { style: S.td }, h.tur === "giris" ? "\u2795 Giri\u015F" : "\u2796 \xC7\u0131k\u0131\u015F"),
              React.createElement("td", { style: S.td }, React.createElement("strong", { style: { color: h.tur === "giris" ? C.green : C.red } }, h.tur === "giris" ? "+" : "-", fmtTL(h.tutar)))
            )))
          )
    )
  );
}
function Ayarlar() {
  const [form, setForm] = useState(getSettings());
  const [kaydedildi, setKaydedildi] = useState(false);
  const [bulutTest, setBulutTest] = useState("");
  const [bulutIslemDevam, setBulutIslemDevam] = useState(false);
  const [aiTest, setAiTest] = useState("");
  const [aiTestDevam, setAiTestDevam] = useState(false);
  const kaydet = () => {
    saveSettings(form);
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2e3);
  };
  const bulutTestEt = async () => {
    setBulutIslemDevam(true);
    setBulutTest("");
    try {
      saveSettings(form);
      if (!form.bulutKutuAdi) throw new Error("\xD6nce bir kutu ad\u0131 girin.");
      await fetch(bulutUrl("_baglantiTesti"), { method: "PUT", body: JSON.stringify(Date.now()) });
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
        await fetch(bulutUrl(anahtar), { method: "PUT", body: JSON.stringify(LS.get(anahtar)) });
      }
      await fetch(bulutUrl("ayarlar"), { method: "PUT", body: JSON.stringify(getSettings()) });
      const zamanDamgasi = Date.now();
      await fetch(bulutUrl("_sonGuncelleme"), { method: "PUT", body: JSON.stringify(zamanDamgasi) });
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
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 16 } }, "\u2699\uFE0F Ayarlar"), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F3E2} Firma Bilgileri"), /* @__PURE__ */ React.createElement(FG, { label: "Firma Ad\u0131" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaAdi || "", onChange: (e) => setForm((f) => ({ ...f, firmaAdi: e.target.value })) })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaTel || "", onChange: (e) => setForm((f) => ({ ...f, firmaTel: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "KDV Oran\u0131 (%)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.kdvOrani || "", onChange: (e) => setForm((f) => ({ ...f, kdvOrani: +e.target.value })) }))), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaAdres || "", onChange: (e) => setForm((f) => ({ ...f, firmaAdres: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u2601\uFE0F Bulut Senkronizasyonu"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Verileriniz farkl\u0131 cihazlarda (telefon, bilgisayar) ayn\u0131 g\xF6r\xFCns\xFCn istiyorsan\u0131z kullan\u0131n. ", /* @__PURE__ */ React.createElement("a", { href: "https://kvdb.io/", target: "_blank", rel: "noopener noreferrer", style: { color: C.accent } }, "kvdb.io"), `'ya gidip "Create a new bucket" ile \xFCcretsiz bir kutu olu\u015Fturun, adres \xE7ubu\u011Fundaki kodu a\u015Fa\u011F\u0131ya yap\u0131\u015Ft\u0131r\u0131n. Hesap gerekmez.`), /* @__PURE__ */ React.createElement(FG, { label: "Kutu Ad\u0131 (kvdb.io/xxxx adresindeki kod)" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.bulutKutuAdi || "", onChange: (e) => setForm((f) => ({ ...f, bulutKutuAdi: e.target.value.trim() })), placeholder: "AbCdEfGhIjKlMnOpQrSt" })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: bulutTestEt, disabled: bulutIslemDevam }, "\u{1F50C} Ba\u011Flant\u0131y\u0131 Test Et"), form.bulutKutuAdi && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: bulutaYukle, disabled: bulutIslemDevam }, "\u2B06\uFE0F Buluta Y\xFCkle (Bu Cihazdan)"), /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: buluttanIndir, disabled: bulutIslemDevam }, "\u2B07\uFE0F Buluttan \u0130ndir (Di\u011Fer Cihazdan)"))), bulutTest === "basarili" && /* @__PURE__ */ React.createElement("div", { style: { ...S.alert ? S.alert(C.green) : {}, marginTop: 12, padding: "10px 14px", background: C.green + "18", borderRadius: 8, color: C.green, fontSize: 12.5 } }, "\u2705 Ba\u011Flant\u0131 ba\u015Far\u0131l\u0131! Art\u0131k her de\u011Fi\u015Fiklik otomatik olarak buluta kaydedilecek."), bulutTest && bulutTest !== "basarili" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.red + "18", borderRadius: 8, color: C.red, fontSize: 12.5 } }, "\u26A0\uFE0F ", bulutTest), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 10 } }, "Not: Bu cihazda yapt\u0131\u011F\u0131n\u0131z her de\u011Fi\u015Fiklik otomatik buluta g\xF6nderilir. Uygulama ayr\u0131ca her 5 saniyede bir buluttaki de\u011Fi\u015Fiklikleri arka planda kontrol edip ekran\u0131n\u0131z\u0131 otomatik g\xFCnceller \u2014 ba\u015Fka bir cihazdan yap\u0131lan de\u011Fi\u015Fiklikler k\u0131sa s\xFCre i\xE7inde burada da g\xF6r\xFCn\xFCr.")), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F510} Google ile Giri\u015F"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Uygulamay\u0131 a\xE7an herkesin Google hesab\u0131yla giri\u015F yapmas\u0131n\u0131 zorunlu k\u0131lar. Kurulum i\xE7in:", /* @__PURE__ */ React.createElement("ol", { style: { margin: "8px 0 0", paddingLeft: 20 } }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "https://console.cloud.google.com/apis/credentials", target: "_blank", rel: "noopener noreferrer", style: { color: C.accent } }, "Google Cloud Console \u2192 Credentials"), "'a gidin (\xFCcretsiz Google hesab\u0131yla)"), /* @__PURE__ */ React.createElement("li", null, '"Create Credentials" \u2192 "OAuth client ID" \u2192 Uygulama t\xFCr\xFC: "Web application"'), /* @__PURE__ */ React.createElement("li", null, '"Authorized JavaScript origins" k\u0131sm\u0131na sitenizin adresini ekleyin (\xF6rn. https://kullaniciadi.github.io)'), /* @__PURE__ */ React.createElement("li", null, 'Olu\u015Fan "Client ID"yi a\u015Fa\u011F\u0131ya yap\u0131\u015Ft\u0131r\u0131n'))), /* @__PURE__ */ React.createElement(FG, { label: "Google Client ID" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.googleClientId || "", onChange: (e) => setForm((f) => ({ ...f, googleClientId: e.target.value.trim() })), placeholder: "123456789-xxxx.apps.googleusercontent.com" })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted } }, "Bo\u015F b\u0131rak\u0131rsan\u0131z Google giri\u015Fi istenmez, uygulama do\u011Frudan a\xE7\u0131l\u0131r.")), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F916} Yapay Zeka (Teknisyen \xD6nerisi)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Yeni bir servis i\u015Fi eklerken, hangi teknisyene atanmas\u0131 gerekti\u011Fini yapay zekaya sordurabilirsiniz. ", /* @__PURE__ */ React.createElement("a", { href: "https://console.anthropic.com/settings/keys", target: "_blank", rel: "noopener noreferrer", style: { color: C.accent } }, "console.anthropic.com"), "'dan \xFCcretsiz bir hesapla API key alabilirsiniz (yeni hesaplara \xFCcretsiz kontenjan tan\u0131n\u0131r)."), /* @__PURE__ */ React.createElement(FG, { label: "Anthropic API Key" }, /* @__PURE__ */ React.createElement("input", { type: "password", style: S.inp, value: form.aiApiKey || "", onChange: (e) => setForm((f) => ({ ...f, aiApiKey: e.target.value.trim() })), placeholder: "sk-ant-..." })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.red, marginBottom: 10 } }, "\u26A0\uFE0F Bu key taray\u0131c\u0131n\u0131zda saklan\u0131r ve do\u011Frudan Anthropic'e g\xF6nderilir. Herkesle payla\u015Fmay\u0131n, ba\u015Fkalar\u0131n\u0131n kulland\u0131\u011F\u0131 bir bilgisayara girmeyin."), /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: aiTestEt, disabled: aiTestDevam }, aiTestDevam ? "\u23F3 Test ediliyor..." : "\u{1F50C} Ba\u011Flant\u0131y\u0131 Test Et"), aiTest === "basarili" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.green + "18", borderRadius: 8, color: C.green, fontSize: 12.5 } }, "\u2705 Yapay zeka ba\u011Flant\u0131s\u0131 \xE7al\u0131\u015F\u0131yor."), aiTest && aiTest !== "basarili" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.red + "18", borderRadius: 8, color: C.red, fontSize: 12.5 } }, "\u26A0\uFE0F ", aiTest)), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4BE} Veri Y\xF6netimi (Dosya Olarak)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "T\xFCm verilerinizi tek bir dosya olarak indirin veya geri y\xFCkleyin."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => {
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
  } })))), /* @__PURE__ */ React.createElement("div", { style: { ...S.card, border: `1px solid ${C.red}55` } }, /* @__PURE__ */ React.createElement("div", { style: { ...S.secTitle, color: C.red } }, "\u26A0\uFE0F Tehlikeli B\xF6lge"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Bu cihazdaki t\xFCm m\xFC\u015Fteri, ara\xE7, servis i\u015Fi, \xFCr\xFCn, fatura ve ayar verilerini kal\u0131c\u0131 olarak siler. Ba\u015Fka bir cihazda bulut senkronizasyonu a\xE7\u0131ksa oradaki veriler etkilenmez, ama bu cihazdan tekrar senkronize edilirse orada da silinebilir. \u0130\u015Flem geri al\u0131namaz."), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnR, padding: "9px 16px", fontSize: 13 }, onClick: () => {
    if (!confirm("T\xDCM veriler (m\xFC\u015Fteriler, ara\xE7lar, servis i\u015Fleri, \xFCr\xFCnler, faturalar, ayarlar vb.) kal\u0131c\u0131 olarak silinecek. Bu i\u015Flem GER\u0130 AL\u0131NAMAZ. Devam etmeden \xF6nce Veri Y\xF6netimi'nden yedek indirmenizi \xF6neririz. Devam edilsin mi?")) return;
    if (!confirm("Son kez soruyoruz: t\xFCm veriler s\u0131f\u0131rlans\u0131n m\u0131?")) return;
    localStorage.clear();
    window.location.reload();
  } }, "\u{1F5D1}\uFE0F T\xFCm Verileri S\u0131f\u0131rla")), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "\u{1F4BE} Ayarlar\u0131 Kaydet"), kaydedildi && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 12, color: C.green, fontSize: 13 } }, "\u2713 Kaydedildi"));
}
function MalzemeStok() {
  const [liste, setListe] = useState(LS.get("malzemeler"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [hareketModal, setHareketModal] = useState(null);
  const [hareketForm, setHareketForm] = useState({});
  const [hata, setHata] = useState("");
  const [arama, setArama] = useState("");
  const kaydet = () => {
    if (!(form.ad || "").trim()) {
      setHata("Par\xE7a/malzeme ad\u0131 zorunludur.");
      return;
    }
    setHata("");
    const kayit = { ...form, id: form.id || uid(), stokMiktari: form.stokMiktari || 0 };
    const yeni = form.id ? liste.map((x) => x.id === form.id ? kayit : x) : [...liste, kayit];
    LS.set("malzemeler", yeni);
    setListe(yeni);
    setModalAcik(false);
  };
  const sil = (id) => {
    if (!confirm("Bu kay\u0131t silinsin mi?")) return;
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("malzemeler", yeni);
    setListe(yeni);
  };
  const hareketUygula = () => {
    const miktar = +hareketForm.miktar || 0;
    if (miktar <= 0) {
      setHata("Miktar 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    const kalem = liste.find((x) => x.id === hareketModal.id);
    const yeniMiktar = hareketForm.yon === "cikis" ? kalem.stokMiktari - miktar : kalem.stokMiktari + miktar;
    if (yeniMiktar < 0) {
      setHata("Stokta yeterli miktar yok.");
      return;
    }
    setHata("");
    const yeni = liste.map((x) => x.id === kalem.id ? { ...x, stokMiktari: yeniMiktar } : x);
    LS.set("malzemeler", yeni);
    setListe(yeni);
    setHareketModal(null);
    setHareketForm({});
  };
  const toplamStokDegeri = liste.reduce((t, m) => t + (+m.stokMiktari || 0) * (+m.birimMaliyet || 0), 0);
  const kritikSayisi = liste.filter((m) => (+m.stokMiktari || 0) <= (+m.minMiktar || 0)).length;
  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const filtreli = !aramaMetni ? liste : liste.filter((m) => (m.ad + " " + (m.kod || "") + " " + (m.muadilKodu || "")).toLocaleLowerCase("tr-TR").includes(aramaMetni));
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F9F0} Yedek Par\xE7a Y\xF6netimi"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setForm({});
    setHata("");
    setModalAcik(true);
  } }, "\u2795 Yeni Par\xE7a/Malzeme")), /* @__PURE__ */ React.createElement(Grid4, null, /* @__PURE__ */ React.createElement(StatCard, { color: C.blue, icon: "\u{1F4E6}", value: liste.length, label: "Kay\u0131tl\u0131 Par\xE7a/Malzeme" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.red, icon: "\u26A0\uFE0F", value: kritikSayisi, label: "Kritik Stok Seviyesinde" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.green, icon: "\u{1F4B0}", value: fmtTL(toplamStokDegeri), label: "Toplam Stok De\u011Feri (Maliyet)" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.accent, icon: "\u{1F4C8}", value: fmtTL(liste.reduce((t, m) => t + (+m.stokMiktari || 0) * Math.max(0, (+m.satisFiyati || 0) - (+m.birimMaliyet || 0)), 0)), label: "Stoktaki Potansiyel K\xE2r" })), /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, marginBottom: 14, maxWidth: 360 }, placeholder: "\u{1F50D} Par\xE7a ad\u0131 veya kodu ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Par\xE7a"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Kod"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Stok"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Maliyet"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Sat\u0131\u015F Fiyat\u0131"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "K\xE2r Marj\u0131"), /* @__PURE__ */ React.createElement("th", { style: S.th }))), /* @__PURE__ */ React.createElement("tbody", null, filtreli.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: S.td, colSpan: 7 }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Hen\xFCz kay\u0131t yok."))) : filtreli.map((m) => {
    const kritik = (+m.stokMiktari || 0) <= (+m.minMiktar || 0);
    const karMarji = (+m.satisFiyati || 0) - (+m.birimMaliyet || 0);
    return /* @__PURE__ */ React.createElement("tr", { key: m.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, m.ad), m.muadilKodu && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: C.muted, marginTop: 2 } }, "Muadil: ", m.muadilKodu)), /* @__PURE__ */ React.createElement("td", { style: S.td }, m.kod || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("span", { style: { color: kritik ? C.red : C.text, fontWeight: 700 } }, m.stokMiktari, " ", m.birim || ""), kritik && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: C.red } }, "\u26A0\uFE0F Kritik")), /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtTL(m.birimMaliyet)), /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtTL(m.satisFiyati)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("span", { style: { color: karMarji >= 0 ? C.green : C.red } }, fmtTL(karMarji))), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => {
      setHareketForm({ yon: "giris" });
      setHata("");
      setHareketModal(m);
    } }, "+/\u2212 Stok"), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => {
      setForm(m);
      setHata("");
      setModalAcik(true);
    } }, "\u270F\uFE0F"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => sil(m.id) }, "\u{1F5D1}\uFE0F"))));
  })))), modalAcik && /* @__PURE__ */ React.createElement(Modal, { title: form.id ? "Par\xE7ay\u0131 D\xFCzenle" : "Yeni Par\xE7a/Malzeme", onClose: () => setModalAcik(false), width: 480 }, /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Par\xE7a/Malzeme Ad\u0131" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.ad || "", onChange: (e) => setForm((f) => ({ ...f, ad: e.target.value })), placeholder: "\xD6rn: Egzoz Borusu 45mm" })), /* @__PURE__ */ React.createElement(FG, { label: "Par\xE7a Kodu" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.kod || "", onChange: (e) => setForm((f) => ({ ...f, kod: e.target.value })), placeholder: "Referans kodu" }))), /* @__PURE__ */ React.createElement(FG, { label: "Muadil Par\xE7a Kodu (opsiyonel)" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.muadilKodu || "", onChange: (e) => setForm((f) => ({ ...f, muadilKodu: e.target.value })), placeholder: "Alternatif/e\u015Fde\u011Fer par\xE7a referans\u0131" })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Birim" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.birim || "", onChange: (e) => setForm((f) => ({ ...f, birim: e.target.value })), placeholder: "adet, kg, metre..." })), /* @__PURE__ */ React.createElement(FG, { label: "Ba\u015Flang\u0131\xE7 Stok Miktar\u0131" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.stokMiktari || "", onChange: (e) => setForm((f) => ({ ...f, stokMiktari: +e.target.value })) }))), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Birim Maliyet (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.birimMaliyet || "", onChange: (e) => setForm((f) => ({ ...f, birimMaliyet: +e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Sat\u0131\u015F Fiyat\u0131 (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.satisFiyati || "", onChange: (e) => setForm((f) => ({ ...f, satisFiyati: +e.target.value })) }))), /* @__PURE__ */ React.createElement(FG, { label: "Kritik Stok E\u015Fi\u011Fi" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.minMiktar || "", onChange: (e) => setForm((f) => ({ ...f, minMiktar: +e.target.value })) })), hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))), hareketModal && /* @__PURE__ */ React.createElement(Modal, { title: `${hareketModal.ad} \u2014 Stok Hareketi`, onClose: () => setHareketModal(null), width: 400 }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Mevcut stok: ", /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, hareketModal.stokMiktari, " ", hareketModal.birim)), /* @__PURE__ */ React.createElement(FG, { label: "Y\xF6n" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: hareketForm.yon || "giris", onChange: (e) => setHareketForm((f) => ({ ...f, yon: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "giris" }, "\u2795 Giri\u015F (Sat\u0131n Alma)"), /* @__PURE__ */ React.createElement("option", { value: "cikis" }, "\u2796 \xC7\u0131k\u0131\u015F (Serviste Kullan\u0131m)"))), /* @__PURE__ */ React.createElement(FG, { label: "Miktar" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: hareketForm.miktar || "", onChange: (e) => setHareketForm((f) => ({ ...f, miktar: +e.target.value })) })), hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setHareketModal(null) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: hareketUygula }, "Uygula"))));
}
function Personel() {
  const [liste, setListe] = useState(LS.get("personel"));
  const [servisler] = useState(LS.get("servisIsleri"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const kaydet = () => {
    if (!(form.ad || "").trim()) {
      alert("Personel ad\u0131 zorunludur.");
      return;
    }
    const kayit = { ...form, id: form.id || uid() };
    const yeni = form.id ? liste.map((x) => x.id === form.id ? kayit : x) : [...liste, kayit];
    LS.set("personel", yeni);
    setListe(yeni);
    setModalAcik(false);
  };
  const sil = (id) => {
    if (!confirm("Bu personel silinsin mi?")) return;
    const yeni = liste.filter((x) => x.id !== id);
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
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F9D1}\u200D\u{1F527} Personel"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setForm({});
    setModalAcik(true);
  } }, "\u2795 Yeni Personel")), liste.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { ...S.card, borderTop: `3px solid ${C.accent}` } }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u2696\uFE0F Anl\u0131k \u0130\u015F Y\xFCk\xFC"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, 'Her personelin \u015Fu an "Bekliyor" veya "Devam Ediyor" durumundaki a\xE7\u0131k i\u015F say\u0131s\u0131. Yeni bir i\u015F atarken en bo\u015Fta olan\u0131 tercih edebilirsiniz.'), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, liste.map((p) => {
    const sayi = acikIsSayisi(p.id);
    return /* @__PURE__ */ React.createElement("div", { key: p.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: C.surface, borderRadius: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text } }, p.ad, " ", enBostaOlan && enBostaOlan.id === p.id && sayi === 0 && /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(C.green), marginLeft: 8, fontSize: 10 } }, "En bo\u015Fta")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: sayi >= 3 ? C.red : C.white } }, sayi, " a\xE7\u0131k i\u015F"));
  }))), liste.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { ...S.card, borderTop: `3px solid ${C.green}` } }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4C8} Teknisyen Performans Raporu"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "Tamamlanm\u0131\u015F i\u015Flere g\xF6re personel ba\u015F\u0131na i\u015F say\u0131s\u0131 ve ciro."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, performans.map(({ p, sayi, ciro }) => /* @__PURE__ */ React.createElement("div", { key: p.id }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text, fontWeight: 600 } }, p.ad), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.muted } }, sayi, " i\u015F \u2022 ", /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, fmtTL(ciro)))), /* @__PURE__ */ React.createElement("div", { style: { height: 6, background: C.surface, borderRadius: 3, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${ciro / enYuksekCiro * 100}%`, background: C.green, borderRadius: 3 } })))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 } }, liste.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Hen\xFCz personel eklenmedi."), liste.map(
    (p) => /* @__PURE__ */ React.createElement("div", { key: p.id, style: S.card }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 4 } }, p.ad), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.accent, marginBottom: 8 } }, p.pozisyon || "\u2014"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 2 } }, p.telefon || "Telefon yok"), p.maas > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 12 } }, "Maa\u015F: ", fmtTL(p.maas)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, flex: 1 }, onClick: () => {
      setForm(p);
      setModalAcik(true);
    } }, "\u270F\uFE0F D\xFCzenle"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => sil(p.id) }, "\u{1F5D1}\uFE0F")))
  )), modalAcik && /* @__PURE__ */ React.createElement(Modal, { title: form.id ? "Personeli D\xFCzenle" : "Yeni Personel", onClose: () => setModalAcik(false), width: 420 }, /* @__PURE__ */ React.createElement(FG, { label: "Ad Soyad" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.ad || "", onChange: (e) => setForm((f) => ({ ...f, ad: e.target.value })), autoFocus: true })), /* @__PURE__ */ React.createElement(FG, { label: "Pozisyon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.pozisyon || "", onChange: (e) => setForm((f) => ({ ...f, pozisyon: e.target.value })), placeholder: "\xD6rn: Ustaba\u015F\u0131, Kaynak\xE7\u0131, Tamirci" })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.telefon || "", onChange: (e) => setForm((f) => ({ ...f, telefon: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Ayl\u0131k Maa\u015F (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.maas || "", onChange: (e) => setForm((f) => ({ ...f, maas: +e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))));
}
function Araclar() {
  const [liste, setListe] = useState(LS.get("araclar"));
  const [cariler, setCariler] = useState(LS.get("cariler"));
  const [servisler] = useState(LS.get("servisIsleri"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [detayAracId, setDetayAracId] = useState(null);
  const [arama, setArama] = useState("");
  const kaydet = () => {
    if (!(form.plaka || "").trim()) {
      alert("Plaka zorunludur.");
      return;
    }
    if (!(form.musteriAdi || "").trim()) {
      alert("Müşteri / Firma adı zorunludur.");
      return;
    }
    const normalize = plakaNormalize(form.plaka);
    const cakisan = liste.find((a) => a.id !== form.id && plakaNormalize(a.plaka) === normalize);
    if (cakisan) {
      alert(`Bu plaka zaten kayıtlı: ${cakisan.plaka}`);
      return;
    }
    let cariId = form.musteriId;
    const cariBilgisi = { ad: form.musteriAdi.trim(), tel: (form.musteriTel || "").trim(), adres: (form.musteriAdres || "").trim() };
    let yeniCariler;
    if (cariId && cariler.some((c) => c.id === cariId)) {
      yeniCariler = cariler.map((c) => c.id === cariId ? { ...c, ...cariBilgisi } : c);
    } else {
      const yeniCari = { id: uid(), ...cariBilgisi };
      cariId = yeniCari.id;
      yeniCariler = [...cariler, yeniCari];
    }
    LS.set("cariler", yeniCariler);
    setCariler(yeniCariler);
    const kayit = { ...form, id: form.id || uid(), plaka: normalize, musteriId: cariId };
    delete kayit.musteriAdi;
    delete kayit.musteriTel;
    delete kayit.musteriAdres;
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
    if (!confirm("Bu araç silinsin mi?")) return;
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("araclar", yeni);
    setListe(yeni);
  };
  const aracDuzenle = (a) => {
    const sahip = cariler.find((c) => c.id === a.musteriId) || {};
    setForm({ ...a, musteriAdi: sahip.ad || "", musteriTel: sahip.tel || "", musteriAdres: sahip.adres || "" });
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
  const detayArac = detayAracId ? liste.find((a) => a.id === detayAracId) : null;
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "🚗 Araç Kayıtları"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setForm({});
    setModalAcik(true);
  } }, "➕ Yeni Araç")), /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, marginBottom: 16, maxWidth: 360 }, placeholder: "🔍 Plaka, marka veya müşteri ara…", value: arama, onChange: (e) => setArama(e.target.value) }), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Plaka"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Marka/Model"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Yıl"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Sahibi"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Servis Geçmişi"), /* @__PURE__ */ React.createElement("th", { style: S.th }))), /* @__PURE__ */ React.createElement("tbody", null, filtreli.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: S.td, colSpan: 6 }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Kayıt bulunamadı."))) : filtreli.map((a) => {
    const gecmis = aracServisleri(a.id);
    return /* @__PURE__ */ React.createElement("tr", { key: a.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.accent, cursor: "pointer", textDecoration: "underline" }, title: "Araç sicilini görüntüle (fotoğraf, belge, servis geçmişi)", onClick: () => setDetayAracId(a.id) }, a.plaka)), /* @__PURE__ */ React.createElement("td", { style: S.td }, a.marka, " ", a.model), /* @__PURE__ */ React.createElement("td", { style: S.td }, a.yil || "—"), /* @__PURE__ */ React.createElement("td", { style: S.td }, cariAd(cariler, a.musteriId)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(C.blue), cursor: "pointer" }, onClick: () => setDetayAracId(a.id) }, gecmis.length, " servis kaydı")), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => aracDuzenle(a) }, "✏️"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => sil(a.id) }, "🗑️"))));
  })))), modalAcik && /* @__PURE__ */ React.createElement(Modal, { title: form.id ? "Aracı Düzenle" : "Yeni Araç", onClose: () => setModalAcik(false), width: 480 }, !form.id && /* @__PURE__ */ React.createElement(PlakaKameraTarayici, { onSonuc: (p) => setForm((f) => ({ ...f, plaka: p })) }), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Plaka" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.plaka || "", onChange: (e) => setForm((f) => ({ ...f, plaka: e.target.value })), placeholder: "45 ABC 123", autoFocus: true })), /* @__PURE__ */ React.createElement(FG, { label: "Yıl" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.yil || "", onChange: (e) => setForm((f) => ({ ...f, yil: +e.target.value })) }))), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Marka" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.marka || "", onChange: (e) => setForm((f) => ({ ...f, marka: e.target.value })), placeholder: "Ford" })), /* @__PURE__ */ React.createElement(FG, { label: "Model" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.model || "", onChange: (e) => setForm((f) => ({ ...f, model: e.target.value })), placeholder: "Transit" }))), /* @__PURE__ */ React.createElement(FG, { label: "Şasi No (opsiyonel)" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.sasiNo || "", onChange: (e) => setForm((f) => ({ ...f, sasiNo: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { style: { ...S.secTitle, fontSize: 13, marginTop: 4 } }, "👤 Araç Sahibi (Müşteri/Firma)"), /* @__PURE__ */ React.createElement(FG, { label: "Müşteri / Firma Adı" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.musteriAdi || "", onChange: (e) => setForm((f) => ({ ...f, musteriAdi: e.target.value })) })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.musteriTel || "", onChange: (e) => setForm((f) => ({ ...f, musteriTel: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.musteriAdres || "", onChange: (e) => setForm((f) => ({ ...f, musteriAdres: e.target.value })) }))), /* @__PURE__ */ React.createElement(FG, { label: "Notlar" }, /* @__PURE__ */ React.createElement("textarea", { style: { ...S.inp, minHeight: 60 }, value: form.notlar || "", onChange: (e) => setForm((f) => ({ ...f, notlar: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "İptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))), detayArac && /* @__PURE__ */ React.createElement(AracDetayModal, { arac: detayArac, cariler, servisler: aracServisleri(detayArac.id), onClose: () => setDetayAracId(null), onGuncelle: (patch) => aracGuncelle(detayArac.id, patch) }));
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
    sekme === "servis" && (servisler.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Bu araca ait servis kaydı yok.") : /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Hizmet"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tutar"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Durum"))), /* @__PURE__ */ React.createElement("tbody", null, servisler.map(
      (s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(s.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, HIZMET_TIP_LABEL[s.hizmetTuru], s.aciklama ? ` — ${s.aciklama}` : ""), /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtTL(s.tutar)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement(Badge, { d: s.durum })))
    )))),
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
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg } }, /* @__PURE__ */ React.createElement("div", { style: { ...S.card, maxWidth: 420, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, marginBottom: 10 } }, "\u{1F527}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 8 } }, "Google ile Giri\u015F Kurulmad\u0131"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.muted } }, "Ayarlar \u2192 Google Giri\u015Fi'nden bir Client ID girip kaydedin. O zamana kadar uygulamaya do\u011Frudan devam edebilirsiniz."), /* @__PURE__ */ React.createElement("button", { style: { ...S.btn(), marginTop: 16 }, onClick: () => onGiris(null) }, "Google's\u0131z Devam Et")));
  }
  return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg } }, /* @__PURE__ */ React.createElement("div", { style: { ...S.card, maxWidth: 380, textAlign: "center", padding: 32 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 36, marginBottom: 12 } }, "\u{1F527}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 4 } }, getSettings().firmaAdi), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 24 } }, "Devam etmek i\xE7in Google hesab\u0131n\u0131zla giri\u015F yap\u0131n"), /* @__PURE__ */ React.createElement("div", { ref: butonRef, style: { display: "flex", justifyContent: "center" } }), hata && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, color: C.red, fontSize: 12 } }, "\u26A0\uFE0F ", hata)));
}
const SAYFALAR = [
  { id: "dashboard", label: "Genel Bak\u0131\u015F", icon: "\u{1F4CA}", comp: Dashboard },
  { id: "servis", label: "Servis \u0130\u015Fleri", icon: "\u{1F527}", comp: ServisIsleri },
  { id: "araclar", label: "Ara\xE7 Kay\u0131tlar\u0131", icon: "\u{1F697}", comp: Araclar },
  { id: "uretim", label: "\xDCretim & Stok", icon: "\u{1F6D2}", comp: UretimStok },
  { id: "malzeme", label: "Yedek Par\xE7a", icon: "\u{1F9F0}", comp: MalzemeStok },
  { id: "personel", label: "Personel", icon: "\u{1F9D1}\u200D\u{1F527}", comp: Personel },
  { id: "cariler", label: "M\xFC\u015Fteriler", icon: "\u{1F465}", comp: Cariler },
  { id: "muhasebe", label: "Muhasebe", icon: "\u{1F4B0}", comp: Muhasebe },
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
function App() {
  seedVeri();
  personelMigrasyonu();
  urunMigrasyonu();
  servisMigrasyonu();
  faturaMigrasyonu();
  dosyaMigrasyonuYap();
  const [sayfa, setSayfa] = useState(() => location.hash.replace("#", "") || "dashboard");
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
  const AktifBilesen = (SAYFALAR.find((s) => s.id === sayfa) || SAYFALAR[0]).comp;
  return /* @__PURE__ */ React.createElement("div", { className: "fp-app", style: S.app }, /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar", style: S.sidebar }, /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-brand", style: { padding: "6px 10px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: C.white } }, "\u{1F527} At\xF6lyePro"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 } }, "Egzoz \xB7 Chiptuning \xB7 \xDCretim")), /* @__PURE__ */ React.createElement("div", { className: "fp-navlist" }, SAYFALAR.map(
    (s) => /* @__PURE__ */ React.createElement("div", { key: s.id, className: "fp-navitem", style: S.navBtn(sayfa === s.id), onClick: () => setSayfa(s.id) }, /* @__PURE__ */ React.createElement("span", { className: "fp-navicon" }, s.icon), /* @__PURE__ */ React.createElement("span", { className: "fp-navlabel" }, s.label))
  )), /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-spacer", style: { flex: 1 } }), kullanici && /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-footer", style: { padding: "10px", display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 14 } }, kullanici.foto && /* @__PURE__ */ React.createElement("img", { src: kullanici.foto, alt: "", style: { width: 28, height: 28, borderRadius: "50%" } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, kullanici.ad)), /* @__PURE__ */ React.createElement("button", { onClick: cikisYap, title: "\xC7\u0131k\u0131\u015F Yap", style: { background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 } }, "\u23FB")), /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-footer", style: { padding: "12px 10px", fontSize: 10.5, color: C.muted, borderTop: kullanici ? "none" : `1px solid ${C.border}`, marginTop: kullanici ? 0 : 12, paddingTop: kullanici ? 4 : 14 } }, "At\xF6lyePro v1.0 \u2014 Yerel veri deposu")), /* @__PURE__ */ React.createElement("div", { className: "fp-main", style: S.main }, yeniVeriVar && /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 0, zIndex: 50, background: C.accent, color: "#161311", padding: "10px 16px", borderRadius: 8, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700 } }, "\u{1F504} Ba\u015Fka bir cihazda de\u011Fi\u015Fiklik yap\u0131ld\u0131.", /* @__PURE__ */ React.createElement("button", { style: { background: "#161311", color: C.white, border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }, onClick: async () => {
    for (const anahtar of ALL_DATA_KEYS) {
      const veri = await buluttanOku(anahtar);
      if (veri !== null) localStorage.setItem(anahtar, JSON.stringify(veri));
    }
    const uzakZaman = await buluttanOku("_sonGuncelleme");
    if (uzakZaman) localStorage.setItem("fp_son_yerel_degisim", String(uzakZaman));
    window.location.reload();
  } }, "\u015Eimdi Yenile")), /* @__PURE__ */ React.createElement(AktifBilesen, null)));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
