import { supabase, isSupabaseConfigured } from './supabaseClient';

// Public VAPID Key mặc định cho Web Push (có thể cấu hình qua file .env với VITE_VAPID_PUBLIC_KEY)
const DEFAULT_VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

/**
 * Chuyển đổi chuỗi VAPID key định dạng base64url sang ArrayBufferView
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface WebPushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Kiểm tra xem trình duyệt hiện tại có hỗ trợ Web Push & Service Worker không
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Lấy Push Subscription hiện tại nếu đã đăng ký
 */
export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.warn('[WebPush] Lỗi khi kiểm tra subscription:', error);
    return null;
  }
}

/**
 * Đăng ký nhận thông báo Web Push trên thiết bị và đồng bộ lên Supabase
 */
export async function subscribeToWebPush(
  userId: string = 'default_user'
): Promise<{ success: boolean; subscription?: PushSubscription; error?: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, error: 'Trình duyệt không hỗ trợ Web Push Notifications.' };
  }

  try {
    // 1. Yêu cầu quyền thông báo từ người dùng
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Người dùng đã từ chối cấp quyền thông báo.' };
    }

    // 2. Chờ Service Worker sẵn sàng
    const registration = await navigator.serviceWorker.ready;

    // 3. Đăng ký Push Manager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    // 4. Lưu / Cập nhật vào Supabase nếu đã kết nối
    const subJson = subscription.toJSON() as WebPushSubscriptionData;
    if (subJson && subJson.endpoint) {
      await saveSubscriptionToDatabase(userId, subJson);
    }

    // 5. Lưu trạng thái cục bộ
    localStorage.setItem('psm_web_push_enabled', 'true');

    return { success: true, subscription };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Không thể đăng ký Web Push';
    console.error('[WebPush] Lỗi đăng ký push:', err);
    return { success: false, error: message };
  }
}

/**
 * Hủy đăng ký nhận thông báo Web Push
 */
export async function unsubscribeFromWebPush(
  _userId: string = 'default_user'
): Promise<{ success: boolean; error?: string }> {
  if (!isPushNotificationSupported()) return { success: true };

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Xóa khỏi Supabase
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
      }
    }

    localStorage.removeItem('psm_web_push_enabled');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi hủy đăng ký Push';
    return { success: false, error: message };
  }
}

/**
 * Lưu thông tin Push Subscription vào Supabase table `push_subscriptions`
 */
async function saveSubscriptionToDatabase(
  userId: string,
  subData: WebPushSubscriptionData
): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    // Lưu tạm vào localStorage nếu chưa cấu hình Supabase
    localStorage.setItem(`psm_push_sub_${userId}`, JSON.stringify(subData));
    return;
  }

  try {
    const isValidUUID = (id: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    let targetUserId = userId;
    if (!isValidUUID(targetUserId)) {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        targetUserId = data.user.id;
      } else {
        localStorage.setItem(`psm_push_sub_${userId}`, JSON.stringify(subData));
        return;
      }
    }

    const p256dh = subData.keys?.p256dh || '';
    const auth = subData.keys?.auth || '';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: targetUserId,
        endpoint: subData.endpoint,
        p256dh: p256dh,
        auth: auth,
        user_agent: userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    );

    if (error) {
      console.warn('[WebPush] Lỗi lưu subscription vào Supabase:', error.message);
    }
  } catch (err) {
    console.warn('[WebPush] Không thể đồng bộ subscription:', err);
  }
}

/**
 * Gửi thông báo test qua Service Worker ngay lập tức (hoạt động để kiểm tra hiển thị PWA)
 */
export async function sendTestLocalNotification(
  title = '🔔 Kiểm tra thông báo DailyIncome',
  body = 'Thông báo hệ thống đang hoạt động tốt trên thiết bị của bạn!'
): Promise<boolean> {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'daily-income-test-push',
        data: { url: '/' },
      } as NotificationOptions);
      return true;
    } else {
      new Notification(title, { body, icon: '/favicon.svg' });
      return true;
    }
  } catch (err) {
    console.error('[WebPush] Lỗi gửi test notification:', err);
    return false;
  }
}
