/**
 * api.js — Слой данных (Data Layer)
 * Отвечает за все запросы к Rick and Morty API.
 * UI-логики здесь нет — только fetch и обработка ошибок.
 */

const BASE_URL = 'https://rickandmortyapi.com/api';

/**
 * Универсальная функция запроса.
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function request(url) {
  const response = await fetch(url);

  // Проверяем HTTP-статус
  if (!response.ok) {
    throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Получить список персонажей с поддержкой фильтров.
 * @param {Object} params
 * @param {number} params.page     — номер страницы (по умолчанию 1)
 * @param {string} params.name     — фильтр по имени
 * @param {string} params.status   — alive | dead | unknown
 * @param {string} params.gender   — male | female | genderless | unknown
 * @returns {Promise<{results: Array, info: Object}>}
 */
export async function fetchCharacters({ page = 1, name = '', status = '', gender = '' } = {}) {
  // Строим строку запроса только из непустых параметров
  const params = new URLSearchParams();
  params.set('page', page);
  if (name)   params.set('name',   name);
  if (status) params.set('status', status);
  if (gender) params.set('gender', gender);

  const url = `${BASE_URL}/character?${params.toString()}`;

  try {
    const data = await request(url);
    return data; // { info: { count, pages, next, prev }, results: [...] }
  } catch (error) {
    // API возвращает 404 когда ничего не найдено — обрабатываем мягко
    if (error.message.includes('404')) {
      return { info: { count: 0, pages: 0, next: null, prev: null }, results: [] };
    }
    throw error;
  }
}

/**
 * Получить одного персонажа по ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function fetchCharacterById(id) {
  const url = `${BASE_URL}/character/${id}`;
  return await request(url);
}
