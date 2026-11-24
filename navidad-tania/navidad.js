/* Nieve cayendo sobre la portada (solo decoración). Se vuelve a poner si la página cambia a la vista de regalo. */
(function () {
  const quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function nevar() {
    const zona = document.querySelector('.portada, .regalo');
    if (!zona || zona.querySelector('.nieve')) return;
    const capa = document.createElement('div');
    capa.className = 'nieve';
    capa.setAttribute('aria-hidden', 'true');
    const n = quieto ? 0 : (window.innerWidth < 600 ? 28 : 55);
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      const tam = (Math.random() * 4 + 2).toFixed(1);
      c.style.left = (Math.random() * 100).toFixed(2) + '%';
      c.style.width = c.style.height = tam + 'px';
      c.style.opacity = (Math.random() * 0.5 + 0.35).toFixed(2);
      c.style.animationDuration = (Math.random() * 10 + 9).toFixed(1) + 's, ' + (Math.random() * 3 + 3).toFixed(1) + 's';
      c.style.animationDelay = (-Math.random() * 18).toFixed(1) + 's, ' + (-Math.random() * 4).toFixed(1) + 's';
      capa.appendChild(c);
    }
    zona.appendChild(capa);
  }
  nevar();
  window.addEventListener('hashchange', () => setTimeout(nevar, 0));
})();
