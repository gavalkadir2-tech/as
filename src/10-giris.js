function GirisEkrani({ onGiris }) {
  const butonRef = useRef(null);
  const [hata, setHata] = useState("");
  const clientId = getSettings().googleClientId;
  useEffect(() => {
    if (!clientId || !window.google || !window.google.accounts) return;
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (yanit) => {
          try {
            const parcalar = yanit.credential.split(".");
            const bilgi = JSON.parse(atob(parcalar[1].replace(/-/g, "+").replace(/_/g, "/")));
            const kullanici = { ad: bilgi.name, email: bilgi.email, foto: bilgi.picture };
            sessionStorage.setItem("fp_google_kullanici", JSON.stringify(kullanici));
            onGiris(kullanici);
          } catch (e) {
            setHata("Giri\u015F bilgisi okunamad\u0131: " + e.message);
          }
        }
      });
      if (butonRef.current) {
        window.google.accounts.id.renderButton(butonRef.current, { theme: "filled_black", size: "large", text: "signin_with", shape: "pill" });
      }
    } catch (e) {
      setHata("Google giri\u015F sistemi ba\u015Flat\u0131lamad\u0131: " + e.message);
    }
  }, [clientId]);
  if (!clientId) {
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg } }, /* @__PURE__ */ React.createElement("div", { style: { ...S.card, maxWidth: 420, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, marginBottom: 10 } }, "\u{1F527}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 8 } }, "Google ile Giri\u015F Kurulmad\u0131"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.muted } }, "Ayarlar \u2192 Google Giri\u015Fi'nden bir Client ID girip kaydedin. O zamana kadar uygulamaya do\u011Frudan devam edebilirsiniz."), /* @__PURE__ */ React.createElement("button", { style: { ...S.btn(), marginTop: 16 }, onClick: () => onGiris(null) }, "Google's\u0131z Devam Et")));
  }
  return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg } }, /* @__PURE__ */ React.createElement("div", { style: { ...S.card, maxWidth: 380, textAlign: "center", padding: 32 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 36, marginBottom: 12 } }, "\u{1F527}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 4 } }, getSettings().firmaAdi), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.muted, marginBottom: 24 } }, "Devam etmek i\xE7in Google hesab\u0131n\u0131zla giri\u015F yap\u0131n"), /* @__PURE__ */ React.createElement("div", { ref: butonRef, style: { display: "flex", justifyContent: "center" } }), hata && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, color: C.red, fontSize: 12 } }, "\u26A0\uFE0F ", hata)));
}
