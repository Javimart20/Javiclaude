/* Adornos de Navidad (solo decoración): guirnalda con luces, bolas colgando, nieve y la escena
   ilustrada de fondo (imagen fija y, si se puede, vídeo en bucle). Se ponen en la portada y también en la página «Lo que le gusta a…». */
(function () {
  const quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const movil = window.innerWidth < 600;

  const GUIRNALDA = '<svg class="rama" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M-10 4 Q600 76 1210 4" fill="none" stroke="#0f3a27" stroke-width="16" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
    '<path d="M-10 4 Q600 76 1210 4" fill="none" stroke="#2f7d55" stroke-width="18" stroke-dasharray="1.5 3.5" vector-effect="non-scaling-stroke"/>' +
    '<path d="M-10 4 Q600 76 1210 4" fill="none" stroke="#4aa271" stroke-width="10" stroke-dasharray="1 5" vector-effect="non-scaling-stroke"/>' +
    '</svg>';

  function decorar() {
    const zona = document.querySelector('.portada, .regalo');
    if (!zona || zona.querySelector('.adornos')) return;
    const capa = document.createElement('div');
    capa.className = 'adornos';
    capa.setAttribute('aria-hidden', 'true');


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
    const conEscena = !!zona.querySelector('.escena');
    // con la ilustración, la luna y el trineo están arriba a la derecha: las bolas van solo a la izquierda
    const sitios = conEscena
      ? (movil ? [[4, 50], [14, 96], [24, 40]] : [[3, 60], [8, 130], [14, 84], [20, 44]])
      : (movil ? [[3, 46], [11, 92], [86, 70], [94, 40]] : [[3, 60], [8, 130], [14, 84], [86, 96], [91, 150], [96, 62]]);
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
  // vídeo de fondo de la portada: solo si el usuario no pide menos movimiento ni ahorro de datos
  function video() {
    const v = document.querySelector('.escena video');
    if (!v || v.getAttribute('src') || quieto) return;
    if (navigator.connection && navigator.connection.saveData) return;
    v.src = window.matchMedia('(max-width:700px)').matches ? v.dataset.movil : v.dataset.escritorio;
    v.addEventListener('playing', function () { v.classList.add('visible'); }, { once: true });
    const p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  decorar();
  ambiente();
  video();
  window.addEventListener('hashchange', function () { setTimeout(function () { decorar(); ambiente(); video(); }, 0); });
})();
