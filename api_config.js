(() => {
  const defaultProdBase = "https://slotinjectionpro-backend.onrender.com";
  const defaultLocalBase = "http://127.0.0.1:5000";
  const host = window.location.hostname || "";
  const isLocalHost = host === "localhost" || host === "127.0.0.1";

  const configuredBase =
    window.SLOTIQ_API_BASE ||
    document
      .querySelector('meta[name="slotiq-api-base"]')
      ?.getAttribute("content") ||
    (isLocalHost ? defaultLocalBase : defaultProdBase);

  window.SLOTIQ_API_BASE = configuredBase.replace(/\/+$/, "");
})();
