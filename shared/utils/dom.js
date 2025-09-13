// utils/dom.js

export const show = el => el && el.classList.remove('hidden');
export const hide = el => el && el.classList.add('hidden');
export const setText = (el, text) => { if (el) el.textContent = text; };
