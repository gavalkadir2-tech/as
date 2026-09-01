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
  const [yedekUyarisiKapatildi, setYedekUyarisiKapatildi] = useState(false);
  const sonYedekZamani = +(localStorage.getItem("fp_son_yedek") || 0);
  const yedekGerekli = !bulutHazirMi() && !yedekUyarisiKapatildi && (!sonYedekZamani || Date.now() - sonYedekZamani > 7 * 24 * 60 * 60 * 1e3);
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
  )), /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-spacer", style: { flex: 1 } }), kullanici && /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-footer", style: { padding: "10px", display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 14 } }, kullanici.foto && /* @__PURE__ */ React.createElement("img", { src: kullanici.foto, alt: "", style: { width: 28, height: 28, borderRadius: "50%" } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, kullanici.ad)), /* @__PURE__ */ React.createElement("button", { onClick: cikisYap, title: "\xC7\u0131k\u0131\u015F Yap", style: { background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 } }, "\u23FB")), /* @__PURE__ */ React.createElement("div", { className: "fp-sidebar-footer", style: { padding: "12px 10px", fontSize: 10.5, color: C.muted, borderTop: kullanici ? "none" : `1px solid ${C.border}`, marginTop: kullanici ? 0 : 12, paddingTop: kullanici ? 4 : 14 } }, "At\xF6lyePro v1.0 \u2014 Yerel veri deposu")), /* @__PURE__ */ React.createElement("div", { className: "fp-main", style: S.main }, yedekGerekli && /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 0, zIndex: 50, background: C.yellow, color: "#161311", padding: "10px 16px", borderRadius: 8, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: 13, fontWeight: 700 } }, "⚠️ Verileriniz sadece bu tarayıcıda saklanıyor ve uzun s\xFCredir yedeğini almadınız. Tarayıcı verisi silinirse t\xFCm veriler kaybolur.", /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { style: { background: "#161311", color: C.white, border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }, onClick: () => setSayfa("ayarlar") }, "Ayarlar'a Git"), /* @__PURE__ */ React.createElement("button", { style: { background: "transparent", color: "#161311", border: "1px solid #161311aa", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }, onClick: () => setYedekUyarisiKapatildi(true) }, "Kapat"))), yeniVeriVar && /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 0, zIndex: 50, background: C.accent, color: "#161311", padding: "10px 16px", borderRadius: 8, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700 } }, "\u{1F504} Ba\u015Fka bir cihazda de\u011Fi\u015Fiklik yap\u0131ld\u0131.", /* @__PURE__ */ React.createElement("button", { style: { background: "#161311", color: C.white, border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }, onClick: async () => {
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
