/**
 * ui.js — Слой отображения (Presentation Layer)
 * Отвечает за всё, что видит пользователь: рендер карточек,
 * статистика, переключение экранов, сообщения об ошибках.
 * Запросов к API здесь нет — только работа с DOM.
 */

// ─── Ссылки на DOM-элементы ──────────────────────────────────────────────────

const welcomeScreen = document.getElementById('welcome-screen');
const mainScreen    = document.getElementById('main-screen');
const greetingEl    = document.getElementById('greeting');
const cardsGrid     = document.getElementById('cards-grid');
const loader        = document.getElementById('loader');
const errorBlock    = document.getElementById('error-block');

const statTotal   = document.getElementById('stat-total');
const statAlive   = document.getElementById('stat-alive');
const statDead    = document.getElementById('stat-dead');
const statUnknown = document.getElementById('stat-unknown');

const prevBtn   = document.getElementById('prev-btn');
const nextBtn   = document.getElementById('next-btn');
const pageInfo  = document.getElementById('page-info');

// ─── Переключение экранов ────────────────────────────────────────────────────

/**
 * Скрыть экран приветствия, показать основной.
 * @param {string} name — имя пользователя
 */
export function showMainScreen(name) {
  welcomeScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');
  greetingEl.textContent = `Привет, ${name}!`;
}

// ─── Состояния загрузки ──────────────────────────────────────────────────────

/** Показать спиннер загрузки */
export function showLoader() {
  loader.classList.remove('hidden');
  cardsGrid.classList.add('hidden');
  errorBlock.classList.add('hidden');
}

/** Скрыть спиннер */
export function hideLoader() {
  loader.classList.add('hidden');
  cardsGrid.classList.remove('hidden');
}

/**
 * Показать сообщение об ошибке.
 * @param {string} message
 */
export function showError(message) {
  loader.classList.add('hidden');
  cardsGrid.classList.add('hidden');
  errorBlock.classList.remove('hidden');
  errorBlock.textContent = `⚠️ ${message}`;
}

// ─── Рендер карточек ─────────────────────────────────────────────────────────

/**
 * Определить CSS-класс бейджа по статусу персонажа.
 * @param {string} status
 * @returns {string}
 */
function getBadgeClass(status) {
  const map = { Alive: 'badge-alive', Dead: 'badge-dead', unknown: 'badge-unknown' };
  return map[status] ?? 'badge-unknown';
}

/**
 * Создать DOM-элемент карточки персонажа.
 * @param {Object} character — объект из API
 * @returns {HTMLElement}
 */
function createCard(character) {
  const card = document.createElement('div');
  card.className = 'card';

  // Переводим статус на русский для отображения
  const statusRu = { Alive: 'Живой', Dead: 'Мёртвый', unknown: 'Неизвестно' };
  const genderRu = { Male: 'Мужской', Female: 'Женский', Genderless: 'Без пола', unknown: 'Неизвестно' };

  card.innerHTML = `
    <img src="${character.image}" alt="${character.name}" loading="lazy" />
    <div class="card-body">
      <div class="badge ${getBadgeClass(character.status)}">
        ${statusRu[character.status] ?? character.status}
      </div>
      <div class="card-name" title="${character.name}">${character.name}</div>
      <div class="card-meta">
        <div>Вид: ${character.species}</div>
        <div>Пол: ${genderRu[character.gender] ?? character.gender}</div>
        <div>Локация: ${character.location.name}</div>
      </div>
    </div>
  `;

  return card;
}

/**
 * Отрисовать массив персонажей в сетку карточек.
 * @param {Array} characters
 */
export function renderCards(characters) {
  cardsGrid.innerHTML = '';

  if (characters.length === 0) {
    cardsGrid.innerHTML = '<p style="color:var(--text-muted);padding:2rem;">Ничего не найдено</p>';
    return;
  }

  // Используем DocumentFragment для производительности (одна вставка в DOM)
  const fragment = document.createDocumentFragment();
  characters.forEach(char => fragment.appendChild(createCard(char)));
  cardsGrid.appendChild(fragment);
}

// ─── Статистика ──────────────────────────────────────────────────────────────

/**
 * Обновить строку статистики.
 * @param {Array} characters — текущий массив персонажей на странице
 * @param {number} totalCount — общее количество из API (info.count)
 */
export function renderStats(characters, totalCount) {
  const alive   = characters.filter(c => c.status === 'Alive').length;
  const dead    = characters.filter(c => c.status === 'Dead').length;
  const unknown = characters.filter(c => c.status === 'unknown').length;

  statTotal.textContent   = `Всего в базе: ${totalCount}`;
  statAlive.textContent   = `Живых: ${alive}`;
  statDead.textContent    = `Мёртвых: ${dead}`;
  statUnknown.textContent = `Неизвестно: ${unknown}`;
}

// ─── Пагинация ───────────────────────────────────────────────────────────────

/**
 * Обновить кнопки и текст пагинации.
 * @param {Object} info   — объект info из API { pages, next, prev }
 * @param {number} currentPage
 */
export function renderPagination(info, currentPage) {
  pageInfo.textContent = `Страница ${currentPage} из ${info.pages || 1}`;
  prevBtn.disabled = !info.prev;
  nextBtn.disabled = !info.next;
}
