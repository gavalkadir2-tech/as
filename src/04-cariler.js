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
