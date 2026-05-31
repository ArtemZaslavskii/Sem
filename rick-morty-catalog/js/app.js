/**
 * app.js — Точка входа (Entry Point)
 * Связывает слой данных (api.js) и слой отображения (ui.js).
 * Хранит состояние приложения и вешает обработчики событий.
 */

import { fetchCharacters } from './api.js';
import {
  showMainScreen,
  showLoader,
  hideLoader,
  showError,
  renderCards,
  renderStats,
  renderPagination,
} from './ui.js';

// ─── Состояние приложения ────────────────────────────────────────────────────

const state = {
  currentPage: 1,
  sortDir: 'asc',      // 'asc' | 'desc'
  filters: {
    name:   '',
    status: '',
    gender: '',
  },
};

// ─── DOM-элементы управления ─────────────────────────────────────────────────

const usernameInput = document.getElementById('username-input');
const welcomeBtn    = document.getElementById('welcome-btn');
const welcomeError  = document.getElementById('welcome-error');

const searchInput  = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const genderFilter = document.getElementById('gender-filter');
const sortBtn      = document.getElementById('sort-btn');
const resetBtn     = document.getElementById('reset-btn');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// ─── Основная функция загрузки данных ────────────────────────────────────────

/**
 * Загрузить персонажей с текущими фильтрами и страницей,
 * затем отсортировать и отрисовать.
 */
async function loadCharacters() {
  showLoader();

  try {
    const data = await fetchCharacters({
      page:   state.currentPage,
      name:   state.filters.name,
      status: state.filters.status,
      gender: state.filters.gender,
    });

    // Сортировка на клиенте
    const sorted = sortCharacters(data.results, state.sortDir);

    hideLoader();
    renderCards(sorted);
    renderStats(sorted, data.info.count);
    renderPagination(data.info, state.currentPage);

  } catch (error) {
    showError('Не удалось загрузить данные. Проверьте соединение.');
    console.error(error);
  }
}

// ─── Сортировка ──────────────────────────────────────────────────────────────

/**
 * Сортировать массив персонажей по имени.
 * @param {Array} characters
 * @param {'asc'|'desc'} dir
 * @returns {Array}
 */
function sortCharacters(characters, dir) {
  return [...characters].sort((a, b) => {
    const cmp = a.name.localeCompare(b.name, 'ru');
    return dir === 'asc' ? cmp : -cmp;
  });
}

// ─── Обработчики событий ─────────────────────────────────────────────────────

// 1. Кнопка «Далее» на экране приветствия — событие click
welcomeBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();

  if (!name) {
    welcomeError.classList.remove('hidden');
    return;
  }

  welcomeError.classList.add('hidden');
  showMainScreen(name);
  loadCharacters();
});

// Также Enter в поле имени
usernameInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') welcomeBtn.click();
});

// 2. Поиск по имени — событие keyup (живой поиск)
let searchTimer = null;
searchInput.addEventListener('keyup', () => {
  // Дебаунс: ждём 400мс после последнего нажатия, чтобы не спамить запросами
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.filters.name = searchInput.value.trim();
    state.currentPage = 1;
    loadCharacters();
  }, 400);
});

// 3. Фильтр по статусу — событие change
statusFilter.addEventListener('change', () => {
  state.filters.status = statusFilter.value;
  state.currentPage = 1;
  loadCharacters();
});

// 4. Фильтр по полу — событие change
genderFilter.addEventListener('change', () => {
  state.filters.gender = genderFilter.value;
  state.currentPage = 1;
  loadCharacters();
});

// 5. Кнопка сортировки — событие click
sortBtn.addEventListener('click', () => {
  state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
  sortBtn.textContent = state.sortDir === 'asc' ? 'Сортировка: А → Я' : 'Сортировка: Я → А';
  loadCharacters();
});

// 6. Сброс фильтров — событие click
resetBtn.addEventListener('click', () => {
  state.filters = { name: '', status: '', gender: '' };
  state.currentPage = 1;
  state.sortDir = 'asc';

  searchInput.value  = '';
  statusFilter.value = '';
  genderFilter.value = '';
  sortBtn.textContent = 'Сортировка: А → Я';

  loadCharacters();
});

// 7. Пагинация — события click
prevBtn.addEventListener('click', () => {
  if (state.currentPage > 1) {
    state.currentPage--;
    loadCharacters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

nextBtn.addEventListener('click', () => {
  state.currentPage++;
  loadCharacters();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
