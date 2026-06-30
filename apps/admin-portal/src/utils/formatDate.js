export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-ET', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
