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
