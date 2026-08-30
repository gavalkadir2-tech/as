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
