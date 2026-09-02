// Convierte un título en una "ruta" simple y legible: sin tildes, minúsculas,
// espacios y símbolos convertidos en guiones. Ej. "Leybrak POS" -> "leybrak-pos".
const slugify = (text) =>
  text
    .toString()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140) || 'producto';

module.exports = { slugify };
