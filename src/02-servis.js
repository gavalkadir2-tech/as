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
  const [yeniCariAcik, setYeniCariAcik] = useState(false);
  const [yeniAracAcik, setYeniAracAcik] = useState(false);
  const [arama, setArama] = useState("");
  const [odemeModal, setOdemeModal] = useState(null);
  const [odemeHesapId, setOdemeHesapId] = useState("");
  const [aiOneriDevam, setAiOneriDevam] = useState(false);
  const [aiOneriMetni, setAiOneriMetni] = useState("");
  const [gecmisModal, setGecmisModal] = useState(null);

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
    if (!form.musteriId) {
      setHata("M\xFC\u015Fteri se\xE7imi zorunludur.");
      return;
    }
    if (!form.aracId) {
      setHata("Ara\xE7/\xFCr\xFCn se\xE7imi zorunludur.");
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
  const gosterilecek = !aramaMetni ? durumaGoreFiltreli : durumaGoreFiltreli.filter((s) => (cariAd(cariler, s.musteriId) + " " + aracEtiket(s) + " " + (s.aciklama || "") + " " + (s.isEmriNo || "")).toLocaleLowerCase("tr-TR").includes(aramaMetni));
  const musteriAraclari = form.musteriId ? araclar.filter((a) => a.musteriId === form.musteriId) : araclar;
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
      React.createElement("input", { style: { ...S.inp, marginBottom: 14 }, placeholder: "\u{1F50D} \u0130\u015F emri no, m\xFC\u015Fteri, plaka veya a\xE7\u0131klamada ara\u2026", value: arama, onChange: (e) => setArama(e.target.value) }),
      React.createElement(
        "table",
        { style: S.tbl },
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
                  React.createElement("td", { style: S.td }, aracEtiket(s)),
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
                      React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => isEmriYazdir(s, cariAd(cariler, s.musteriId), aracEtiket(s)) }, "\u{1F5A8}\uFE0F"),
                      s.durum === "tamamlandi" && s.garantili && (!s.garantiBitis || s.garantiBitis >= today()) && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11 }, title: "Garanti Kapsam\u0131nda Tekrar \u0130\u015F A\xE7", onClick: () => garantiTekrarAc(s) }, "\u{1F6E1}\uFE0F"),
                      s.asama !== "iptal" && s.asama !== "teslim_edildi" && React.createElement("button", { style: { ...S.btnO, padding: "5px 10px", fontSize: 11, color: C.red }, title: "\u0130ptal Et", onClick: () => iptalEt(s) }, "\u2715"),
                      React.createElement("button", { style: { ...S.btnO, padding: "5px 10px" }, onClick: () => { setForm(s); setHata(""); setModalAcik(true); } }, "\u270F\uFE0F"),
                      React.createElement("button", { style: S.btnR, onClick: () => sil(s.id) }, "\u{1F5D1}\uFE0F")
                    )
                  )
                );
              })
        )
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
      React.createElement(FG, { label: "M\xFC\u015Fteri" }, React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement("select", { style: S.sel, value: form.musteriId || "", onChange: (e) => setForm((f) => ({ ...f, musteriId: e.target.value, aracId: "" })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), cariler.map((c) => React.createElement("option", { key: c.id, value: c.id }, c.ad))),
        React.createElement("button", { type: "button", style: S.btnO, onClick: () => setYeniCariAcik(true) }, "\u2795 Yeni")
      )),
      React.createElement(FG, { label: "Ara\xE7/\xDCr\xFCn" }, React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement("select", { style: S.sel, value: form.aracId || "", onChange: (e) => setForm((f) => ({ ...f, aracId: e.target.value })) }, React.createElement("option", { value: "" }, "\u2014 Se\xE7iniz \u2014"), musteriAraclari.map((a) => React.createElement("option", { key: a.id, value: a.id }, a.plaka, a.marka ? ` \xB7 ${a.marka} ${a.model || ""}` : ""))),
        React.createElement("button", { type: "button", style: S.btnO, onClick: () => setYeniAracAcik(true) }, "\u2795 Yeni")
      ), !form.musteriId && React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 6 } }, "\xD6nce m\xFC\u015Fteri se\xE7erseniz sadece onun ara\xE7lar\u0131 listelenir.")),
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
    yeniCariAcik && React.createElement(HizliCariEkle, { onClose: () => setYeniCariAcik(false), onEklendi: (yeni, tumCariler) => {
      setCariler(tumCariler);
      setForm((f) => ({ ...f, musteriId: yeni.id }));
      setYeniCariAcik(false);
    } }),
    yeniAracAcik && React.createElement(Modal, { title: "\u2795 H\u0131zl\u0131 Ara\xE7 Ekle", onClose: () => setYeniAracAcik(false), width: 420 }, React.createElement(HizliAracFormu, { musteriId: form.musteriId, onClose: () => setYeniAracAcik(false), onEklendi: (yeni, tumAraclar) => {
      setAraclar(tumAraclar);
      setForm((f) => ({ ...f, aracId: yeni.id }));
      setYeniAracAcik(false);
    } })),
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
    )
  );
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
