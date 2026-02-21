/* ============================================================
   JaviTrack  |  app.js  — Main application logic
   ============================================================ */

/* ---------- Constants ---------- */
const CATEGORIES = {
  upper:       { label: 'Parte Superior', emoji: '💪' },
  lower:       { label: 'Parte Inferior', emoji: '🦵' },
  fullbody:    { label: 'Todo el Cuerpo', emoji: '🏋️' },
  cardio:      { label: 'Cardio',         emoji: '🏃' },
  hiit:        { label: 'HIIT',           emoji: '⚡' },
  flexibility: { label: 'Flexibilidad',   emoji: '🧘' },
};

const INTENSITY_LABELS = {
  1: '😴 Suave',
  2: '🙂 Moderado',
  3: '😤 Intenso',
  4: '🔥 Máximo',
};

/* ---------- State ---------- */
let currentModalId = null;

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  setTodayDate();
  initNavigation();
  initCategorySelector();
  initIntensitySelector();
  initAddExerciseBtn();
  initWorkoutForm();
  renderDashboard();
  renderHistory();
  renderStats();
});

/* ---------- Navigation ---------- */
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });
}

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelector(`.nav-btn[data-view="${name}"]`).classList.add('active');

  if (name === 'dashboard') renderDashboard();
  if (name === 'history')   renderHistory();
  if (name === 'stats')     renderStats();
  if (name === 'add')       resetForm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const workouts = getWorkouts();
  const now = new Date();

  // Total
  document.getElementById('stat-total').textContent = workouts.length;

  // This week
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekCount = workouts.filter(w => new Date(w.date) >= weekStart).length;
  document.getElementById('stat-week').textContent = weekCount;

  // Streak
  document.getElementById('stat-streak').textContent = calcStreak(workouts);

  // Total minutes
  const totalMin = workouts.reduce((s, w) => s + (parseInt(w.duration) || 0), 0);
  document.getElementById('stat-time').textContent = totalMin;

  // Category counts
  Object.keys(CATEGORIES).forEach(cat => {
    const el = document.getElementById('cat-count-' + cat);
    if (el) el.textContent = workouts.filter(w => w.category === cat).length;
  });

  // Recent workouts (last 5)
  const container = document.getElementById('recent-workouts');
  const recent = workouts.slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🏁</span>
        <p>Aún no hay entrenamientos. ¡Empieza el primero!</p>
        <button class="btn btn-primary" onclick="showView('add')">Añadir Entrenamiento</button>
      </div>`;
  } else {
    container.innerHTML = recent.map(w => workoutCardHTML(w)).join('');
  }
}

function calcStreak(workouts) {
  if (!workouts.length) return 0;
  const dates = [...new Set(workouts.map(w => w.date))].sort().reverse();
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const d of dates) {
    const day = new Date(d + 'T00:00:00');
    const diff = Math.round((current - day) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      current = day;
    } else {
      break;
    }
  }
  return streak;
}

/* ---------- Category Filter (from dashboard cards) ---------- */
function filterByCategory(cat) {
  document.getElementById('filter-category').value = cat;
  showView('history');
}

/* ---------- Workout Card HTML ---------- */
function workoutCardHTML(w) {
  const cat = CATEGORIES[w.category] || { emoji: '🏋️', label: w.category };
  const exCount = (w.exercises || []).length;
  const iLabel = INTENSITY_LABELS[w.intensity] || '';
  const formattedDate = formatDate(w.date);
  return `
    <div class="workout-card" onclick="openModal('${w.id}')">
      <div class="workout-cat-badge">${cat.emoji}</div>
      <div class="workout-info">
        <div class="workout-title">${escapeHTML(w.name)}</div>
        <div class="workout-meta">${cat.label}${exCount ? ' · ' + exCount + ' ejercicio' + (exCount > 1 ? 's' : '') : ''}${w.duration ? ' · ' + w.duration + ' min' : ''}</div>
      </div>
      <div class="workout-right">
        <span class="workout-date">${formattedDate}</span>
        <span class="intensity-badge intensity-${w.intensity}">${iLabel}</span>
      </div>
    </div>`;
}

/* ---------- History ---------- */
function renderHistory() {
  const filterCat = document.getElementById('filter-category').value;
  const filterMonth = document.getElementById('filter-month').value;
  let workouts = getWorkouts();

  if (filterCat)   workouts = workouts.filter(w => w.category === filterCat);
  if (filterMonth) workouts = workouts.filter(w => w.date && w.date.startsWith(filterMonth));

  const container = document.getElementById('history-list');
  if (!workouts.length) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon">🔍</span><p>No hay entrenamientos con esos filtros.</p></div>`;
    return;
  }
  container.innerHTML = workouts.map(w => workoutCardHTML(w)).join('');
}

function clearFilters() {
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-month').value = '';
  renderHistory();
}

/* ---------- Stats ---------- */
function renderStats() {
  const workouts = getWorkouts();

  // By category
  const byCat = {};
  Object.keys(CATEGORIES).forEach(k => (byCat[k] = 0));
  workouts.forEach(w => { if (byCat[w.category] !== undefined) byCat[w.category]++; });
  const maxCat = Math.max(...Object.values(byCat), 1);
  document.getElementById('chart-by-category').innerHTML = Object.entries(byCat)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => barRowHTML(CATEGORIES[k].emoji + ' ' + CATEGORIES[k].label, v, maxCat))
    .join('') || '<p style="color:var(--text-muted);font-size:.85rem">Sin datos aún.</p>';

  // By month
  const byMonth = {};
  workouts.forEach(w => {
    if (!w.date) return;
    const m = w.date.substring(0, 7);
    byMonth[m] = (byMonth[m] || 0) + 1;
  });
  const months = Object.keys(byMonth).sort();
  const maxMonth = Math.max(...Object.values(byMonth), 1);
  document.getElementById('chart-by-month').innerHTML = months
    .slice(-6)
    .map(m => barRowHTML(formatMonth(m), byMonth[m], maxMonth))
    .join('') || '<p style="color:var(--text-muted);font-size:.85rem">Sin datos aún.</p>';

  // Top exercises
  const exCount = {};
  workouts.forEach(w => {
    (w.exercises || []).forEach(e => {
      if (e.name) exCount[e.name] = (exCount[e.name] || 0) + 1;
    });
  });
  const top = Object.entries(exCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  document.getElementById('top-exercises').innerHTML = top.length
    ? top.map(([name, count], i) => `
        <div class="top-item">
          <span class="top-rank">#${i + 1}</span>
          <span class="top-name">${escapeHTML(name)}</span>
          <span class="top-count">${count}x</span>
        </div>`).join('')
    : '<p style="color:var(--text-muted);font-size:.85rem">Sin datos aún.</p>';
}

function barRowHTML(label, value, max) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return `
    <div class="bar-row">
      <span class="bar-label" title="${label}">${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span class="bar-val">${value}</span>
    </div>`;
}

/* ---------- Form ---------- */
function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  const input = document.getElementById('workout-date');
  if (input) input.value = today;
}

function resetForm() {
  document.getElementById('workout-form').reset();
  setTodayDate();
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('workout-category').value = '';
  document.querySelectorAll('.intensity-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.level === '2');
  });
  document.getElementById('workout-intensity').value = '2';
  document.getElementById('exercises-container').innerHTML = '';
}

function initCategorySelector() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('workout-category').value = btn.dataset.cat;
    });
  });
}

function initIntensitySelector() {
  // Set default
  document.querySelector('.intensity-btn[data-level="2"]').classList.add('selected');
  document.querySelectorAll('.intensity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('workout-intensity').value = btn.dataset.level;
    });
  });
}

function initAddExerciseBtn() {
  document.getElementById('add-exercise-btn').addEventListener('click', addExerciseRow);
}

function addExerciseRow() {
  const template = document.getElementById('exercise-template');
  const clone = template.content.cloneNode(true);
  clone.querySelector('.remove-exercise').addEventListener('click', function () {
    this.closest('.exercise-item').remove();
  });
  document.getElementById('exercises-container').appendChild(clone);
}

function initWorkoutForm() {
  document.getElementById('workout-form').addEventListener('submit', e => {
    e.preventDefault();
    const category = document.getElementById('workout-category').value;
    if (!category) {
      alert('Por favor selecciona una categoría.');
      return;
    }
    const exercises = collectExercises();
    const workout = {
      name:      document.getElementById('workout-name').value.trim(),
      date:      document.getElementById('workout-date').value,
      duration:  document.getElementById('workout-duration').value || '',
      category,
      intensity: parseInt(document.getElementById('workout-intensity').value),
      notes:     document.getElementById('workout-notes').value.trim(),
      exercises,
    };
    addWorkout(workout);
    showView('dashboard');
  });
}

function collectExercises() {
  const items = document.querySelectorAll('#exercises-container .exercise-item');
  return Array.from(items).map(item => ({
    name:     item.querySelector('.exercise-name').value.trim(),
    sets:     item.querySelector('.exercise-sets').value || '',
    reps:     item.querySelector('.exercise-reps').value || '',
    weight:   item.querySelector('.exercise-weight').value || '',
    duration: item.querySelector('.exercise-duration').value || '',
    notes:    item.querySelector('.exercise-notes').value.trim(),
  })).filter(e => e.name);
}

/* ---------- Modal ---------- */
function openModal(id) {
  const w = getWorkoutById(id);
  if (!w) return;
  currentModalId = id;
  const cat = CATEGORIES[w.category] || { emoji: '🏋️', label: w.category };

  document.getElementById('modal-title').textContent = cat.emoji + ' ' + w.name;

  const exHTML = (w.exercises || []).length
    ? `<div class="detail-exercises">` +
      w.exercises.map(e => {
        const parts = [];
        if (e.sets && e.reps) parts.push(`${e.sets} series × ${e.reps} reps`);
        if (e.weight)         parts.push(`${e.weight} kg`);
        if (e.duration)       parts.push(`${e.duration} min`);
        return `<div class="detail-exercise">
          <div class="detail-exercise-name">${escapeHTML(e.name)}</div>
          ${parts.length ? `<div class="detail-exercise-info">${parts.join(' · ')}</div>` : ''}
          ${e.notes ? `<div class="detail-exercise-info">${escapeHTML(e.notes)}</div>` : ''}
        </div>`;
      }).join('') +
      `</div>`
    : '<p style="color:var(--text-muted);font-size:.9rem">Sin ejercicios registrados.</p>';

  document.getElementById('modal-body').innerHTML = `
    <div class="detail-meta">
      <span class="detail-tag">📅 ${formatDate(w.date)}</span>
      <span class="detail-tag">${cat.emoji} ${cat.label}</span>
      ${w.duration ? `<span class="detail-tag">⏱️ ${w.duration} min</span>` : ''}
      <span class="detail-tag">${INTENSITY_LABELS[w.intensity] || ''}</span>
    </div>
    ${exHTML}
    ${w.notes ? `<div class="detail-notes">📝 ${escapeHTML(w.notes)}</div>` : ''}
  `;

  document.getElementById('modal-delete-btn').onclick = () => {
    if (confirm('¿Eliminar este entrenamiento?')) {
      deleteWorkout(currentModalId);
      closeModal();
      renderDashboard();
      renderHistory();
      renderStats();
    }
  };

  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  currentModalId = null;
}

/* ---------- Utility ---------- */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

function formatMonth(ym) {
  const [y, m] = ym.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return months[parseInt(m)-1] + ' ' + y;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
