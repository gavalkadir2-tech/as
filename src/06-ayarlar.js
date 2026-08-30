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
        await _bulutYaz(anahtar, LS.get(anahtar));
      }
      await _bulutYaz("ayarlar", getSettings());
      const zamanDamgasi = Date.now();
      await _bulutYaz("_sonGuncelleme", zamanDamgasi);
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
  return /* @__PURE__ */ React.createElement("div", { className: "fp-fade" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 16 } }, "\u2699\uFE0F Ayarlar"), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F3E2} Firma Bilgileri"), /* @__PURE__ */ React.createElement(FG, { label: "Firma Ad\u0131" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaAdi || "", onChange: (e) => setForm((f) => ({ ...f, firmaAdi: e.target.value })) })), /* @__PURE__ */ React.createElement(Grid2, null, /* @__PURE__ */ React.createElement(FG, { label: "Telefon" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaTel || "", onChange: (e) => setForm((f) => ({ ...f, firmaTel: e.target.value })) })), /* @__PURE__ */ React.createElement(FG, { label: "KDV Oran\u0131 (%)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: S.inp, value: form.kdvOrani || "", onChange: (e) => setForm((f) => ({ ...f, kdvOrani: +e.target.value })) }))), /* @__PURE__ */ React.createElement(FG, { label: "Adres" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.firmaAdres || "", onChange: (e) => setForm((f) => ({ ...f, firmaAdres: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u2601\uFE0F Bulut Senkronizasyonu"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Verileriniz farkl\u0131 cihazlarda (telefon, bilgisayar) ayn\u0131 g\xF6r\xFCns\xFCn istiyorsan\u0131z kullan\u0131n. ", /* @__PURE__ */ React.createElement("a", { href: "https://kvdb.io/", target: "_blank", rel: "noopener noreferrer", style: { color: C.accent } }, "kvdb.io"), `'ya gidip "Create a new bucket" ile \xFCcretsiz bir kutu olu\u015Fturun, adres \xE7ubu\u011Fundaki kodu a\u015Fa\u011F\u0131ya yap\u0131\u015Ft\u0131r\u0131n. Hesap gerekmez.`), /* @__PURE__ */ React.createElement(FG, { label: "Kutu Ad\u0131 (kvdb.io/xxxx adresindeki kod)" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.bulutKutuAdi || "", onChange: (e) => setForm((f) => ({ ...f, bulutKutuAdi: e.target.value.trim() })), placeholder: "AbCdEfGhIjKlMnOpQrSt" })), /* @__PURE__ */ React.createElement(FG, { label: "\u015eifre (t\xFCm cihazlarda ayn\u0131 olmal\u0131)" }, /* @__PURE__ */ React.createElement("input", { type: "password", style: S.inp, value: form.bulutSifre || "", onChange: (e) => setForm((f) => ({ ...f, bulutSifre: e.target.value })), placeholder: "\xF6rn. G\xFC\xE7l\xFC bir \u015fifre yaz\u0131n" })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.red, marginBottom: 4 } }, "\u26a0\ufe0f Kutu ad\u0131 tahmin edilirse bile bu \u015fifre olmadan verileriniz okunamaz \u2014 mutlaka g\xFC\xE7l\xFC bir \u015fifre girin. \u015eifreyi kaybederseniz buluttaki veriler bir daha \xE7\xF6z\xFClemez (yerel verileriniz etkilenmez); t\xFCm cihazlarda aynen ayn\u0131 \u015fifreyi kullanmal\u0131s\u0131n\u0131z."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: bulutTestEt, disabled: bulutIslemDevam }, "\u{1F50C} Ba\u011Flant\u0131y\u0131 Test Et"), form.bulutKutuAdi && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: bulutaYukle, disabled: bulutIslemDevam }, "\u2B06\uFE0F Buluta Y\xFCkle (Bu Cihazdan)"), /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: buluttanIndir, disabled: bulutIslemDevam }, "\u2B07\uFE0F Buluttan \u0130ndir (Di\u011Fer Cihazdan)"))), bulutTest === "basarili" && /* @__PURE__ */ React.createElement("div", { style: { ...S.alert ? S.alert(C.green) : {}, marginTop: 12, padding: "10px 14px", background: C.green + "18", borderRadius: 8, color: C.green, fontSize: 12.5 } }, "\u2705 Ba\u011Flant\u0131 ba\u015Far\u0131l\u0131! Art\u0131k her de\u011Fi\u015Fiklik otomatik olarak buluta kaydedilecek."), bulutTest && bulutTest !== "basarili" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.red + "18", borderRadius: 8, color: C.red, fontSize: 12.5 } }, "\u26A0\uFE0F ", bulutTest), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted, marginTop: 10 } }, "Not: Bu cihazda yapt\u0131\u011F\u0131n\u0131z her de\u011Fi\u015Fiklik otomatik buluta g\xF6nderilir. Uygulama ayr\u0131ca her 5 saniyede bir buluttaki de\u011Fi\u015Fiklikleri arka planda kontrol edip ekran\u0131n\u0131z\u0131 otomatik g\xFCnceller \u2014 ba\u015Fka bir cihazdan yap\u0131lan de\u011Fi\u015Fiklikler k\u0131sa s\xFCre i\xE7inde burada da g\xF6r\xFCn\xFCr.")), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F510} Google ile Giri\u015F"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Uygulamay\u0131 a\xE7an herkesin Google hesab\u0131yla giri\u015F yapmas\u0131n\u0131 zorunlu k\u0131lar. Kurulum i\xE7in:", /* @__PURE__ */ React.createElement("ol", { style: { margin: "8px 0 0", paddingLeft: 20 } }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "https://console.cloud.google.com/apis/credentials", target: "_blank", rel: "noopener noreferrer", style: { color: C.accent } }, "Google Cloud Console \u2192 Credentials"), "'a gidin (\xFCcretsiz Google hesab\u0131yla)"), /* @__PURE__ */ React.createElement("li", null, '"Create Credentials" \u2192 "OAuth client ID" \u2192 Uygulama t\xFCr\xFC: "Web application"'), /* @__PURE__ */ React.createElement("li", null, '"Authorized JavaScript origins" k\u0131sm\u0131na sitenizin adresini ekleyin (\xF6rn. https://kullaniciadi.github.io)'), /* @__PURE__ */ React.createElement("li", null, 'Olu\u015Fan "Client ID"yi a\u015Fa\u011F\u0131ya yap\u0131\u015Ft\u0131r\u0131n'))), /* @__PURE__ */ React.createElement(FG, { label: "Google Client ID" }, /* @__PURE__ */ React.createElement("input", { style: S.inp, value: form.googleClientId || "", onChange: (e) => setForm((f) => ({ ...f, googleClientId: e.target.value.trim() })), placeholder: "123456789-xxxx.apps.googleusercontent.com" })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.muted } }, "Bo\u015F b\u0131rak\u0131rsan\u0131z Google giri\u015Fi istenmez, uygulama do\u011Frudan a\xE7\u0131l\u0131r.")), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F916} Yapay Zeka (Teknisyen \xD6nerisi)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 } }, "Yeni bir servis i\u015Fi eklerken, hangi teknisyene atanmas\u0131 gerekti\u011Fini yapay zekaya sordurabilirsiniz. ", /* @__PURE__ */ React.createElement("a", { href: "https://console.anthropic.com/settings/keys", target: "_blank", rel: "noopener noreferrer", style: { color: C.accent } }, "console.anthropic.com"), "'dan \xFCcretsiz bir hesapla API key alabilirsiniz (yeni hesaplara \xFCcretsiz kontenjan tan\u0131n\u0131r)."), /* @__PURE__ */ React.createElement(FG, { label: "Anthropic API Key" }, /* @__PURE__ */ React.createElement("input", { type: "password", style: S.inp, value: form.aiApiKey || "", onChange: (e) => setForm((f) => ({ ...f, aiApiKey: e.target.value.trim() })), placeholder: "sk-ant-..." })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.red, marginBottom: 10 } }, "\u26A0\uFE0F Bu key taray\u0131c\u0131n\u0131zda saklan\u0131r ve do\u011Frudan Anthropic'e g\xF6nderilir. Herkesle payla\u015Fmay\u0131n, ba\u015Fkalar\u0131n\u0131n kulland\u0131\u011F\u0131 bir bilgisayara girmeyin."), /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: aiTestEt, disabled: aiTestDevam }, aiTestDevam ? "\u23F3 Test ediliyor..." : "\u{1F50C} Ba\u011Flant\u0131y\u0131 Test Et"), aiTest === "basarili" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.green + "18", borderRadius: 8, color: C.green, fontSize: 12.5 } }, "\u2705 Yapay zeka ba\u011Flant\u0131s\u0131 \xE7al\u0131\u015F\u0131yor."), aiTest && aiTest !== "basarili" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "10px 14px", background: C.red + "18", borderRadius: 8, color: C.red, fontSize: 12.5 } }, "\u26A0\uFE0F ", aiTest)), /* @__PURE__ */ React.createElement("div", { style: S.card }, /* @__PURE__ */ React.createElement("div", { style: S.secTitle }, "\u{1F4BE} Veri Y\xF6netimi (Dosya Olarak)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 14 } }, "T\xFCm verilerinizi tek bir dosya olarak indirin veya geri y\xFCkleyin."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { style: S.btnO, onClick: () => {
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
  } })))), /* @__PURE__ */ React.createElement("button", { style: S.btn(), onClick: kaydet }, "\u{1F4BE} Ayarlar\u0131 Kaydet"), kaydedildi && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 12, color: C.green, fontSize: 13 } }, "\u2713 Kaydedildi"));
}
