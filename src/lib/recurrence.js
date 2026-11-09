export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export const FREQUENCY_OPTIONS = [
  { id: 'weekly', label: '매주' },
  { id: 'biweekly', label: '격주' },
  { id: 'monthly', label: '매월' },
];

export const END_TYPE_OPTIONS = [
  { id: 'never', label: '계속 반복' },
  { id: 'count', label: '횟수 지정' },
  { id: 'date', label: '종료일 지정' },
];

const frequencyLabel = (id) => FREQUENCY_OPTIONS.find((f) => f.id === id)?.label || id;

export function formatRecurrence(recurrence) {
  if (!recurrence?.enabled) return null;
  const freq = frequencyLabel(recurrence.frequency);
  if (recurrence.frequency === 'monthly') {
    return `${freq} (매달 같은 날짜)`;
  }
  const days = (recurrence.weekdays || []).map((d) => WEEKDAY_LABELS[d]).join('·');
  return days ? `${freq} ${days}요일` : freq;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const weeksBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / (7 * DAY_MS));

// 정기모임의 다음 발생일을 계산 (오늘 이후로 가장 가까운 회차, 종료 조건 넘으면 null)
export function getNextOccurrence(meetup) {
  const start = new Date(meetup.startAt);
  if (!meetup.recurrence?.enabled) return start;

  const { frequency, weekdays = [], endType, endCount = 1, endDate } = meetup.recurrence;
  const now = new Date();
  const limit = endType === 'date' && endDate ? new Date(`${endDate}T23:59:59`) : null;

  if (frequency === 'monthly') {
    let occurrence = 1;
    let candidate = new Date(start);
    while (candidate < now) {
      candidate.setMonth(candidate.getMonth() + 1);
      occurrence += 1;
    }
    if (endType === 'count' && occurrence > endCount) return null;
    if (limit && candidate > limit) return null;
    return candidate;
  }

  // weekly / biweekly
  const validDays = weekdays.length ? weekdays : [start.getDay()];
  const stepWeeks = frequency === 'biweekly' ? 2 : 1;

  let occurrence = 0;
  const startDay = startOfDay(start);
  const maxCursor = new Date(startDay.getTime() + 400 * DAY_MS);
  for (let cursor = startDay; cursor < maxCursor; cursor = new Date(cursor.getTime() + DAY_MS)) {
    if (!validDays.includes(cursor.getDay())) continue;
    const weeksSinceStart = weeksBetween(start, cursor);
    if (weeksSinceStart % stepWeeks !== 0) continue;

    occurrence += 1;
    if (endType === 'count' && occurrence > endCount) return null;
    if (limit && cursor > limit) return null;
    if (cursor >= startOfDay(now)) return cursor;
  }
  return null;
}
