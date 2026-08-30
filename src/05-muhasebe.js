function Muhasebe() {
  const [servisler] = useState(LS.get("servisIsleri"));
  const [satislar] = useState(LS.get("satislar"));
  const [faturalar] = useState(LS.get("faturalar"));
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
                React.createElement("td", { style: S.td }, React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, onClick: () => faturaYazdir(f, cariAd(cariler, f.musteriId)) }, "\u{1F5A8}\uFE0F Yazd\u0131r"))
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
