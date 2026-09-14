-- ============================================================================
-- 1. LỆNH LẤY RA USER ID TRONG SUPABASE SQL EDITOR
-- ============================================================================
SELECT 
    id AS user_id, 
    email, 
    created_at, 
    raw_user_meta_data->>'full_name' AS full_name 
FROM auth.users;

-- ============================================================================
-- 2. SCRIPT TỰ ĐỘNG THÊM DỮ LIỆU KỲ THÁNG 09/2026 VÀO SUPABASE (LIVE DB)
-- (Tự động lấy User đầu tiên hoặc bạn thay ID vào biến v_user_id)
-- ============================================================================
DO $$
DECLARE
    -- Tự động lấy ID của user đầu tiên trong bảng auth.users
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Chưa có User nào trong bảng auth.users. Vui lòng đăng nhập hoặc tạo tài khoản trước!';
    END IF;

    -- Xóa các bản ghi cũ của kỳ 09/2026 (nếu có) để tránh trùng lặp
    DELETE FROM income_records 
    WHERE user_id = v_user_id 
      AND date BETWEEN '2026-08-26' AND '2026-09-25';

    -- Thêm 31 ngày dữ liệu kỳ Tháng 09/2026
    INSERT INTO income_records (user_id, date, cash, base_salary, tips, bonus, status, is_custom_status, note)
    VALUES
        (v_user_id, '2026-08-26', 194980, 204000, 0, 0, 'success', true, ''),
        (v_user_id, '2026-08-27', 345290, 204000, 0, 0, 'success', true, ''),
        (v_user_id, '2026-08-28', 61040, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-08-29', 7240, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-08-30', 7240, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-08-31', 7240, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-01', 7240, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-02', 7240, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-03', 190430, 204000, 0, 0, 'success', true, ''),
        (v_user_id, '2026-09-04', 247850, 204000, 0, 272500, 'success', true, ''),
        (v_user_id, '2026-09-05', 237610, 204000, 79000, 65080, 'success', true, ''),
        (v_user_id, '2026-09-06', 0, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-07', 0, 0, 44000, 0, 'failed', true, ''),
        (v_user_id, '2026-09-08', 0, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-09', 0, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-10', 0, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-11', 0, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-12', 0, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-13', 0, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-14', 0, 0, 0, 0, 'failed', true, ''),
        (v_user_id, '2026-09-15', 0, 0, 0, 0, 'processing', true, ''),
        (v_user_id, '2026-09-16', 0, 0, 0, 0, 'not_started', true, ''),
        (v_user_id, '2026-09-17', 0, 0, 0, 0, 'not_started', true, ''),
        (v_user_id, '2026-09-18', 0, 0, 0, 0, 'not_started', true, ''),
        (v_user_id, '2026-09-19', 0, 0, 0, 0, 'not_started', true, ''),
        (v_user_id, '2026-09-20', 0, 0, 0, 0, 'not_started', true, ''),
        (v_user_id, '2026-09-21', 0, 0, 0, 0, 'not_started', true, ''),
        (v_user_id, '2026-09-22', 0, 0, 0, 0, 'not_started', true, ''),
        (v_user_id, '2026-09-23', 0, 0, 0, 0, 'not_started', true, ''),
        (v_user_id, '2026-09-24', 0, 0, 0, 0, 'not_started', true, ''),
        (v_user_id, '2026-09-25', 0, 0, 0, 0, 'not_started', true, '');

    RAISE NOTICE 'Đã thêm thành công 31 bản ghi kỳ 09/2026 cho User ID: %', v_user_id;
END $$;
