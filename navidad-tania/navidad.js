/* Adornos de Navidad (solo decoración): guirnalda con luces, bolas colgando, luna con el trineo
   de Papá Noel y nieve. Se ponen en la portada y también en la página «Lo que le gusta a…». */
(function () {
  const quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const movil = window.innerWidth < 600;

  const GUIRNALDA = '<svg class="rama" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M-10 4 Q600 76 1210 4" fill="none" stroke="#0f3a27" stroke-width="16" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
    '<path d="M-10 4 Q600 76 1210 4" fill="none" stroke="#2f7d55" stroke-width="18" stroke-dasharray="1.5 3.5" vector-effect="non-scaling-stroke"/>' +
    '<path d="M-10 4 Q600 76 1210 4" fill="none" stroke="#4aa271" stroke-width="10" stroke-dasharray="1 5" vector-effect="non-scaling-stroke"/>' +
    '</svg>';

  const TRINEO = '<svg class="trineo" viewBox="0 0 300 80" aria-hidden="true"><g fill="#fbeec8">' +
    // trineo y Papá Noel
    '<circle cx="54" cy="31" r="10"/>' +
    '<path d="M62 41 C62 28 66 22 74 22 C80 22 84 28 84 41 Z"/>' +
    '<circle cx="75" cy="17" r="5.5"/><path d="M69 14 L81 13 L88 6 L86 4 Z"/>' +
    '<path d="M40 40 L104 40 C109 40 112 34 110 29 L100 29 L96 46 L48 46 C42 46 40 43 40 40 Z"/>' +
    '</g><g fill="none" stroke="#fbeec8" stroke-linecap="round">' +
    '<path d="M34 55 C44 60 102 60 114 50" stroke-width="3"/>' +
    '<path d="M54 46 L52 56 M92 46 L94 56" stroke-width="2.2"/>' +
    '<path d="M108 34 C140 30 170 28 266 28" stroke-width="1"/>' +
    '</g>' + [150, 195, 240].map(function (x, i) {
      return '<g fill="#fbeec8"><ellipse cx="' + x + '" cy="38" rx="14" ry="6"/>' +
        '<path d="M' + (x + 9) + ' 36 L' + (x + 16) + ' 26 L' + (x + 20) + ' 27 L' + (x + 14) + ' 38 Z"/>' +
        '<ellipse cx="' + (x + 21) + '" cy="25" rx="5" ry="3"/>' +
        (i === 2 ? '<circle cx="' + (x + 26) + '" cy="25" r="2" fill="#ff4b55"/>' : '') +
        '</g><g fill="none" stroke="#fbeec8" stroke-width="2" stroke-linecap="round">' +
        '<path d="M' + (x + 18) + ' 22 L' + (x + 16) + ' 14 M' + (x + 17) + ' 17 L' + (x + 12) + ' 15 M' + (x + 21) + ' 22 L' + (x + 23) + ' 14 M' + (x + 22) + ' 17 L' + (x + 27) + ' 15"/>' +
        '<path d="M' + (x - 9) + ' 41 L' + (x - 16) + ' 50 M' + (x - 5) + ' 43 L' + (x - 3) + ' 53 M' + (x + 6) + ' 43 L' + (x + 13) + ' 51 M' + (x + 10) + ' 41 L' + (x + 18) + ' 46"/></g>';
    }).join('') + '</svg>';

  function decorar() {
    const zona = document.querySelector('.portada, .regalo');
    if (!zona || zona.querySelector('.adornos')) return;
    const capa = document.createElement('div');
    capa.className = 'adornos';
    capa.setAttribute('aria-hidden', 'true');

    // luna y trineo
    capa.insertAdjacentHTML('beforeend', '<div class="luna"></div>' + TRINEO);

    // guirnalda de pino con luces
    const g = document.createElement('div');
    g.className = 'guirnalda';
    g.innerHTML = GUIRNALDA;
    const n = movil ? 11 : 19;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const b = document.createElement('i');
      b.style.left = (t * 100).toFixed(2) + '%';
      b.style.top = (4 + 4 * 36 * t * (1 - t) * 0.92).toFixed(1) + 'px';
      b.style.animationDelay = ((i % 4) * 0.6).toFixed(1) + 's';
      g.appendChild(b);
    }
    capa.appendChild(g);

    // bolas colgando a los lados
    const colores = ['#c62f3a', '#d8b25c', '#2f6fd6', '#c62f3a', '#2f8a57', '#d8b25c'];
    const sitios = movil ? [[3, 46], [11, 92], [86, 70], [94, 40]] : [[3, 60], [8, 130], [14, 84], [86, 96], [91, 150], [96, 62]];
    sitios.forEach(function (p, i) {
      const b = document.createElement('span');
      b.className = 'bola';
      b.style.left = p[0] + '%';
      b.style.setProperty('--l', p[1] + 'px');
      b.style.setProperty('--c', colores[i % colores.length]);
      b.style.animationDelay = (-i * 0.7).toFixed(1) + 's';
      capa.appendChild(b);
    });

    // nieve
    const nieve = document.createElement('div');
    nieve.className = 'nieve';
    const copos = quieto ? 0 : (movil ? 34 : 70);
    for (let i = 0; i < copos; i++) {
      const c = document.createElement('i');
      const grande = Math.random() < 0.18;
      if (grande) { c.className = 'copo'; c.textContent = '❄'; c.style.fontSize = (Math.random() * 8 + 10).toFixed(0) + 'px'; }
      else { const tam = (Math.random() * 4 + 2).toFixed(1); c.style.width = c.style.height = tam + 'px'; }
      c.style.left = (Math.random() * 100).toFixed(2) + '%';
      c.style.opacity = (Math.random() * 0.5 + 0.4).toFixed(2);
      c.style.animationDuration = (Math.random() * 10 + 9).toFixed(1) + 's, ' + (Math.random() * 3 + 3).toFixed(1) + 's';
      c.style.animationDelay = (-Math.random() * 18).toFixed(1) + 's, ' + (-Math.random() * 4).toFixed(1) + 's';
      nieve.appendChild(c);
    }
    capa.appendChild(nieve);

    zona.insertBefore(capa, zona.firstChild);
  }
  // ambiente de toda la página: estrellas y nieve fijas al fondo, detrás de las tarjetas
  function ambiente() {
    if (document.querySelector('.ambiente')) return;
    const a = document.createElement('div');
    a.className = 'ambiente';
    a.setAttribute('aria-hidden', 'true');
    const copos = quieto ? 0 : (movil ? 30 : 55);
    for (let i = 0; i < copos; i++) {
      const c = document.createElement('i');
      if (Math.random() < 0.2) { c.className = 'copo'; c.textContent = '❄'; c.style.fontSize = (Math.random() * 8 + 10).toFixed(0) + 'px'; }
      else { const tam = (Math.random() * 4 + 2).toFixed(1); c.style.width = c.style.height = tam + 'px'; }
      c.style.left = (Math.random() * 100).toFixed(2) + '%';
      c.style.opacity = (Math.random() * 0.45 + 0.35).toFixed(2);
      c.style.animationDuration = (Math.random() * 12 + 12).toFixed(1) + 's';
      c.style.animationDelay = (-Math.random() * 24).toFixed(1) + 's';
      a.appendChild(c);
    }
    document.body.insertBefore(a, document.body.firstChild);
  }
  decorar();
  ambiente();
  window.addEventListener('hashchange', function () { setTimeout(function () { decorar(); ambiente(); }, 0); });
})();
