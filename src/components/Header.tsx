import React from 'react';
import { User, UserRole } from '../types';
import { ROLE_LABELS } from '../data/mockData';
import { 
  Wrench, 
  ShieldAlert, 
  BookOpen, 
  Code2, 
  UserCheck, 
  Users, 
  LogOut,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  activeTab: 'app' | 'ooad' | 'codebase';
  onChangeTab: (tab: 'app' | 'ooad' | 'codebase') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  onChangeTab
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Name */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-inner flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">SchoolFix</span>
                <span className="text-[10px] uppercase font-semibold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                  OOAD + OOP
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ระบบแจ้งซ่อมและบริหารงานบำรุงรักษาโรงเรียน
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => onChangeTab('app')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'app'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>ระบบแจ้งซ่อม (App)</span>
            </button>

            <button
              onClick={() => onChangeTab('ooad')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ooad'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ผังวิเคราะห์ OOAD</span>
            </button>

            <button
              onClick={() => onChangeTab('codebase')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'codebase'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>ซอร์สโค้ด Flask &amp; Tests</span>
            </button>
          </nav>

          {/* Right: Role Switcher Simulator */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-400/40">
                  {currentUser.fullname.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-medium text-slate-200 line-clamp-1">{currentUser.fullname}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                      currentUser.role === 'admin' ? 'bg-rose-400' : currentUser.role === 'technician' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    {ROLE_LABELS[currentUser.role].label}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </div>

              {/* Role Dropdown */}
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                  สลับบทบาทเพื่อทดสอบสิทธิ์ (RBAC)
                </div>
                <div className="mt-1 space-y-1">
                  {allUsers.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => onSelectUser(u)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="truncate">{u.fullname}</div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {u.department}
                          </div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ml-2 shrink-0 ${
                          u.role === 'admin' ? 'bg-rose-500/20 text-rose-300' : u.role === 'technician' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {u.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
