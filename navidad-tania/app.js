/* Carta de Navidad · Tania Centro Estético (rediseño navideño) */
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const C = window.CATALOGO;
const LS = 'carta_tania_v1';
const LSN = 'carta_tania_nombre_v1';

const TODOS = [];
C.categorias.forEach((cat) => cat.items.forEach((i) => { i.cat = cat; TODOS.push(i); }));
const PORID = new Map(TODOS.map((i) => [i.id, i]));

let elegidas = new Set();
try { elegidas = new Set(JSON.parse(localStorage.getItem(LS) || '[]')); } catch (e) {}
let nombre = localStorage.getItem(LSN) || '';

const eur = (n) => (Math.round(n * 100) / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const eurCorto = (n) => (Math.round(n * 100) / 100).toLocaleString('es-ES', { maximumFractionDigits: 2 }) + ' €';
const total = () => TODOS.filter((i) => elegidas.has(i.id) && i.precio).reduce((s, i) => s + i.precio, 0);
const guardar = () => { try { localStorage.setItem(LS, JSON.stringify([...elegidas])); } catch (e) {} };

function urlCarta() {
  const base = location.origin + location.pathname;
  const ids = [...elegidas].sort((a, b) => a - b).join('-');
  return base + '#c=' + ids + (nombre ? '&n=' + encodeURIComponent(nombre) : '');
}
function urlCatalogo() { return location.origin + location.pathname; }

/* ---------- pintar catálogo ---------- */
function pintarChips() {
  const nav = $('#chips');
  nav.innerHTML = C.categorias.map((c) => `<a href="#${c.id}">${c.emoji} ${corto(c.nombre)}</a>`).join('');
}
const ROMANOS = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
const romano = (n) => ROMANOS[n - 1] || String(n);
const corto = (n) => n
  .replace('Manicuras, Extensiones y Tratamientos', 'Uñas')
  .replace('Tratamientos Faciales', 'Facial')
  .replace('Pedicuras y Tratamientos Pies', 'Pedicura')
  .replace('Extensiones y Lifting de Pestañas', 'Pestañas')
  .replace('Tinte de Pestañas y Cejas', 'Cejas')
  .replace('Tratamientos y Terapias Corporales', 'Corporal')
  .replace('Paquetes de Promoción', 'Promos')
  .replace('Cosmética en el centro', 'Cosmética');

function tarjeta(i) {
  const el = document.createElement('article');
  el.className = 'card' + (elegidas.has(i.id) ? ' elegida' : '');
  el.dataset.id = i.id;
  const foto = i.foto || i.cat.foto;
  const precio = i.precio
    ? `<span class="precio">${eurCorto(i.precio)}</span>${i.antes ? `<span class="antes">${eurCorto(i.antes)}</span>` : ''}`
    : `<span class="consultar">Consultar precio</span>`;
  el.innerHTML = `
    <div class="foto">
      <img src="${foto}" alt="" loading="lazy">
      ${i.dur ? `<span class="dur">${i.dur}</span>` : ''}
      ${i.promo ? '<span class="promo">PROMO</span>' : ''}
    </div>
    <div class="cuerpo">
      <h3></h3>
      <p class="desc"></p>
      <div class="pie">${precio}<button class="corazon" aria-label="Añadir a mi carta" aria-pressed="${elegidas.has(i.id)}">♥</button></div>
    </div>`;
  el.querySelector('h3').textContent = i.nombre;
  el.querySelector('.desc').textContent = i.desc || '';
  el.querySelector('.corazon').addEventListener('click', (e) => {
    e.stopPropagation();
    alternar(i, el);
  });
  return el;
}

function alternar(i, el) {
  if (elegidas.has(i.id)) elegidas.delete(i.id); else elegidas.add(i.id);
  guardar();
  const yaEsta = elegidas.has(i.id);
  el.classList.toggle('elegida', yaEsta);
  el.querySelector('.corazon').setAttribute('aria-pressed', String(yaEsta));
  actualizarBarra();
}

function pintarCatalogo() {
  const main = $('#catalogo');
  main.innerHTML = C.categorias.map((cat, idx) => `
    <section class="cat" id="${cat.id}">
      <div class="cat-head">
        <span class="num">✦ Apartado ${romano(idx + 1)}</span>
        <h2>${cat.emoji} ${cat.nombre}</h2>
        <p>${cat.sub}</p>
      </div>
      <div class="grid" data-cat="${cat.id}"></div>
    </section>`).join('');
  C.categorias.forEach((cat) => {
    const grid = document.querySelector(`.grid[data-cat="${cat.id}"]`);
    cat.items.forEach((i) => grid.appendChild(tarjeta(i)));
  });
}

/* ---------- barra ---------- */
function actualizarBarra() {
  const n = [...elegidas].length;
  const t = total();
  $('#barra-n').textContent = n;
  $('#barra-total').textContent = eurCorto(t);
  $('#barra-txt').textContent = n === 1 ? 'en tu carta' : 'en tu carta';
  $('#barra').classList.toggle('visible', n > 0);
  $('#hero-total').textContent = n ? `${n} ${n === 1 ? 'elegido' : 'elegidos'} · ${eurCorto(t)}` : 'Marca con ♥ lo que te gustaría';
}

/* ---------- cuenta atrás: Navidad y, después, Reyes ---------- */
function cuentaAtras() {
  const el = document.getElementById('cuenta');
  if (!el) return;
  const hoy = new Date();
  const y = hoy.getFullYear();
  const hoy0 = new Date(y, hoy.getMonth(), hoy.getDate());
  const navidad = new Date(y, 11, 25);
  let destino, nombreFiesta;
  if (hoy0 <= navidad && hoy.getMonth() >= 10) { destino = navidad; nombreFiesta = 'Navidad'; }
  else {
    destino = new Date(hoy.getMonth() === 11 ? y + 1 : y, 0, 6);
    if (hoy0 > destino) destino = new Date(y + 1, 0, 6);
    nombreFiesta = 'los Reyes';
  }
  const dias = Math.round((destino - hoy0) / 86400000);
  if (dias <= 0) el.textContent = nombreFiesta === 'Navidad' ? '¡Feliz Navidad!' : '¡Hoy es el día de Reyes!';
  else if (dias === 1) el.textContent = `Falta 1 día para ${nombreFiesta}`;
  else el.textContent = `Faltan ${dias} días para ${nombreFiesta}`;
}

/* ---------- QR ---------- */
function qrEn(contenedor, texto, tam) {
  contenedor.innerHTML = '';
  const qr = qrcode(0, 'M');
  qr.addData(texto);
  qr.make();
  contenedor.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
  const svg = contenedor.querySelector('svg');
  if (svg) { svg.setAttribute('width', tam); svg.setAttribute('height', tam); }
  return qr;
}

function abrirModal(titulo, sub, texto, mostrarNombre) {
  $('#modal-titulo').textContent = titulo;
  $('#modal-sub').textContent = sub;
  $('#modal-link').textContent = texto;
  $('#qr-canvas').dataset.texto = texto;
  qrEn($('#qr-canvas'), texto, 232);
  $('.nombre-caja').style.display = mostrarNombre ? 'block' : 'none';
  $('#btn-wa-carta').style.display = mostrarNombre ? 'inline-flex' : 'none';
  $('#btn-descargar').style.display = 'inline-flex';
  if (mostrarNombre) {
    $('#btn-wa-carta').href = waLink(`Te paso mi carta de Navidad de Tania 😊 ${texto}`);
  }
  $('#modal').classList.remove('oculto');
}
function cerrarModal() { $('#modal').classList.add('oculto'); }

function waLink(texto) {
  return `https://wa.me/${C.centro.tel.replace('+', '')}?text=` + encodeURIComponent(texto);
}

function descargarQR() {
  const texto = $('#qr-canvas').dataset.texto;
  const qr = qrcode(0, 'M');
  qr.addData(texto);
  qr.make();
  const svg = qr.createSvgTag({ cellSize: 10, margin: 2 });
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'qr-carta-tania.svg';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}

/* ---------- modo regalo ---------- */
function leerHash() {
  const h = location.hash.replace(/^#/, '');
  if (!h) return null;
  const p = new URLSearchParams(h);
  const c = p.get('c');
  if (!c) return null;
  return { ids: c.split('-').map(Number).filter((n) => PORID.has(n)), n: p.get('n') || '' };
}

function pintarRegalo(datos) {
  const items = datos.ids.map((id) => PORID.get(id));
  const t = items.filter((i) => i.precio).reduce((s, i) => s + i.precio, 0);
  const pueblo = (document.querySelector('.escena') || {}).outerHTML || '';
  const nevado = (document.querySelector('.nevado') || {}).outerHTML || '';
  document.body.innerHTML = `
    <div class="regalo">
      <div class="corona">🎄</div>
      <h1>Lo que le gusta a <em id="rn"></em></h1>
      <p class="sub">Querido Papá Noel, queridos Reyes: esto es lo que le gustaría encontrar este año.<br>
        ${items.length} ${items.length === 1 ? 'regalo elegido' : 'regalos elegidos'} en Tania Centro Estético ·
        se reserva por WhatsApp en un minuto</p>
      ${pueblo}${nevado}
    </div>
    <div class="lista" id="lista"></div>
    <div class="total"><span>Total aproximado</span><b id="rtot"></b></div>
    <div class="regalo-btns">
      <a class="btn" id="rwa" target="_blank" rel="noopener">Reservar por WhatsApp</a>
      <a class="btn ghost" href="${urlCatalogo()}">Ver la carta completa</a>
    </div>
    <footer>
      <p><strong>Tania Centro Estético</strong> · Carrer de Masquefa, 44 · 46020 València</p>
      <p>WhatsApp 644 39 90 95 · Precios con IVA</p>
    </footer>`;
  if (datos.n) $('#rn').textContent = datos.n;
  else $('.regalo h1').innerHTML = 'Mi carta de <em>Navidad</em>';
  const lista = $('#lista');
  items.forEach((i) => {
    const d = document.createElement('div');
    d.className = 'item';
    d.innerHTML = `<img class="mini" src="${i.foto || i.cat.foto}" alt=""><div class="t"><span></span><small></small></div><span class="p"></span>`;
    d.querySelector('.t span').textContent = i.nombre;
    d.querySelector('.t small').textContent = [i.cat.nombre, i.dur].filter(Boolean).join(' · ');
    d.querySelector('.p').textContent = i.precio ? eurCorto(i.precio) : '—';
    lista.appendChild(d);
  });
  $('#rtot').textContent = eurCorto(t);
  const msg = `Hola Tania 😊 Vengo de la carta de Navidad${datos.n ? ' de ' + datos.n : ''}. Quiero regalar:\n` +
    items.map((i) => '· ' + i.nombre + (i.precio ? ' — ' + eurCorto(i.precio) : '')).join('\n') + `\nTotal: ${eurCorto(t)}`;
  $('#rwa').href = waLink(msg);
  document.title = (datos.n ? datos.n + ' · ' : '') + 'Carta de Navidad · Tania';
}

/* ---------- arranque ---------- */
const hash = leerHash();
if (hash && hash.ids.length) {
  pintarRegalo(hash);
} else {
  pintarChips();
  pintarCatalogo();
  actualizarBarra();
  cuentaAtras();
  $('#cta-wa').href = waLink('Hola Tania 😊 Quiero reservar un tratamiento de la carta de Navidad.');
  $('#foot-tel').href = 'tel:' + C.centro.tel;

  $('#btn-compartir').addEventListener('click', () => {
    if (!elegidas.size) return;
    abrirModal('Tu carta de Navidad', 'Enséñasela a quien te vaya a regalar: que escanee el QR o ábrelo en su móvil.', urlCarta(), true);
  });
  $('#btn-qr-catalogo').addEventListener('click', () => {
    abrirModal('QR de la carta', 'Imprímelo y ponlo en el centro, en la caja o en el escaparate.', urlCatalogo(), false);
  });
  $('#modal-cerrar').addEventListener('click', cerrarModal);
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') cerrarModal(); });
  $('#btn-copiar').addEventListener('click', async () => {
    const t = $('#qr-canvas').dataset.texto;
    try { await navigator.clipboard.writeText(t); $('#btn-copiar').textContent = '¡Copiado!'; }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove(); $('#btn-copiar').textContent = '¡Copiado!';
    }
    setTimeout(() => { $('#btn-copiar').textContent = 'Copiar enlace'; }, 1800);
  });
  $('#btn-descargar').addEventListener('click', descargarQR);
  $('#input-nombre').value = nombre;
  $('#input-nombre').addEventListener('input', (e) => {
    nombre = e.target.value.trim();
    localStorage.setItem(LSN, nombre);
    const t = urlCarta();
    $('#modal-link').textContent = t;
    $('#qr-canvas').dataset.texto = t;
    qrEn($('#qr-canvas'), t, 232);
    $('#btn-wa-carta').href = waLink(`Te paso mi carta de Navidad de Tania 😊 ${t}`);
  });

  // chip activa al hacer scroll
  const obs = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      $$('#chips a').forEach((a) => a.classList.toggle('activa', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('.cat').forEach((s) => obs.observe(s));
}

window.addEventListener('hashchange', () => {
  const h = leerHash();
  if (h && h.ids.length) pintarRegalo(h);
  else if (document.querySelector('.regalo')) location.reload();
});
