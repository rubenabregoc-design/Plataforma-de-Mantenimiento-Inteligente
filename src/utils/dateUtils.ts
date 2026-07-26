export function formatFriendlyDate(d: string) {
  if (!d) return '---';
  return new Date(d).toLocaleDateString('es-PA', { day: '2-digit', month: 'short' }).toUpperCase();
}

export function formatTime12h(dateStr?: string) {
  if (!dateStr) return '---';
  try {
    if (dateStr.includes(':') && !dateStr.includes('T')) {
      const [h, m] = dateStr.split(':');
      const hh = parseInt(h);
      const suffix = hh >= 12 ? 'PM' : 'AM';
      const h12 = hh % 12 || 12;
      return `${h12}:${m} ${suffix}`;
    }
    return new Date(dateStr).toLocaleTimeString('es-PA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) { return '---'; }
}
