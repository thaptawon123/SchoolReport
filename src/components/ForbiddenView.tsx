import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface ForbiddenViewProps {
  onBack: () => void;
  message?: string;
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({ onBack, message }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200 shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <div className="text-3xl font-extrabold text-slate-900 mb-2 font-mono">
        403 FORBIDDEN
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-2">
        ไม่มีสิทธิ์เข้าถึงข้อมูลใบแจ้งซ่อมนี้
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-6">
        {message || 'ระบบตรวจพบว่าบัญชีของคุณไม่มีสิทธิ์ในการดูหรือแก้ไขข้อมูลส่วนบุคคลของผู้อื่น เป็นไปตามหลักการรักษาความปลอดภัยของระบบ SchoolFix'}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>กลับสู่หน้ารายการงานของคุณ</span>
        </button>
      </div>
    </div>
  );
};
