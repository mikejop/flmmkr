// Google Analytics da FLMMKR Plugins (G-1SVPG3X5SL), só nas páginas /plugins.
// Fica em arquivo próprio para a CSP não precisar de script inline. O gtag.js já é carregado pelo layout raiz;
// aqui só registra a propriedade dos plugins (o gtag aceita várias propriedades na mesma página).
(function () {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
  }
  window.gtag('config', 'G-1SVPG3X5SL');
})();
