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
  chiptuning: "\u26A1 Chiptuning"
};
const EL_ARABASI_TIP_LABEL = {
  kantarli: "\u2696\uFE0F Kantarl\u0131 El Arabas\u0131",
  kantarsiz: "\u{1F6D2} Kantars\u0131z El Arabas\u0131"
};
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
  }
};
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
  kantarliFiyat: 4500,
  kantarsizFiyat: 3200
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
  LS.set("uretimKayitlari", [
    { id: "u1", tarih: today(), tip: "kantarli", adet: 6, aciklama: "Haftal\u0131k \xFCretim" },
    { id: "u2", tarih: today(), tip: "kantarsiz", adet: 10, aciklama: "Haftal\u0131k \xFCretim" }
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
  localStorage.setItem("fp_seed_v1", "1");
}
const S = {
  app: { display: "flex", minHeight: "100vh" },
  sidebar: { width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "18px 12px", flexShrink: 0 },
  main: { flex: 1, padding: "24px 28px", maxWidth: 1200, margin: "0 auto", width: "100%" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16 },
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
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } }, children);
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
function aracBilgi(araclar, id) {
  return araclar.find((a) => a.id === id) || null;
}
function whatsappLinkAc(telefon, mesaj) {
  let t = (telefon || "").replace(/[^\d]/g, "");
  if (!t) {
    alert("Bu m\xFC\u015Fterinin telefon numaras\u0131 kay\u0131tl\u0131 de\u011Fil.");
    return;
  }
  if (t.startsWith("0")) t = "90" + t.slice(1);
  else if (!t.startsWith("90") && t.length === 10) t = "90" + t;
  window.open(`https://wa.me/${t}?text=${encodeURIComponent(mesaj)}`, "_blank");
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
function Dashboard() {
  const [servisler] = useState(LS.get("servisIsleri"));
  const [uretim] = useState(LS.get("uretimKayitlari"));
  const [satislar] = useState(LS.get("satislar"));
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
  const stokHesapla = (tip) => uretim.filter((u) => u.tip === tip).reduce((t, u) => t + (+u.adet || 0), 0) - satislar.filter((s) => s.tip === tip).reduce((t, s) => t + (+s.adet || 0), 0);
  const kantarliStok = stokHesapla("kantarli");
  const kantarsizStok = stokHesapla("kantarsiz");
  const hizmetDagilimi = Object.entries(
    servisler.reduce((acc, s) => {
      const l = HIZMET_TIP_LABEL[s.hizmetTuru] || s.hizmetTuru;
      acc[l] = (acc[l] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
  const renkler = [C.accent, C.blue, C.green, C.yellow, C.purple];
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 4 } }, "Genel Bak\u0131\u015F"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.muted, marginBottom: 20 } }, (/* @__PURE__ */ new Date()).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })), /* @__PURE__ */ React.createElement(Grid4, null, /* @__PURE__ */ React.createElement(StatCard, { color: C.accent, icon: "\u{1F527}", value: acikServisSayisi, label: "A\xE7\u0131k Servis \u0130\u015Fi" }), /* @__PURE__ */ React.createElement(StatCard, { color: buAyNetKar >= 0 ? C.green : C.red, icon: "\u{1F4B0}", value: fmtTL(buAyNetKar), label: "Bu Ay Net K\xE2r", sub: `Gelir ${fmtTL(buAyGelir)} \u2212 Gider ${fmtTL(buAyGider)}` }), /* @__PURE__ */ React.createElement(StatCard, { color: C.red, icon: "\u23F3", value: fmtTL(odenmemis), label: "Tahsil Edilecek" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.blue, icon: "\u{1F6D2}", value: `${kantarliStok + kantarsizStok} adet`, label: "Toplam El Arabas\u0131 Stoku", sub: `${kantarliStok} kantarl\u0131 \xB7 ${kantarsizStok} kantars\u0131z` })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u2696\uFE0F Stok Durumu"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, [["kantarli", kantarliStok], ["kantarsiz", kantarsizStok]].map(
    ([tip, adet]) => /* @__PURE__ */ React.createElement("div", { key: tip, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderRadius: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text } }, EL_ARABASI_TIP_LABEL[tip]), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, fontWeight: 800, color: adet <= 3 ? C.red : C.white } }, adet, " adet"))
  )), (kantarliStok <= 3 || kantarsizStok <= 3) && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.red + "18", borderRadius: 8, fontSize: 12, color: C.red } }, "\u26A0\uFE0F Stok kritik seviyede \u2014 \xFCretim planlamay\u0131 d\xFC\u015F\xFCn\xFCn.")), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4CA} Hizmet T\xFCr\xFC Da\u011F\u0131l\u0131m\u0131"), RC.PieChart && hizmetDagilimi.length > 0 ? /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 200 }, /* @__PURE__ */ React.createElement(PieChart, null, /* @__PURE__ */ React.createElement(Pie, { data: hizmetDagilimi, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 78, paddingAngle: 3, label: ({ name, value }) => `${name}: ${value}` }, hizmetDagilimi.map((e, i) => /* @__PURE__ */ React.createElement(Cell, { key: i, fill: renkler[i % renkler.length] }))), /* @__PURE__ */ React.createElement(Tooltip, { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 } }))) : /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Hen\xFCz veri yok."))), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F9D1}\u200D\u{1F527} Teknisyen \u0130\u015F Y\xFCk\xFC"), personelListesi.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted, fontSize: 13 } }, "Hen\xFCz personel eklenmedi.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, teknisyenYuku.map(
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
  const [liste, setListe] = useState(LS.get("servisIsleri"));
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({});
  const [hata, setHata] = useState("");
  const [durumFiltre, setDurumFiltre] = useState("tumu");
  const [yeniCariAcik, setYeniCariAcik] = useState(false);
  const [yeniAracAcik, setYeniAracAcik] = useState(false);
  const [arama, setArama] = useState("");
  const [odemeModal, setOdemeModal] = useState(null);
  const [odemeHesapId, setOdemeHesapId] = useState("");
  const kaydet = () => {
    if (!form.musteriId) {
      setHata("M\xFC\u015Fteri se\xE7imi zorunludur.");
      return;
    }
    if (!form.aracId) {
      setHata("Ara\xE7 se\xE7imi zorunludur.");
      return;
    }
    if (!form.hizmetTuru) {
      setHata("Hizmet t\xFCr\xFC se\xE7imi zorunludur.");
      return;
    }
    if (!(+form.tutar > 0)) {
      setHata("Tutar 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    setHata("");
    const kayit = { ...form, id: form.id || uid(), tarih: form.tarih || today(), durum: form.durum || "bekliyor" };
    const yeni = form.id ? liste.map((x) => x.id === form.id ? kayit : x) : [...liste, kayit];
    LS.set("servisIsleri", yeni);
    setListe(yeni);
    setModalAcik(false);
  };
  const sil = (id) => {
    if (!confirm("Bu servis kayd\u0131 silinsin mi?")) return;
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("servisIsleri", yeni);
    setListe(yeni);
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
    hesapHareketiKaydet(odemeHesapId, "giris", s.tutar, today(), `Servis \xF6demesi \u2014 ${HIZMET_TIP_LABEL[s.hizmetTuru] || ""} (${cariAd(cariler, s.musteriId)})`, "servis");
    const yeni = liste.map((x) => x.id === s.id ? { ...x, odendi: true, odemeHesapId } : x);
    LS.set("servisIsleri", yeni);
    setListe(yeni);
    setOdemeModal(null);
    setOdemeHesapId("");
  };
  const durumaGoreFiltreli = durumFiltre === "tumu" ? liste : liste.filter((s) => s.durum === durumFiltre);
  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const aracEtiket = (s) => {
    const a = aracBilgi(araclar, s.aracId);
    return a ? `${a.plaka}${a.marka ? " \xB7 " + a.marka + " " + (a.model || "") : ""}` : s.aracPlaka || "\u2014";
  };
  const gosterilecek = !aramaMetni ? durumaGoreFiltreli : durumaGoreFiltreli.filter((s) => (cariAd(cariler, s.musteriId) + " " + aracEtiket(s) + " " + (s.aciklama || "")).toLocaleLowerCase("tr-TR").includes(aramaMetni));
  const musteriAraclari = form.musteriId ? araclar.filter((a) => a.musteriId === form.musteriId) : araclar;
  const garantiDurumu = (s) => {
    if (!s.garantili || !s.garantiBitis) return null;
    const kalanGun = Math.ceil((new Date(s.garantiBitis) - new Date(today())) / 864e5);
    return kalanGun >= 0 ? { metin: `Garanti: ${kalanGun} g\xFCn kald\u0131`, renk: C.green } : { metin: "Garanti bitti", renk: C.muted };
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F527} Servis \u0130\u015Fleri"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setForm({ tarih: today(), durum: "bekliyor" });
    setHata("");
    setModalAcik(true);
  } }, "\u2795 Yeni Servis \u0130\u015Fi")), /* @__PURE__ */ React.createElement(TabBar, { tabs: [["tumu", "T\xFCm\xFC"], ["bekliyor", "Bekliyor"], ["devam", "Devam Ediyor"], ["tamamlandi", "Tamamland\u0131"]], active: durumFiltre, onChange: setDurumFiltre }), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, marginBottom: 14 }, placeholder: "\u{1F50D} M\xFC\u015Fteri, plaka veya a\xE7\u0131klamada ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }), /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "M\xFC\u015Fteri"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Ara\xE7"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Hizmet"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Sorumlu"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tutar"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "\xD6deme"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Durum / Garanti"), /* @__PURE__ */ React.createElement("th", { style: S.th }))), /* @__PURE__ */ React.createElement("tbody", null, gosterilecek.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: S.td, colSpan: 9 }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Kay\u0131t bulunamad\u0131."))) : [...gosterilecek].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).map((s) => {
    const garanti = garantiDurumu(s);
    const sorumlu = personelListesi.find((p) => p.id === s.personelId);
    return /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(s.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, s.musteriId))), /* @__PURE__ */ React.createElement("td", { style: S.td }, aracEtiket(s)), /* @__PURE__ */ React.createElement("td", { style: S.td }, HIZMET_TIP_LABEL[s.hizmetTuru]), /* @__PURE__ */ React.createElement("td", { style: S.td }, sorumlu ? sorumlu.ad : "\u2014"), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.accent } }, fmtTL(s.tutar))), /* @__PURE__ */ React.createElement("td", { style: S.td }, s.odendi ? /* @__PURE__ */ React.createElement(Badge, { d: "tamamlandi", map: { tamamlandi: "\xD6dendi" }, renk: { tamamlandi: C.green } }) : /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "4px 10px", fontSize: 11 }, onClick: () => {
      setOdemeModal(s);
      setOdemeHesapId(hesaplar[0] ? hesaplar[0].id : "");
    } }, "\xD6dendi \u0130\u015Faretle")), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement(Badge, { d: s.durum }), garanti && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: garanti.renk, marginTop: 4 } }, "\u{1F6E1}\uFE0F ", garanti.metin)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, title: "WhatsApp ile durum bildir", onClick: () => {
      const musteri = cariler.find((c) => c.id === s.musteriId);
      const mesaj = `Merhaba ${musteri ? musteri.ad : ""}, ${aracEtiket(s)} plakal\u0131 arac\u0131n\u0131z\u0131n ${HIZMET_TIP_LABEL[s.hizmetTuru] || ""} i\u015Flemi durumu: ${DURUM_LABEL[s.durum] || s.durum}.${s.durum === "tamamlandi" ? ` Tutar: ${fmtTL(s.tutar)}.` : ""} \u2014 As Egzoz & Makine`;
      whatsappLinkAc(musteri ? musteri.tel : "", mesaj);
    } }, "\u{1F4AC}"), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => fisYazdir("Servis Fi\u015Fi", [{ aciklama: `${HIZMET_TIP_LABEL[s.hizmetTuru]} \u2014 ${aracEtiket(s)}${s.aciklama ? " (" + s.aciklama + ")" : ""}`, tutar: s.tutar }], s.tutar, cariAd(cariler, s.musteriId)) }, "\u{1F5A8}\uFE0F"), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => {
      setForm(s);
      setHata("");
      setModalAcik(true);
    } }, "\u270F\uFE0F"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => sil(s.id) }, "\u{1F5D1}\uFE0F"))));
  })))), modalAcik && /* @__PURE__ */ React.createElement(Modal, { title: form.id ? "Servis \u0130\u015Fini D\xFCzenle" : "Yeni Servis \u0130\u015Fi", onClose: () => setModalAcik(false), width: 580 }, /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Tarih" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: S.inp, value: form.tarih || "", onChange: (e) => setForm((f) => ({ ...f, tarih: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Hizmet T\xFCr\xFC" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.hizmetTuru || "", onChange: (e) => setForm((f) => ({ ...f, hizmetTuru: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), Object.entries(HIZMET_TIP_LABEL).map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l))))), /* @__PURE__ */ React.createElement(FG, { label: "M\xFC\u015Fteri" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.musteriId || "", onChange: (e) => setForm((f) => ({ ...f, musteriId: e.target.value, aracId: "" })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), cariler.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.ad))), /* @__PURE__ */ React.createElement("button", { type: "button", style: S.btnO, onClick: () => setYeniCariAcik(true) }, "\u2795 Yeni"))), /* @__PURE__ */ React.createElement(FG, { label: "Ara\xE7" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.aracId || "", onChange: (e) => setForm((f) => ({ ...f, aracId: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), musteriAraclari.map((a) => /* @__PURE__ */ React.createElement("option", { key: a.id, value: a.id }, a.plaka, a.marka ? ` \xB7 ${a.marka} ${a.model || ""}` : ""))), /* @__PURE__ */ React.createElement("button", { type: "button", style: S.btnO, onClick: () => setYeniAracAcik(true) }, "\u2795 Yeni")), !form.musteriId && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 6 } }, "\xD6nce m\xFC\u015Fteri se\xE7erseniz sadece onun ara\xE7lar\u0131 listelenir.")), /* @__PURE__ */ React.createElement(FG, { label: "Sorumlu Personel (opsiyonel)" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.personelId || "", onChange: (e) => setForm((f) => ({ ...f, personelId: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), personelListesi.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.ad, p.pozisyon ? ` (${p.pozisyon})` : "")))), /* @__PURE__ */ React.createElement(FG, { label: "A\xE7\u0131klama" }, /* @__PURE__ */ React.createElement("textarea", { style: { ...S.inp, minHeight: 70 }, value: form.aciklama || "", onChange: (e) => setForm((f) => ({ ...f, aciklama: e.target.value })) })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Tutar (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.tutar || "", onChange: (e) => setForm((f) => ({ ...f, tutar: +e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Durum" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.durum || "bekliyor", onChange: (e) => setForm((f) => ({ ...f, durum: e.target.value })) }, Object.entries(DURUM_LABEL).filter(([k]) => k !== "iptal").map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 14px", background: C.surface, borderRadius: 8 } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!form.garantili, onChange: (e) => setForm((f) => ({ ...f, garantili: e.target.checked })), style: { width: 16, height: 16 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text } }, "\u{1F6E1}\uFE0F Bu i\u015F garanti kapsam\u0131nda")), form.garantili && /* @__PURE__ */ React.createElement(FG, { label: "Garanti Biti\u015F Tarihi" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: S.inp, value: form.garantiBitis || "", onChange: (e) => setForm((f) => ({ ...f, garantiBitis: e.target.value })) })), hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))), yeniCariAcik && /* @__PURE__ */ React.createElement(HizliCariEkle, { onClose: () => setYeniCariAcik(false), onEklendi: (yeni, tumCariler) => {
    setCariler(tumCariler);
    setForm((f) => ({ ...f, musteriId: yeni.id }));
    setYeniCariAcik(false);
  } }), yeniAracAcik && /* @__PURE__ */ React.createElement(Modal, { title: "\u2795 H\u0131zl\u0131 Ara\xE7 Ekle", onClose: () => setYeniAracAcik(false), width: 420 }, /* @__PURE__ */ React.createElement(HizliAracFormu, { musteriId: form.musteriId, onClose: () => setYeniAracAcik(false), onEklendi: (yeni, tumAraclar) => {
    setAraclar(tumAraclar);
    setForm((f) => ({ ...f, aracId: yeni.id }));
    setYeniAracAcik(false);
  } })), odemeModal && /* @__PURE__ */ React.createElement(Modal, { title: "\u{1F4B0} \xD6deme Al", onClose: () => setOdemeModal(null), width: 400 }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.muted, marginBottom: 14 } }, "Tutar: ", /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, fmtTL(odemeModal.tutar)), " \u2014 hangi hesaba girdi?"), /* @__PURE__ */ React.createElement(FG, { label: "Hesap" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: odemeHesapId, onChange: (e) => setOdemeHesapId(e.target.value) }, hesaplar.length === 0 && /* @__PURE__ */ React.createElement("option", { value: "" }, "\xD6nce Kasa & Banka'dan hesap ekleyin"), hesaplar.map((h) => /* @__PURE__ */ React.createElement("option", { key: h.id, value: h.id }, h.ad, " (", fmtTL(h.bakiye), ")")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setOdemeModal(null) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: odemeOnayla }, "Onayla"))));
}
function HizliAracFormu({ musteriId, onClose, onEklendi }) {
  const [plaka, setPlaka] = useState("");
  const [marka, setMarka] = useState("");
  const [model, setModel] = useState("");
  const kaydet = () => {
    if (!plaka.trim()) {
      alert("Plaka zorunludur.");
      return;
    }
    const mevcut = LS.get("araclar");
    const yeni = { id: uid(), musteriId: musteriId || null, plaka: plaka.trim().toUpperCase(), marka: marka.trim(), model: model.trim() };
    const tumu = [...mevcut, yeni];
    LS.set("araclar", tumu);
    onEklendi(yeni, tumu);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, !musteriId && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.yellow, marginBottom: 12 } }, "\u26A0\uFE0F \xD6nce bir m\xFC\u015Fteri se\xE7mediniz \u2014 bu ara\xE7 sahipsiz eklenecek, sonra d\xFCzenleyebilirsiniz."), /* @__PURE__ */ React.createElement(FG, { label: "Plaka" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: plaka, onChange: (e) => setPlaka(e.target.value), autoFocus: true, placeholder: "45 ABC 123" })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Marka" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: marka, onChange: (e) => setMarka(e.target.value) })), /* @__PURE__ */ React.createElement(FG, { label: "Model" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: model, onChange: (e) => setModel(e.target.value) }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: onClose }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet")));
}
function UretimStok() {
  const [uretim, setUretim] = useState(LS.get("uretimKayitlari"));
  const [satislar, setSatislar] = useState(LS.get("satislar"));
  const [cariler, setCariler] = useState(LS.get("cariler"));
  const [hesaplar] = useState(LS.get("hesaplar"));
  const [sekme, setSekme] = useState("stok");
  const [uretimModal, setUretimModal] = useState(false);
  const [satisModal, setSatisModal] = useState(false);
  const [uForm, setUForm] = useState({});
  const [sForm, setSForm] = useState({});
  const [hata, setHata] = useState("");
  const settings = getSettings();
  const stokHesapla = (tip) => uretim.filter((u) => u.tip === tip).reduce((t, u) => t + (+u.adet || 0), 0) - satislar.filter((s) => s.tip === tip).reduce((t, s) => t + (+s.adet || 0), 0);
  const uretimKaydet = () => {
    if (!uForm.tip) {
      setHata("Tip se\xE7imi zorunludur.");
      return;
    }
    if (!(+uForm.adet > 0)) {
      setHata("Adet 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    setHata("");
    const kayit = { ...uForm, id: uid(), tarih: uForm.tarih || today() };
    const yeni = [...uretim, kayit];
    LS.set("uretimKayitlari", yeni);
    setUretim(yeni);
    setUretimModal(false);
  };
  const satisKaydet = () => {
    if (!sForm.musteriId) {
      setHata("M\xFC\u015Fteri se\xE7imi zorunludur.");
      return;
    }
    if (!sForm.tip) {
      setHata("Tip se\xE7imi zorunludur.");
      return;
    }
    if (!(+sForm.adet > 0)) {
      setHata("Adet 0'dan b\xFCy\xFCk olmal\u0131d\u0131r.");
      return;
    }
    if (!sForm.hesapId) {
      setHata("\xD6demenin girece\u011Fi hesab\u0131 se\xE7in.");
      return;
    }
    const mevcutStok = stokHesapla(sForm.tip);
    if (+sForm.adet > mevcutStok) {
      setHata(`Yetersiz stok. Depoda ${mevcutStok} adet var.`);
      return;
    }
    setHata("");
    const birimFiyat = +sForm.birimFiyat || (sForm.tip === "kantarli" ? settings.kantarliFiyat : settings.kantarsizFiyat);
    const toplam = birimFiyat * +sForm.adet;
    const kayit = { ...sForm, id: uid(), tarih: sForm.tarih || today(), birimFiyat, toplam, durum: sForm.durum || "tamamlandi" };
    const yeni = [...satislar, kayit];
    LS.set("satislar", yeni);
    setSatislar(yeni);
    setSatisModal(false);
    hesapHareketiKaydet(sForm.hesapId, "giris", toplam, kayit.tarih, `El arabas\u0131 sat\u0131\u015F\u0131 \u2014 ${EL_ARABASI_TIP_LABEL[sForm.tip] || ""} (${cariAd(cariler, sForm.musteriId)})`, "satis");
  };
  const uretimSil = (id) => {
    if (!confirm("Bu \xFCretim kayd\u0131 silinsin mi?")) return;
    const yeni = uretim.filter((x) => x.id !== id);
    LS.set("uretimKayitlari", yeni);
    setUretim(yeni);
  };
  const satisSil = (id) => {
    if (!confirm("Bu sat\u0131\u015F kayd\u0131 silinsin mi? (stok geri eklenir)")) return;
    const yeni = satislar.filter((x) => x.id !== id);
    LS.set("satislar", yeni);
    setSatislar(yeni);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F6D2} \xDCretim & Stok \u2014 El Arabas\u0131"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => {
    setUForm({ tarih: today(), tip: "kantarli" });
    setHata("");
    setUretimModal(true);
  } }, "\u{1F3ED} \xDCretim Giri\u015Fi"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setSForm({ tarih: today(), tip: "kantarli" });
    setHata("");
    setSatisModal(true);
  } }, "\u{1F4B0} Sat\u0131\u015F Yap"))), /* @__PURE__ */ React.createElement(Grid4, null, /* @__PURE__ */ React.createElement(StatCard, { color: C.blue, icon: "\u2696\uFE0F", value: `${stokHesapla("kantarli")} adet`, label: "Kantarl\u0131 Stok" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.purple, icon: "\u{1F6D2}", value: `${stokHesapla("kantarsiz")} adet`, label: "Kantars\u0131z Stok" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.green, icon: "\u{1F3ED}", value: uretim.reduce((t, u) => t + (+u.adet || 0), 0), label: "Toplam \xDCretilen (T\xFCm Zamanlar)" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.accent, icon: "\u{1F4B0}", value: fmtTL(satislar.reduce((t, s) => t + (+s.toplam || 0), 0)), label: "Toplam Sat\u0131\u015F Geliri" })), /* @__PURE__ */ React.createElement(TabBar, { tabs: [["stok", "\u2696\uFE0F Stok \xD6zeti"], ["uretim", "\u{1F3ED} \xDCretim Kay\u0131tlar\u0131"], ["satis", "\u{1F4B0} Sat\u0131\u015F Kay\u0131tlar\u0131"]], active: sekme, onChange: setSekme }), sekme === "stok" && /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "Anl\u0131k Stok Durumu"), ["kantarli", "kantarsiz"].map((tip) => {
    const stok = stokHesapla(tip);
    return /* @__PURE__ */ React.createElement("div", { key: tip, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: C.surface, borderRadius: 10, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: C.white } }, EL_ARABASI_TIP_LABEL[tip]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 } }, "Varsay\u0131lan sat\u0131\u015F fiyat\u0131: ", fmtTL(tip === "kantarli" ? settings.kantarliFiyat : settings.kantarsizFiyat))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 24, fontWeight: 800, color: stok <= 3 ? C.red : C.white } }, stok, " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.muted, fontWeight: 400 } }, "adet")));
  })), sekme === "uretim" && /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tip"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Adet"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "A\xE7\u0131klama"), /* @__PURE__ */ React.createElement("th", { style: S.th }))), /* @__PURE__ */ React.createElement("tbody", null, uretim.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: S.td, colSpan: 5 }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Kay\u0131t yok."))) : [...uretim].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).map(
    (u) => /* @__PURE__ */ React.createElement("tr", { key: u.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(u.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, EL_ARABASI_TIP_LABEL[u.tip]), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.green } }, "+", u.adet)), /* @__PURE__ */ React.createElement("td", { style: S.td }, u.aciklama || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => uretimSil(u.id) }, "\u{1F5D1}\uFE0F")))
  )))), sekme === "satis" && /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "M\xFC\u015Fteri"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tip"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Adet"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Birim Fiyat"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Toplam"), /* @__PURE__ */ React.createElement("th", { style: S.th }))), /* @__PURE__ */ React.createElement("tbody", null, satislar.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: S.td, colSpan: 7 }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Kay\u0131t yok."))) : [...satislar].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).map(
    (s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(s.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, s.musteriId))), /* @__PURE__ */ React.createElement("td", { style: S.td }, EL_ARABASI_TIP_LABEL[s.tip]), /* @__PURE__ */ React.createElement("td", { style: S.td }, s.adet), /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtTL(s.birimFiyat)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.accent } }, fmtTL(s.toplam))), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => fisYazdir("Sat\u0131\u015F Fi\u015Fi", [{ aciklama: `${EL_ARABASI_TIP_LABEL[s.tip]} \u2014 ${s.adet} adet x ${fmtTL(s.birimFiyat)}`, tutar: s.toplam }], s.toplam, cariAd(cariler, s.musteriId)) }, "\u{1F5A8}\uFE0F"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => satisSil(s.id) }, "\u{1F5D1}\uFE0F"))))
  )))), uretimModal && /* @__PURE__ */ React.createElement(Modal, { title: "\xDCretim Giri\u015Fi", onClose: () => setUretimModal(false) }, /* @__PURE__ */ React.createElement(FG, { label: "Tarih" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: S.inp, value: uForm.tarih || "", onChange: (e) => setUForm((f) => ({ ...f, tarih: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Tip" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: uForm.tip || "kantarli", onChange: (e) => setUForm((f) => ({ ...f, tip: e.target.value })) }, Object.entries(EL_ARABASI_TIP_LABEL).map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l)))), /* @__PURE__ */ React.createElement(FG, { label: "\xDCretilen Adet" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: uForm.adet || "", onChange: (e) => setUForm((f) => ({ ...f, adet: +e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "A\xE7\u0131klama (opsiyonel)" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: uForm.aciklama || "", onChange: (e) => setUForm((f) => ({ ...f, aciklama: e.target.value })) })), hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setUretimModal(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: uretimKaydet }, "Kaydet"))), satisModal && /* @__PURE__ */ React.createElement(Modal, { title: "Sat\u0131\u015F Yap", onClose: () => setSatisModal(false) }, /* @__PURE__ */ React.createElement(FG, { label: "M\xFC\u015Fteri" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: sForm.musteriId || "", onChange: (e) => setSForm((f) => ({ ...f, musteriId: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), cariler.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.ad)))), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Tip" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: sForm.tip || "kantarli", onChange: (e) => setSForm((f) => ({ ...f, tip: e.target.value })) }, Object.entries(EL_ARABASI_TIP_LABEL).map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l, " (", stokHesapla(k), " adet var)")))), /* @__PURE__ */ React.createElement(FG, { label: "Adet" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: sForm.adet || "", onChange: (e) => setSForm((f) => ({ ...f, adet: +e.target.value })) }))), /* @__PURE__ */ React.createElement(FG, { label: `Birim Fiyat (\u20BA) \u2014 bo\u015F b\u0131rak\u0131l\u0131rsa varsay\u0131lan (${fmtTL(sForm.tip === "kantarsiz" ? settings.kantarsizFiyat : settings.kantarliFiyat)}) kullan\u0131l\u0131r` }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: sForm.birimFiyat || "", onChange: (e) => setSForm((f) => ({ ...f, birimFiyat: +e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "\xD6demenin Girece\u011Fi Hesap" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: sForm.hesapId || "", onChange: (e) => setSForm((f) => ({ ...f, hesapId: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), hesaplar.map((h) => /* @__PURE__ */ React.createElement("option", { key: h.id, value: h.id }, h.ad)))), hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setSatisModal(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: satisKaydet }, "Kaydet"))));
}
function HizliCariEkle({ onClose, onEklendi }) {
  const [ad, setAd] = useState("");
  const [tel, setTel] = useState("");
  const [adres, setAdres] = useState("");
  const kaydet = () => {
    if (!ad.trim()) {
      alert("M\xFC\u015Fteri ad\u0131 zorunludur.");
      return;
    }
    const mevcut = LS.get("cariler");
    const yeni = { id: uid(), ad: ad.trim(), tel: tel.trim(), adres: adres.trim() };
    const tumu = [...mevcut, yeni];
    LS.set("cariler", tumu);
    onEklendi(yeni, tumu);
  };
  return /* @__PURE__ */ React.createElement(Modal, { title: "\u2795 H\u0131zl\u0131 M\xFC\u015Fteri Ekle", onClose, width: 420 }, /* @__PURE__ */ React.createElement(FG, { label: "M\xFC\u015Fteri / Firma Ad\u0131" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: ad, onChange: (e) => setAd(e.target.value), autoFocus: true })), /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: tel, onChange: (e) => setTel(e.target.value) })), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: adres, onChange: (e) => setAdres(e.target.value) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: onClose }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet")));
}
function Cariler() {
  const [liste, setListe] = useState(LS.get("cariler"));
  const [servisler] = useState(LS.get("servisIsleri"));
  const [satislar] = useState(LS.get("satislar"));
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
    ...satislar.filter((s) => s.musteriId === ekstreId).map((s) => ({ tarih: s.tarih, aciklama: `\u{1F6D2} ${EL_ARABASI_TIP_LABEL[s.tip] || ""} (${s.adet} adet)`, tutar: s.toplam, odendi: true }))
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
  const [araclar] = useState(LS.get("araclar"));
  const [hesaplar] = useState(LS.get("hesaplar"));
  const [giderler, setGiderler] = useState(LS.get("giderler"));
  const [cariler] = useState(LS.get("cariler"));
  const [sekme, setSekme] = useState("ozet");
  const [arama, setArama] = useState("");
  const [giderModal, setGiderModal] = useState(false);
  const [giderForm, setGiderForm] = useState({});
  const [hata, setHata] = useState("");
  const aracEtiket = (s) => {
    const a = aracBilgi(araclar, s.aracId);
    return a ? a.plaka : s.aracPlaka || "";
  };
  const tumGelirler = [
    ...servisler.map((s) => ({ id: s.id, tarih: s.tarih, musteriId: s.musteriId, aciklama: `${HIZMET_TIP_LABEL[s.hizmetTuru] || ""} \u2014 ${aracEtiket(s)}`, tutar: s.tutar, odendi: s.odendi, tur: "servis" })),
    ...satislar.map((s) => ({ id: s.id, tarih: s.tarih, musteriId: s.musteriId, aciklama: `${EL_ARABASI_TIP_LABEL[s.tip] || ""} sat\u0131\u015F\u0131 (${s.adet} adet)`, tutar: s.toplam, odendi: true, tur: "satis" }))
  ].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""));
  const toplamGelir = tumGelirler.reduce((t, i) => t + (+i.tutar || 0), 0);
  const toplamGider = giderler.reduce((t, g) => t + (+g.tutar || 0), 0);
  const netKar = toplamGelir - toplamGider;
  const tahsilEdilecek = tumGelirler.filter((i) => !i.odendi).reduce((t, i) => t + (+i.tutar || 0), 0);
  const buAyGelir = tumGelirler.filter((i) => i.tarih && i.tarih.startsWith(today().slice(0, 7))).reduce((t, i) => t + (+i.tutar || 0), 0);
  const buAyGider = giderler.filter((g) => g.tarih && g.tarih.startsWith(today().slice(0, 7))).reduce((t, g) => t + (+g.tutar || 0), 0);
  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const filtreliGelirler = !aramaMetni ? tumGelirler : tumGelirler.filter((i) => (cariAd(cariler, i.musteriId) + " " + i.aciklama).toLocaleLowerCase("tr-TR").includes(aramaMetni));
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
    }
  };
  const giderSil = (id) => {
    if (!confirm("Bu gider kayd\u0131 silinsin mi?")) return;
    const yeni = giderler.filter((x) => x.id !== id);
    LS.set("giderler", yeni);
    setGiderler(yeni);
  };
  const aylikVeri = (() => {
    const aylar = [];
    for (let i = 5; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setMonth(d.getMonth() - i);
      aylar.push(d.toISOString().slice(0, 7));
    }
    return aylar.map((ay) => ({
      ay: ay.slice(5, 7) + "/" + ay.slice(2, 4),
      Gelir: Math.round(tumGelirler.filter((i) => i.tarih && i.tarih.startsWith(ay)).reduce((t, i) => t + (+i.tutar || 0), 0)),
      Gider: Math.round(giderler.filter((g) => g.tarih && g.tarih.startsWith(ay)).reduce((t, g) => t + (+g.tutar || 0), 0))
    }));
  })();
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F4B0} Muhasebe"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setGiderForm({ tarih: today(), kategori: GIDER_KATEGORILERI[0] });
    setHata("");
    setGiderModal(true);
  } }, "\u2796 Yeni Gider Ekle")), /* @__PURE__ */ React.createElement(Grid4, null, /* @__PURE__ */ React.createElement(StatCard, { color: C.green, icon: "\u{1F4B0}", value: fmtTL(toplamGelir), label: "Toplam Gelir" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.red, icon: "\u{1F4C9}", value: fmtTL(toplamGider), label: "Toplam Gider" }), /* @__PURE__ */ React.createElement(StatCard, { color: netKar >= 0 ? C.accent : C.red, icon: "\u{1F4CA}", value: fmtTL(netKar), label: "Net K\xE2r/Zarar" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.blue, icon: "\u23F3", value: fmtTL(tahsilEdilecek), label: "Tahsil Edilecek" })), RC.LineChart && /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4C8} Son 6 Ay Gelir/Gider Trendi"), /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 220 }, /* @__PURE__ */ React.createElement(LineChart, { data: aylikVeri }, /* @__PURE__ */ React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: C.border }), /* @__PURE__ */ React.createElement(XAxis, { dataKey: "ay", tick: { fill: C.muted, fontSize: 11 } }), /* @__PURE__ */ React.createElement(YAxis, { tick: { fill: C.muted, fontSize: 10 }, tickFormatter: (v) => v / 1e3 + "K" }), /* @__PURE__ */ React.createElement(Tooltip, { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }, formatter: (v) => fmtTL(v) }), /* @__PURE__ */ React.createElement(Line, { type: "monotone", dataKey: "Gelir", stroke: C.green, strokeWidth: 2 }), /* @__PURE__ */ React.createElement(Line, { type: "monotone", dataKey: "Gider", stroke: C.red, strokeWidth: 2 })))), /* @__PURE__ */ React.createElement(TabBar, { tabs: [["ozet", "\u{1F4CB} Gelirler"], ["giderler", `\u{1F4C9} Giderler (${giderler.length})`]], active: sekme, onChange: setSekme }), sekme === "ozet" && /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, marginBottom: 14 }, placeholder: "\u{1F50D} M\xFC\u015Fteri veya a\xE7\u0131klamada ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }), /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "M\xFC\u015Fteri"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "A\xE7\u0131klama"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "T\xFCr"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tutar"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Durum"), /* @__PURE__ */ React.createElement("th", { style: S.th }))), /* @__PURE__ */ React.createElement("tbody", null, filtreliGelirler.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: S.td, colSpan: 7 }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Kay\u0131t bulunamad\u0131."))) : filtreliGelirler.map(
    (i) => /* @__PURE__ */ React.createElement("tr", { key: i.tur + i.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(i.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, i.musteriId))), /* @__PURE__ */ React.createElement("td", { style: S.td }, i.aciklama), /* @__PURE__ */ React.createElement("td", { style: S.td }, i.tur === "servis" ? "\u{1F527} Servis" : "\u{1F6D2} Sat\u0131\u015F"), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.accent } }, fmtTL(i.tutar))), /* @__PURE__ */ React.createElement("td", { style: S.td }, i.odendi ? /* @__PURE__ */ React.createElement(Badge, { d: "tamamlandi", map: { tamamlandi: "\xD6dendi" }, renk: { tamamlandi: C.green } }) : /* @__PURE__ */ React.createElement(Badge, { d: "bekliyor", map: { bekliyor: "Bekliyor" }, renk: { bekliyor: C.yellow } })), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => fisYazdir(i.tur === "servis" ? "Servis Fi\u015Fi" : "Sat\u0131\u015F Fi\u015Fi", [{ aciklama: i.aciklama, tutar: i.tutar }], i.tutar, cariAd(cariler, i.musteriId)) }, "\u{1F5A8}\uFE0F Yazd\u0131r")))
  )))), sekme === "giderler" && /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Kategori"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "A\xE7\u0131klama"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tutar"), /* @__PURE__ */ React.createElement("th", { style: S.th }))), /* @__PURE__ */ React.createElement("tbody", null, giderler.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: S.td, colSpan: 5 }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Hen\xFCz gider kayd\u0131 yok."))) : [...giderler].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")).map(
    (g) => /* @__PURE__ */ React.createElement("tr", { key: g.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(g.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement(Badge, { d: g.kategori, map: Object.fromEntries(GIDER_KATEGORILERI.map((k) => [k, k])), renk: Object.fromEntries(GIDER_KATEGORILERI.map((k) => [k, C.steel])) })), /* @__PURE__ */ React.createElement("td", { style: S.td }, g.aciklama || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.red } }, "-", fmtTL(g.tutar))), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => {
      setGiderForm(g);
      setHata("");
      setGiderModal(true);
    } }, "\u270F\uFE0F"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => giderSil(g.id) }, "\u{1F5D1}\uFE0F"))))
  )))), giderModal && /* @__PURE__ */ React.createElement(Modal, { title: giderForm.id ? "Gideri D\xFCzenle" : "Yeni Gider", onClose: () => setGiderModal(false), width: 460 }, /* @__PURE__ */ React.createElement(FG, { label: "Tarih" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: S.inp, value: giderForm.tarih || "", onChange: (e) => setGiderForm((f) => ({ ...f, tarih: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Kategori" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: giderForm.kategori || "", onChange: (e) => setGiderForm((f) => ({ ...f, kategori: e.target.value })) }, GIDER_KATEGORILERI.map((k) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, k)))), /* @__PURE__ */ React.createElement(FG, { label: "A\xE7\u0131klama" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: giderForm.aciklama || "", onChange: (e) => setGiderForm((f) => ({ ...f, aciklama: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Tutar (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: giderForm.tutar || "", onChange: (e) => setGiderForm((f) => ({ ...f, tutar: +e.target.value })) })), !giderForm.id && /* @__PURE__ */ React.createElement(FG, { label: "\xD6demenin \xC7\u0131kt\u0131\u011F\u0131 Hesap (opsiyonel)" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: giderForm.hesapId || "", onChange: (e) => setGiderForm((f) => ({ ...f, hesapId: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Sadece kayda ge\xE7sin, hesaptan d\xFC\u015F\xFClmesin \u2014"), hesaplar.map((h) => /* @__PURE__ */ React.createElement("option", { key: h.id, value: h.id }, h.ad, " (", fmtTL(h.bakiye), ")")))), hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setGiderModal(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: giderKaydet }, "Kaydet"))));
}
function Ayarlar() {
  const [form, setForm] = useState(getSettings());
  const [kaydedildi, setKaydedildi] = useState(false);
  const kaydet = () => {
    saveSettings(form);
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2e3);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 16 } }, "\u2699\uFE0F Ayarlar"), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F3E2} Firma Bilgileri"), /* @__PURE__ */ React.createElement(FG, { label: "Firma Ad\u0131" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaAdi || "", onChange: (e) => setForm((f) => ({ ...f, firmaAdi: e.target.value })) })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaTel || "", onChange: (e) => setForm((f) => ({ ...f, firmaTel: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "KDV Oran\u0131 (%)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.kdvOrani || "", onChange: (e) => setForm((f) => ({ ...f, kdvOrani: +e.target.value })) }))), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaAdres || "", onChange: (e) => setForm((f) => ({ ...f, firmaAdres: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F6D2} El Arabas\u0131 Varsay\u0131lan Fiyatlar"), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Kantarl\u0131 El Arabas\u0131 (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.kantarliFiyat || "", onChange: (e) => setForm((f) => ({ ...f, kantarliFiyat: +e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Kantars\u0131z El Arabas\u0131 (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.kantarsizFiyat || "", onChange: (e) => setForm((f) => ({ ...f, kantarsizFiyat: +e.target.value })) })))), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4BE} Veri Y\xF6netimi"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "T\xFCm verilerinizi tek bir dosya olarak indirin veya geri y\xFCkleyin."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => {
    const veri = {};
    ["cariler", "servisIsleri", "uretimKayitlari", "satislar", "giderler", "malzemeler", "personel", "araclar", "hesaplar", "kasaHareketleri", "cekSenetler", "ayarlar"].forEach((k) => veri[k] = k === "ayarlar" ? getSettings() : LS.get(k));
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
  } })))), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "\u{1F4BE} Ayarlar\u0131 Kaydet"), kaydedildi && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 12, color: C.green, fontSize: 13 } }, "\u2713 Kaydedildi"));
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
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F9D1}\u200D\u{1F527} Personel"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setForm({});
    setModalAcik(true);
  } }, "\u2795 Yeni Personel")), liste.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { ...S.card, borderTop: `3px solid ${C.accent}` } }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u2696\uFE0F Anl\u0131k \u0130\u015F Y\xFCk\xFC"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, 'Her personelin \u015Fu an "Bekliyor" veya "Devam Ediyor" durumundaki a\xE7\u0131k i\u015F say\u0131s\u0131. Yeni bir i\u015F atarken en bo\u015Fta olan\u0131 tercih edebilirsiniz.'), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, liste.map((p) => {
    const sayi = acikIsSayisi(p.id);
    return /* @__PURE__ */ React.createElement("div", { key: p.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: C.surface, borderRadius: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: C.text } }, p.ad, " ", enBostaOlan && enBostaOlan.id === p.id && sayi === 0 && /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(C.green), marginLeft: 8, fontSize: 10 } }, "En bo\u015Fta")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: sayi >= 3 ? C.red : C.white } }, sayi, " a\xE7\u0131k i\u015F"));
  }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 } }, liste.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Hen\xFCz personel eklenmedi."), liste.map(
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
  const [gecmisAracId, setGecmisAracId] = useState(null);
  const [yeniCariAcik, setYeniCariAcik] = useState(false);
  const [arama, setArama] = useState("");
  const kaydet = () => {
    if (!(form.plaka || "").trim()) {
      alert("Plaka zorunludur.");
      return;
    }
    const kayit = { ...form, id: form.id || uid(), plaka: form.plaka.trim().toUpperCase() };
    const yeni = form.id ? liste.map((x) => x.id === form.id ? kayit : x) : [...liste, kayit];
    LS.set("araclar", yeni);
    setListe(yeni);
    setModalAcik(false);
  };
  const sil = (id) => {
    if (servisler.some((s) => s.aracId === id)) {
      alert("Bu araca ait servis kay\u0131tlar\u0131 var, \xF6nce onlar\u0131 d\xFCzenleyin/silin.");
      return;
    }
    if (!confirm("Bu ara\xE7 silinsin mi?")) return;
    const yeni = liste.filter((x) => x.id !== id);
    LS.set("araclar", yeni);
    setListe(yeni);
  };
  const aracServisleri = (aracId) => servisler.filter((s) => s.aracId === aracId).sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""));
  const aramaMetni = arama.trim().toLocaleLowerCase("tr-TR");
  const filtreli = !aramaMetni ? liste : liste.filter((a) => (a.plaka + " " + (a.marka || "") + " " + (a.model || "") + " " + cariAd(cariler, a.musteriId)).toLocaleLowerCase("tr-TR").includes(aramaMetni));
  const gecmisArac = gecmisAracId && liste.find((a) => a.id === gecmisAracId);
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F697} Ara\xE7 Kay\u0131tlar\u0131"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setForm({});
    setModalAcik(true);
  } }, "\u2795 Yeni Ara\xE7")), /* @__PURE__ */ React.createElement("input", { style: { ...S.inp, marginBottom: 16, maxWidth: 360 }, placeholder: "\u{1F50D} Plaka, marka veya m\xFC\u015Fteri ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Plaka"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Marka/Model"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Y\u0131l"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Sahibi"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Servis Ge\xE7mi\u015Fi"), /* @__PURE__ */ React.createElement("th", { style: S.th }))), /* @__PURE__ */ React.createElement("tbody", null, filtreli.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: S.td, colSpan: 6 }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Kay\u0131t bulunamad\u0131."))) : filtreli.map((a) => {
    const gecmis = aracServisleri(a.id);
    return /* @__PURE__ */ React.createElement("tr", { key: a.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, a.plaka)), /* @__PURE__ */ React.createElement("td", { style: S.td }, a.marka, " ", a.model), /* @__PURE__ */ React.createElement("td", { style: S.td }, a.yil || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: S.td }, cariAd(cariler, a.musteriId)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("span", { style: { ...S.badge(C.blue), cursor: "pointer" }, onClick: () => setGecmisAracId(a.id) }, gecmis.length, " servis kayd\u0131")), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => {
      setForm(a);
      setModalAcik(true);
    } }, "\u270F\uFE0F"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => sil(a.id) }, "\u{1F5D1}\uFE0F"))));
  })))), modalAcik && /* @__PURE__ */ React.createElement(Modal, { title: form.id ? "Arac\u0131 D\xFCzenle" : "Yeni Ara\xE7", onClose: () => setModalAcik(false), width: 480 }, /* @__PURE__ */ React.createElement(FG, { label: "Sahibi (M\xFC\u015Fteri)" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: form.musteriId || "", onChange: (e) => setForm((f) => ({ ...f, musteriId: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), cariler.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.ad))), /* @__PURE__ */ React.createElement("button", { type: "button", style: S.btnO, onClick: () => setYeniCariAcik(true) }, "\u2795 Yeni"))), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Plaka" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.plaka || "", onChange: (e) => setForm((f) => ({ ...f, plaka: e.target.value })), placeholder: "45 ABC 123" })), /* @__PURE__ */ React.createElement(FG, { label: "Y\u0131l" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.yil || "", onChange: (e) => setForm((f) => ({ ...f, yil: +e.target.value })) }))), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Marka" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.marka || "", onChange: (e) => setForm((f) => ({ ...f, marka: e.target.value })), placeholder: "Ford" })), /* @__PURE__ */ React.createElement(FG, { label: "Model" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.model || "", onChange: (e) => setForm((f) => ({ ...f, model: e.target.value })), placeholder: "Transit" }))), /* @__PURE__ */ React.createElement(FG, { label: "\u015Easi No (opsiyonel)" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.sasiNo || "", onChange: (e) => setForm((f) => ({ ...f, sasiNo: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Notlar" }, /* @__PURE__ */ React.createElement("textarea", { style: { ...S.inp, minHeight: 60 }, value: form.notlar || "", onChange: (e) => setForm((f) => ({ ...f, notlar: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setModalAcik(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "Kaydet"))), yeniCariAcik && /* @__PURE__ */ React.createElement(HizliCariEkle, { onClose: () => setYeniCariAcik(false), onEklendi: (yeni, tumCariler) => {
    setCariler(tumCariler);
    setForm((f) => ({ ...f, musteriId: yeni.id }));
    setYeniCariAcik(false);
  } }), gecmisArac && /* @__PURE__ */ React.createElement(Modal, { title: `\u{1F697} ${gecmisArac.plaka} \u2014 Servis Ge\xE7mi\u015Fi`, onClose: () => setGecmisAracId(null), width: 640 }, aracServisleri(gecmisArac.id).length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Bu araca ait servis kayd\u0131 yok.") : /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Hizmet"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tutar"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Durum"))), /* @__PURE__ */ React.createElement("tbody", null, aracServisleri(gecmisArac.id).map(
    (s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(s.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, HIZMET_TIP_LABEL[s.hizmetTuru], s.aciklama ? ` \u2014 ${s.aciklama}` : ""), /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtTL(s.tutar)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement(Badge, { d: s.durum })))
  )))));
}
function KasaBanka() {
  const [hesaplar, setHesaplar] = useState(LS.get("hesaplar"));
  const [hareketler, setHareketler] = useState(LS.get("kasaHareketleri"));
  const [cekSenetler, setCekSenetler] = useState(LS.get("cekSenetler"));
  const [cariler] = useState(LS.get("cariler"));
  const [sekme, setSekme] = useState("hesaplar");
  const [hesapModal, setHesapModal] = useState(false);
  const [hesapForm, setHesapForm] = useState({});
  const [hareketModal, setHareketModal] = useState(false);
  const [hareketForm, setHareketForm] = useState({});
  const [cekModal, setCekModal] = useState(false);
  const [cekForm, setCekForm] = useState({});
  const [hata, setHata] = useState("");
  const [detayHesapId, setDetayHesapId] = useState(null);
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
  const toplamBakiye = hesaplar.reduce((t, h) => t + (+h.bakiye || 0), 0);
  const portfoyToplam = cekSenetler.filter((c) => c.durum === "portfoyde").reduce((t, c) => t + (+c.tutar || 0), 0);
  const vadesiYaklasanlar = cekSenetler.filter((c) => {
    if (c.durum !== "portfoyde" || !c.vadeTarihi) return false;
    const kalanGun = Math.ceil((new Date(c.vadeTarihi) - new Date(today())) / 864e5);
    return kalanGun <= 7;
  });
  const detayHareketler = detayHesapId ? hareketler.filter((h) => h.hesapId === detayHesapId).sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")) : [];
  const detayHesap = detayHesapId && hesaplar.find((h) => h.id === detayHesapId);
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white } }, "\u{1F3E6} Kasa & Banka"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => {
    setHesapForm({ tur: "kasa" });
    setHata("");
    setHesapModal(true);
  } }, "\u2795 Yeni Hesap"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setHareketForm({ tarih: today(), yon: "giris" });
    setHata("");
    setHareketModal(true);
  } }, "\u{1F4B5} Yeni \u0130\u015Flem"))), /* @__PURE__ */ React.createElement(Grid4, null, /* @__PURE__ */ React.createElement(StatCard, { color: C.accent, icon: "\u{1F4B0}", value: fmtTL(toplamBakiye), label: "Toplam Bakiye (T\xFCm Hesaplar)" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.blue, icon: "\u{1F3E6}", value: hesaplar.length, label: "Tan\u0131ml\u0131 Hesap Say\u0131s\u0131" }), /* @__PURE__ */ React.createElement(StatCard, { color: C.yellow, icon: "\u{1F4C4}", value: fmtTL(portfoyToplam), label: "Portf\xF6ydeki \xC7ek/Senet" }), /* @__PURE__ */ React.createElement(StatCard, { color: vadesiYaklasanlar.length > 0 ? C.red : C.green, icon: "\u23F0", value: vadesiYaklasanlar.length, label: "Vadesi Yakla\u015Fan (7 g\xFCn)" })), /* @__PURE__ */ React.createElement(TabBar, { tabs: [["hesaplar", "\u{1F3E6} Hesaplar"], ["cekSenet", `\u{1F4C4} \xC7ek/Senet (${cekSenetler.length})`]], active: sekme, onChange: setSekme }), sekme === "hesaplar" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 } }, hesaplar.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Hen\xFCz hesap eklenmedi."), hesaplar.map(
    (h) => /* @__PURE__ */ React.createElement("div", { key: h.id, style: S.card }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 4 } }, HESAP_TUR_LABEL[h.tur] || h.tur), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 8 } }, h.ad), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: (+h.bakiye || 0) >= 0 ? C.green : C.red, marginBottom: 12 } }, fmtTL(h.bakiye)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, flex: 1 }, onClick: () => setDetayHesapId(h.id) }, "\u{1F4CB} Hareketler"), /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "7px 10px" }, onClick: () => {
      setHesapForm(h);
      setHata("");
      setHesapModal(true);
    } }, "\u270F\uFE0F"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => hesapSil(h.id) }, "\u{1F5D1}\uFE0F")))
  )), sekme === "cekSenet" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: () => {
    setCekForm({ tur: "cek", durum: "portfoyde" });
    setHata("");
    setCekModal(true);
  } }, "\u2795 Yeni \xC7ek/Senet")), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "T\xFCr"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Cari"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Vade Tarihi"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tutar"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Durum"), /* @__PURE__ */ React.createElement("th", { style: S.th }))), /* @__PURE__ */ React.createElement("tbody", null, cekSenetler.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: S.td, colSpan: 6 }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: C.muted, padding: 20 } }, "Hen\xFCz kay\u0131t yok."))) : [...cekSenetler].sort((a, b) => (a.vadeTarihi || "").localeCompare(b.vadeTarihi || "")).map(
    (c) => /* @__PURE__ */ React.createElement("tr", { key: c.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, CEK_SENET_TUR_LABEL[c.tur]), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.white } }, cariAd(cariler, c.musteriId))), /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(c.vadeTarihi)), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: C.accent } }, fmtTL(c.tutar))), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement(Badge, { d: c.durum, map: CEK_SENET_DURUM_LABEL, renk: CEK_SENET_DURUM_RENK })), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, c.durum === "portfoyde" && /* @__PURE__ */ React.createElement("button", { style: { ...S.btnO, padding: "5px 8px", fontSize: 11 }, onClick: () => cekDurumGuncelle(c.id, "tahsil") }, "\u2713 Tahsil Et"), /* @__PURE__ */ React.createElement("button", { style: S.btnR, onClick: () => cekSil(c.id) }, "\u{1F5D1}\uFE0F"))))
  ))))), hesapModal && /* @__PURE__ */ React.createElement(Modal, { title: hesapForm.id ? "Hesab\u0131 D\xFCzenle" : "Yeni Hesap", onClose: () => setHesapModal(false), width: 420 }, /* @__PURE__ */ React.createElement(FG, { label: "Hesap Ad\u0131" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: hesapForm.ad || "", onChange: (e) => setHesapForm((f) => ({ ...f, ad: e.target.value })), placeholder: "\xD6rn: \u0130\u015F Bankas\u0131 Vadesiz" })), /* @__PURE__ */ React.createElement(FG, { label: "Hesap T\xFCr\xFC" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: hesapForm.tur || "kasa", onChange: (e) => setHesapForm((f) => ({ ...f, tur: e.target.value })) }, Object.entries(HESAP_TUR_LABEL).map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l)))), !hesapForm.id && /* @__PURE__ */ React.createElement(FG, { label: "Ba\u015Flang\u0131\xE7 Bakiyesi (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: hesapForm.bakiye || "", onChange: (e) => setHesapForm((f) => ({ ...f, bakiye: +e.target.value })) })), hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setHesapModal(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: hesapKaydet }, "Kaydet"))), hareketModal && /* @__PURE__ */ React.createElement(Modal, { title: "Yeni Kasa/Banka \u0130\u015Flemi", onClose: () => setHareketModal(false), width: 440 }, /* @__PURE__ */ React.createElement(FG, { label: "Hesap" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: hareketForm.hesapId || "", onChange: (e) => setHareketForm((f) => ({ ...f, hesapId: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), hesaplar.map((h) => /* @__PURE__ */ React.createElement("option", { key: h.id, value: h.id }, h.ad, " (", fmtTL(h.bakiye), ")")))), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Y\xF6n" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: hareketForm.yon || "giris", onChange: (e) => setHareketForm((f) => ({ ...f, yon: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "giris" }, "\u2795 Para Giri\u015Fi"), /* @__PURE__ */ React.createElement("option", { value: "cikis" }, "\u2796 Para \xC7\u0131k\u0131\u015F\u0131"))), /* @__PURE__ */ React.createElement(FG, { label: "Tutar (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: hareketForm.tutar || "", onChange: (e) => setHareketForm((f) => ({ ...f, tutar: +e.target.value })) }))), /* @__PURE__ */ React.createElement(FG, { label: "Tarih" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: S.inp, value: hareketForm.tarih || "", onChange: (e) => setHareketForm((f) => ({ ...f, tarih: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "A\xE7\u0131klama" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: hareketForm.aciklama || "", onChange: (e) => setHareketForm((f) => ({ ...f, aciklama: e.target.value })) })), hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setHareketModal(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: hareketKaydet }, "Kaydet"))), cekModal && /* @__PURE__ */ React.createElement(Modal, { title: "Yeni \xC7ek/Senet", onClose: () => setCekModal(false), width: 440 }, /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "T\xFCr" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: cekForm.tur || "cek", onChange: (e) => setCekForm((f) => ({ ...f, tur: e.target.value })) }, Object.entries(CEK_SENET_TUR_LABEL).map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l)))), /* @__PURE__ */ React.createElement(FG, { label: "Vade Tarihi" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: S.inp, value: cekForm.vadeTarihi || "", onChange: (e) => setCekForm((f) => ({ ...f, vadeTarihi: e.target.value })) }))), /* @__PURE__ */ React.createElement(FG, { label: "Cari" }, /* @__PURE__ */ React.createElement("select", { style: S.sel, value: cekForm.musteriId || "", onChange: (e) => setCekForm((f) => ({ ...f, musteriId: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), cariler.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.ad)))), /* @__PURE__ */ React.createElement(FG, { label: "Tutar (\u20BA)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: cekForm.tutar || "", onChange: (e) => setCekForm((f) => ({ ...f, tutar: +e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "Not (opsiyonel)" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: cekForm.not || "", onChange: (e) => setCekForm((f) => ({ ...f, not: e.target.value })) })), hata && /* @__PURE__ */ React.createElement("div", { style: { color: C.red, fontSize: 12.5, marginBottom: 12 } }, "\u26A0\uFE0F ", hata), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => setCekModal(false) }, "\u0130ptal"), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: cekKaydet }, "Kaydet"))), detayHesap && /* @__PURE__ */ React.createElement(Modal, { title: `${detayHesap.ad} \u2014 \u0130\u015Flem Ge\xE7mi\u015Fi`, onClose: () => setDetayHesapId(null), width: 560 }, detayHareketler.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: C.muted } }, "Bu hesapta i\u015Flem yok.") : /* @__PURE__ */ React.createElement("table", { style: S.tbl }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tarih"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "A\xE7\u0131klama"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Y\xF6n"), /* @__PURE__ */ React.createElement("th", { style: S.th }, "Tutar"))), /* @__PURE__ */ React.createElement("tbody", null, detayHareketler.map(
    (h) => /* @__PURE__ */ React.createElement("tr", { key: h.id }, /* @__PURE__ */ React.createElement("td", { style: S.td }, fmtDate(h.tarih)), /* @__PURE__ */ React.createElement("td", { style: S.td }, h.aciklama || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: S.td }, h.tur === "giris" ? "\u2795 Giri\u015F" : "\u2796 \xC7\u0131k\u0131\u015F"), /* @__PURE__ */ React.createElement("td", { style: S.td }, /* @__PURE__ */ React.createElement("strong", { style: { color: h.tur === "giris" ? C.green : C.red } }, h.tur === "giris" ? "+" : "-", fmtTL(h.tutar))))
  )))));
}
const SAYFALAR = [
  { id: "dashboard", label: "Genel Bak\u0131\u015F", icon: "\u{1F4CA}", comp: Dashboard },
  { id: "servis", label: "Servis \u0130\u015Fleri", icon: "\u{1F527}", comp: ServisIsleri },
  { id: "araclar", label: "Ara\xE7 Kay\u0131tlar\u0131", icon: "\u{1F697}", comp: Araclar },
  { id: "uretim", label: "\xDCretim & Stok", icon: "\u{1F6D2}", comp: UretimStok },
  { id: "malzeme", label: "Yedek Par\xE7a", icon: "\u{1F9F0}", comp: MalzemeStok },
  { id: "personel", label: "Personel", icon: "\u{1F9D1}\u200D\u{1F527}", comp: Personel },
  { id: "cariler", label: "M\xFC\u015Fteriler", icon: "\u{1F465}", comp: Cariler },
  { id: "kasabanka", label: "Kasa & Banka", icon: "\u{1F3E6}", comp: KasaBanka },
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
function App() {
  seedVeri();
  personelMigrasyonu();
  const [sayfa, setSayfa] = useState(() => location.hash.replace("#", "") || "dashboard");
  useEffect(() => {
    location.hash = sayfa;
  }, [sayfa]);
  const AktifBilesen = (SAYFALAR.find((s) => s.id === sayfa) || SAYFALAR[0]).comp;
  return /* @__PURE__ */ React.createElement("div", { style: S.app }, /* @__PURE__ */ React.createElement("div", { style: S.sidebar }, /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 10px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: C.white } }, "\u{1F527} At\xF6lyePro"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 } }, "Egzoz \xB7 Chiptuning \xB7 \xDCretim")), SAYFALAR.map(
    (s) => /* @__PURE__ */ React.createElement("div", { key: s.id, style: S.navBtn(sayfa === s.id), onClick: () => setSayfa(s.id) }, /* @__PURE__ */ React.createElement("span", null, s.icon), /* @__PURE__ */ React.createElement("span", null, s.label))
  ), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 10px", fontSize: 10.5, color: C.muted, borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 14 } }, "At\xF6lyePro v1.0 \u2014 Yerel veri deposu")), /* @__PURE__ */ React.createElement("div", { style: S.main }, /* @__PURE__ */ React.createElement(AktifBilesen, null)));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
