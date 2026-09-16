// @ts-nocheck
// Supabase Edge Function: Gửi Web Push Notification cho toàn bộ người dùng đã đăng ký
// Chạy trên Deno runtime của Supabase

import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cấu hình VAPID keys (Lấy từ Supabase Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT)
const VAPID_PUBLIC_KEY =
  Deno.env.get('VAPID_PUBLIC_KEY') ||
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@dailyincome.app';

if (VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await req.json().catch(() => ({}));
    const title = body.title || 'DailyIncome';
    const message = body.body || 'Bạn có lời nhắc thu nhập mới từ hệ thống!';
    const actionTab = body.actionTab || 'dashboard';

    // 1. Lấy danh sách thiết bị đã đăng ký từ bảng push_subscriptions
    const { data: subscriptions, error: dbError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (dbError) throw dbError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Không có thiết bị nào đăng ký push.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/favicon.svg',
      actionTab,
      url: '/',
    });

    // 2. Gửi Web Push đến từng thiết bị
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: { endpoint: string; p256dh: string; auth: string }) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };
        return webpush.sendNotification(pushSubscription, payload);
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        total: subscriptions.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
