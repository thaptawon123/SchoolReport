import React from 'react';
import { User } from '../types';
import { 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  Users, 
  FileSpreadsheet,
  ShieldCheck,
  Wrench,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  currentView: 'dashboard' | 'list' | 'create' | 'users';
  onNavigate: (view: 'dashboard' | 'list' | 'create' | 'users') => void;
  onExportCsv: () => void;
  pendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onExportCsv,
  pendingCount
}) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 shadow-sm hidden md:flex">
      <div className="space-y-6">
        
        {/* User Role Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {currentUser.role === 'admin' && <ShieldCheck className="w-5 h-5" />}
            {currentUser.role === 'technician' && <Wrench className="w-5 h-5" />}
            {currentUser.role === 'teacher' && <GraduationCap className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-800 truncate">{currentUser.fullname}</h4>
            <p className="text-[11px] text-slate-500 truncate">{currentUser.department}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            เมนูหลัก
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              currentView === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>แดชบอร์ดภาพรวม</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('list')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              currentView === 'list'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ClipboardList className="w-4 h-4 text-slate-500" />
              <span>รายการแจ้งซ่อม</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Teacher and Admin can create repair */}
          {currentUser.role !== 'technician' && (
            <button
              onClick={() => onNavigate('create')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                currentView === 'create'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>แจ้งซ่อมอุปกรณ์ใหม่</span>
              </div>
            </button>
          )}

          {/* Admin Menu */}
          {currentUser.role === 'admin' && (
            <>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-4 mb-2">
                ผู้ดูแลระบบ (Admin)
              </div>
              <button
                onClick={() => onNavigate('users')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  currentView === 'users'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-rose-500" />
                  <span>จัดการผู้ใช้งานระบบ</span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-slate-200/80 space-y-2">
        <button
          onClick={onExportCsv}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>ส่งออกรายงาน CSV</span>
        </button>

        <div className="text-center text-[10px] text-slate-400 pt-2">
          SchoolFix v1.0 • OOAD &amp; OOP Edition
        </div>
      </div>
    </aside>
  );
};
