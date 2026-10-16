import React from 'react';
import { RepairRequest, User, ProblemType } from '../types';
import { 
  PROBLEM_TYPE_LABELS, 
  STATUS_LABELS, 
  URGENCY_LABELS 
} from '../data/mockData';
import { 
  ClipboardList, 
  Clock, 
  UserCheck, 
  Wrench, 
  CheckCircle2, 
  Coins, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  repairs: RepairRequest[];
  onSelectRepair: (repair: RepairRequest) => void;
  onNavigateCreate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  repairs,
  onSelectRepair,
  onNavigateCreate
}) => {
  // Scoped repairs according to current role
  const scopedRepairs = React.useMemo(() => {
    if (currentUser.role === 'admin') {
      return repairs;
    }
    if (currentUser.role === 'teacher') {
      return repairs.filter(r => r.user_id === currentUser.id);
    }
    if (currentUser.role === 'technician') {
      return repairs.filter(r => r.assigned_to === currentUser.id);
    }
    return repairs;
  }, [repairs, currentUser]);

  const total = scopedRepairs.length;
  const pending = scopedRepairs.filter(r => r.status === 'pending').length;
  const accepted = scopedRepairs.filter(r => r.status === 'accepted').length;
  const inProgress = scopedRepairs.filter(r => r.status === 'in_progress').length;
  const completed = scopedRepairs.filter(r => r.status === 'completed').length;
  const totalCost = scopedRepairs.reduce((acc, r) => acc + (r.cost || 0), 0);

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<ProblemType, number> = {
      electrical: 0,
      aircon: 0,
      computer: 0,
      furniture: 0,
      other: 0
    };
    scopedRepairs.forEach(r => {
      counts[r.problem_type] = (counts[r.problem_type] || 0) + 1;
    });
    return counts;
  }, [scopedRepairs]);

  const recentRepairs = [...scopedRepairs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Scope Notice */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold text-blue-200 border border-blue-400/30 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ระบบปฏิบัติการงานซ่อมบำรุงโรงเรียนแบบเรียลไทม์
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            สวัสดี, {currentUser.fullname}
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
            {currentUser.role === 'admin' && 'ภาพรวมสถานะการแจ้งซ่อมและสถิติค่าใช้จ่ายทั้งหมดของโรงเรียน'}
            {currentUser.role === 'teacher' && 'ติดตามและตรวจสอบสถานะงานแจ้งซ่อมอุปกรณ์ที่คุณได้แจ้งไว้'}
            {currentUser.role === 'technician' && 'รายการงานซ่อมบำรุงที่ได้รับมอบหมายให้คุณดำเนินการซ่อม'}
          </p>
        </div>

        {currentUser.role !== 'technician' && (
          <button
            onClick={onNavigateCreate}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg transition-all text-xs shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>สร้างใบแจ้งซ่อมใหม่</span>
          </button>
        )}
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        
        {/* Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>งานทั้งหมด</span>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <div className="text-[10px] text-slate-400 mt-1">รายการในระบบ</div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700 text-xs mb-1">
            <span>รอรับเรื่อง</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{pending}</div>
          <div className="text-[10px] text-amber-700/70 mt-1">รอมอบหมายช่าง</div>
        </div>

        {/* Accepted */}
        <div className="bg-white p-4 rounded-2xl border border-cyan-200/80 shadow-xs bg-cyan-50/20">
          <div className="flex items-center justify-between text-cyan-700 text-xs mb-1">
            <span>รับเรื่องแล้ว</span>
            <UserCheck className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-cyan-600">{accepted}</div>
          <div className="text-[10px] text-cyan-700/70 mt-1">มอบหมายช่างแล้ว</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-700 text-xs mb-1">
            <span>กำลังซ่อม</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
          <div className="text-[10px] text-blue-700/70 mt-1">ช่างอยู่ระหว่างแก้ไข</div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
            <span>ซ่อมเสร็จสิ้น</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{completed}</div>
          <div className="text-[10px] text-emerald-700/70 mt-1">ปิดงานสมบูรณ์</div>
        </div>

        {/* Total Cost */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>งบค่าซ่อมรวม</span>
            <Coins className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ฿{totalCost.toLocaleString('th-TH')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">ยอดค่าใช้จ่ายปิดงาน</div>
        </div>

      </div>

      {/* Middle Section: Breakdown Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>สถิติตามประเภทปัญหา</span>
            </h3>
            <span className="text-[11px] text-slate-400">สัดส่วนงานแจ้งซ่อม</span>
          </div>

          <div className="space-y-3.5">
            {(Object.keys(PROBLEM_TYPE_LABELS) as ProblemType[]).map((type) => {
              const count = categoryCounts[type] || 0;
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              
              const barColors: Record<ProblemType, string> = {
                electrical: 'bg-amber-500',
                aircon: 'bg-cyan-500',
                computer: 'bg-blue-600',
                furniture: 'bg-indigo-500',
                other: 'bg-slate-400'
              };

              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{PROBLEM_TYPE_LABELS[type]}</span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {count} รายการ ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColors[type]}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>ปัญหาเร่งด่วนที่ต้องเฝ้าระวัง:</span>
            </div>
            <span className="font-bold text-rose-600 text-xs">
              {scopedRepairs.filter(r => r.urgency === 'high' && r.status !== 'completed').length} รายการ
            </span>
          </div>
        </div>

        {/* Recent Work Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>รายการแจ้งซ่อมล่าสุด</span>
              </h3>
              <button 
                onClick={() => {}} 
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="py-2 font-medium">เลขที่</th>
                    <th className="py-2 font-medium">สถานที่</th>
                    <th className="py-2 font-medium">ประเภท</th>
                    <th className="py-2 font-medium">สถานะ</th>
                    <th className="py-2 font-medium text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRepairs.map((r) => {
                    const statusInfo = STATUS_LABELS[r.status];
                    return (
                      <tr 
                        key={r.id} 
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => onSelectRepair(r)}
                      >
                        <td className="py-2.5 font-mono font-semibold text-blue-600">
                          {r.request_no}
                        </td>
                        <td className="py-2.5">
                          <div className="font-medium text-slate-800">{r.building}</div>
                          <div className="text-[11px] text-slate-400">{r.room}</div>
                        </td>
                        <td className="py-2.5 text-slate-600">
                          {PROBLEM_TYPE_LABELS[r.problem_type]}
                        </td>
                        <td className="py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRepair(r);
                            }}
                            className="p-1 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {recentRepairs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        ยังไม่มีรายการแจ้งซ่อมสำหรับบทบาทนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>แสดง 5 รายการล่าสุดจากทั้งหมด {scopedRepairs.length} รายการ</span>
            <span className="text-slate-500">คลิกที่แถวเพื่อเปิดหน้ารายละเอียด</span>
          </div>
        </div>

      </div>

    </div>
  );
};
