import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getNextOccurrence } from './recurrence';

// 숫자 id로 변환 (Local Notifications는 32bit 정수 id가 필요함)
function notificationIdFor(meetupId) {
  const str = String(meetupId);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.requestPermissions();
}

// 참여한 모임 시작 30분 전에 알림 예약 (네이티브 앱에서만 동작)
export async function scheduleMeetupReminder(meetup) {
  if (!Capacitor.isNativePlatform()) return;
  const occurrence = getNextOccurrence(meetup);
  if (!occurrence) return;

  const fireAt = new Date(occurrence.getTime() - 30 * 60 * 1000);
  if (fireAt <= new Date()) return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notificationIdFor(meetup.id),
        title: '까치 · 모임이 곧 시작해요',
        body: `${meetup.title} 모임이 30분 뒤 시작돼요. 장소를 확인해보세요!`,
        schedule: { at: fireAt },
      },
    ],
  });
}

export async function cancelMeetupReminder(meetupId) {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: [{ id: notificationIdFor(meetupId) }] });
}
