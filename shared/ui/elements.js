// shared/ui/elements.js
export const $ = (id) => document.getElementById(id);
export const setText = (el, t) => el && (el.textContent = t);
export const show = (el) => el && el.classList.remove('hidden');
export const hide = (el) => el && el.classList.add('hidden');
export function td(text){ const el=document.createElement('td'); el.textContent=text ?? ''; return el; }
export function input(value='', attrs={}){ const el=document.createElement('input'); el.type='text'; el.value=value ?? ''; Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v)); el.style.width='100%'; return el; }
