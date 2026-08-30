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
