import React from 'react';
import { LogOut } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { UserProfile } from '../../types/auth';

interface AccountProfileCardProps {
  user?: UserProfile | null;
  onLogout?: () => void;
}

export const AccountProfileCard: React.FC<AccountProfileCardProps> = ({ user, onLogout }) => {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
              alt={user?.name || 'User'}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30 bg-slate-100 dark:bg-slate-800"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                {user?.name || 'Người dùng'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                {user?.role || 'User'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
              {user?.email || 'Chưa liên kết email'}
            </p>
          </div>
        </div>

        {onLogout && (
          <Button
            variant="danger"
            size="sm"
            onClick={onLogout}
            className="font-bold text-xs shrink-0 self-start sm:self-auto gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </Button>
        )}
      </div>
    </Card>
  );
};
