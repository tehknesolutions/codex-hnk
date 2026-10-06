export const hnkTreeLevels = Object.freeze([
  Object.freeze({ id: 'keter', label: 'KETHER', index: '01', dayRange: '001—036', state: 'acquired' }),
  Object.freeze({ id: 'chokhmah', label: 'CHOKHMAH', index: '02', dayRange: '037—072', state: 'active' }),
  Object.freeze({ id: 'binah', label: 'BINAH', index: '03', dayRange: '073+', state: 'dormant' }),
]);

const executableRanges = Object.freeze({
  keter: Object.freeze([1, 36]),
  chokhmah: Object.freeze([37, 72]),
});

export function getExecutableDays(levelId) {
  const range = executableRanges[levelId];
  if (!range) return Object.freeze([]);
  const [start, end] = range;
  return Object.freeze(Array.from({ length: end - start + 1 }, (_, offset) => {
    const day = String(start + offset).padStart(3, '0');
    return Object.freeze({ day, href: `/day-${day}` });
  }));
}

export const hnkTreeNodes = Object.freeze(hnkTreeLevels.map((level) => Object.freeze({
  id: level.id,
  levelId: level.id,
  label: level.label,
  index: level.index,
  state: level.state,
  href: getExecutableDays(level.id)[0]?.href,
})));
