import React, { useState } from 'react';
import { CheckCircle2, Sparkles, BarChart2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AppLogo } from '../components/ui/AppLogo';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';

import { useLanguage } from '../contexts/LanguageContext';
import { FlagIcon } from '../components/ui/FlagIcon';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithPassword, signUpWithPassword, loginWithDemo, isLoading } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVi = language === 'vi';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ type: 'error', title: isVi ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill all required fields' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        await loginWithPassword(email, password);
        toast({ type: 'success', title: isVi ? 'Đăng nhập thành công!' : 'Logged in successfully!' });
      } else {
        await signUpWithPassword(email, password, name);
        toast({
          type: 'success',
          title: isVi ? 'Đăng ký thành công!' : 'Account created successfully!',
          description: isVi ? 'Chào mừng bạn đến với DailyIncome Pro.' : 'Welcome to DailyIncome Pro.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isVi ? 'Xác thực không thành công' : 'Authentication failed');
      toast({ type: 'error', title: isVi ? 'Lỗi xác thực' : 'Authentication error', description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    try {
      await loginWithGoogle();
    } catch {
      toast({
        type: 'error',
        title: isVi ? 'Chưa bật Google Provider' : 'Google Provider Not Enabled',
        description: isVi
          ? 'Vui lòng dùng Email & Mật khẩu bên dưới hoặc vào Supabase Dashboard -> Auth -> Providers để bật Google.'
          : 'Please use Email & Password below or enable Google provider in Supabase Dashboard.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex items-center justify-center px-4 pt-16 pb-8 sm:p-6 md:p-8 text-slate-900 dark:text-slate-100 relative overflow-y-auto">
      {/* Top right language switch */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs cursor-pointer"
        >
          <FlagIcon country={isVi ? 'vn' : 'en'} className="w-4 h-3" />
          <span>{isVi ? 'VN' : 'EN'}</span>
        </button>
      </div>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Left Branding */}
        <div className="p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 text-white flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-indigo-800/40">
          <div className="relative z-10 space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3">
              <AppLogo size="md" />
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight">DailyIncome</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Pro
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-white">
                {isVi ? 'Quản lý Thu nhập Cá nhân Hằng ngày' : 'Daily Personal Income Management'}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
                {isVi
                  ? 'Đồng bộ dữ liệu thời gian thực trên PostgreSQL Cloud và kiểm soát mục tiêu tiền mặt chính xác.'
                  : 'Real-time PostgreSQL Cloud data synchronization and precise cash target monitoring.'}
              </p>
            </div>

            <div className="space-y-2.5 pt-1 sm:pt-2">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-indigo-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isVi ? 'Theo dõi mục tiêu tiền mặt tự động' : 'Automatic daily cash target tracking'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-indigo-100">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isVi ? 'Tự động tính lương & phân loại nguồn thu' : 'Automated wage calculation & income breakdown'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-indigo-100">
                <BarChart2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{isVi ? 'Báo cáo chu kỳ tháng & xuất dữ liệu CSV/JSON' : 'Monthly cycle analytics & CSV/JSON export'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Auth Form */}
        <div className="p-6 sm:p-10 flex flex-col justify-center dark:bg-slate-900/90">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {authMode === 'login' ? (isVi ? 'Đăng nhập tài khoản' : 'Sign In') : (isVi ? 'Tạo tài khoản mới' : 'Create Account')}
            </h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`px-3 py-1 rounded-lg transition-all ${authMode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
              >
                {isVi ? 'Đăng nhập' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`px-3 py-1 rounded-lg transition-all ${authMode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
              >
                {isVi ? 'Đăng ký' : 'Sign Up'}
              </button>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <Input
                label={isVi ? 'Họ và tên' : 'Full Name'}
                placeholder={isVi ? 'VD: Nguyễn Văn A' : 'e.g. John Doe'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label={isVi ? 'Mật khẩu' : 'Password'}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting || isLoading}
              className="w-full justify-center font-bold text-sm shadow-md shadow-indigo-500/20"
            >
              <span>{authMode === 'login' ? (isVi ? 'Đăng nhập' : 'Sign In') : (isVi ? 'Tạo tài khoản' : 'Create Account')}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Centered Divider with perfectly balanced vertical margin */}
          <div className="relative flex items-center justify-center my-4 sm:my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">
                {isVi ? 'Hoặc' : 'Or'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isVi ? 'Đăng nhập với Google' : 'Sign in with Google'}</span>
            </button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={loginWithDemo}
              disabled={isLoading}
              className="w-full text-xs font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 justify-center"
            >
              {isVi ? 'Vào trực tiếp với tài khoản Demo' : 'Continue with Demo Account'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
