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
                  React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => fisYazdir("Sat\u0131\u015F Fi\u015Fi", [{ aciklama: `${urunAd(urunler, s.urunId)} \u2014 ${s.adet} adet x ${fmtTL(s.birimFiyat)}`, tutar: s.toplam }], s.toplam, cariAd(cariler, s.musteriId)) }, "\u{1F5A8}\uFE0F"),
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
