import React, { useState, useMemo } from 'react';
import { RepairRequest, User, RequestStatus, ProblemType, UrgencyLevel } from '../types';
import { 
  PROBLEM_TYPE_LABELS, 
  STATUS_LABELS, 
  URGENCY_LABELS 
} from '../data/mockData';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  FileSpreadsheet, 
  Eye, 
  Printer, 
  PlusCircle,
  Inbox,
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2
} from 'lucide-react';

interface RepairsListProps {
  currentUser: User;
  repairs: RepairRequest[];
  onSelectRepair: (repair: RepairRequest) => void;
  onPrintSlip: (repair: RepairRequest) => void;
  onNavigateCreate: () => void;
  onExportCsv: () => void;
}

export const RepairsList: React.FC<RepairsListProps> = ({
  currentUser,
  repairs,
  onSelectRepair,
  onPrintSlip,
  onNavigateCreate,
  onExportCsv
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  // Scoped repairs according to current role
  const scopedRepairs = useMemo(() => {
    if (currentUser.role === 'admin') return repairs;
    if (currentUser.role === 'teacher') return repairs.filter(r => r.user_id === currentUser.id);
    if (currentUser.role === 'technician') return repairs.filter(r => r.assigned_to === currentUser.id);
    return repairs;
  }, [repairs, currentUser]);

  // Filtered repairs
  const filteredRepairs = useMemo(() => {
    return scopedRepairs.filter((req) => {
      // Search
      const matchSearch =
        searchTerm === '' ||
        req.request_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reporter_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Status
      const matchStatus = statusFilter === 'all' || req.status === statusFilter;

      // Type
      const matchType = typeFilter === 'all' || req.problem_type === typeFilter;

      // Urgency
      const matchUrgency = urgencyFilter === 'all' || req.urgency === urgencyFilter;

      return matchSearch && matchStatus && matchType && matchUrgency;
    });
  }, [scopedRepairs, searchTerm, statusFilter, typeFilter, urgencyFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setUrgencyFilter('all');
  };

  return (
    <div className="space-y-5">
      
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            รายการใบแจ้งซ่อมบำรุง
          </h2>
          <p className="text-xs text-slate-500">
            {currentUser.role === 'admin' && 'จัดการและติดตามงานแจ้งซ่อมทั้งหมดในระบบ'}
            {currentUser.role === 'teacher' && 'ตรวจสอบและติดตามสถานะงานที่คุณแจ้งซ่อม'}
            {currentUser.role === 'technician' && 'งานซ่อมบำรุงที่ได้รับมอบหมายให้คุณดำเนินการ'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {currentUser.role !== 'technician' && (
            <button
              onClick={onNavigateCreate}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>แจ้งซ่อมใหม่</span>
            </button>
          )}

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Search Input (5 cols) */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่, สถานที่, อาการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
            />
          </div>

          {/* Status Dropdown (2 cols) */}
          <div className="lg:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="pending">รอรับเรื่อง (Pending)</option>
              <option value="accepted">รับเรื่องแล้ว (Accepted)</option>
              <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
              <option value="completed">ซ่อมเสร็จสิ้น (Completed)</option>
            </select>
          </div>

          {/* Problem Type Dropdown (3 cols) */}
          <div className="lg:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="all">ประเภทปัญหาทั้งหมด</option>
              {Object.entries(PROBLEM_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          {/* Urgency Dropdown & Reset (2 cols) */}
          <div className="lg:col-span-2 flex items-center gap-1.5">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="all">ความเร่งด่วน</option>
              <option value="high">เร่งด่วน (High)</option>
              <option value="medium">ปานกลาง (Medium)</option>
              <option value="low">ปกติ (Low)</option>
            </select>

            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || urgencyFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="ล้างตัวกรอง"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">เลขที่ใบแจ้ง</th>
                <th className="py-3 px-3 font-semibold">วันที่แจ้ง</th>
                <th className="py-3 px-3 font-semibold">ผู้แจ้งซ่อม</th>
                <th className="py-3 px-3 font-semibold">สถานที่ / ห้อง</th>
                <th className="py-3 px-3 font-semibold">ประเภทปัญหา</th>
                <th className="py-3 px-3 font-semibold">ความเร่งด่วน</th>
                <th className="py-3 px-3 font-semibold">สถานะ</th>
                <th className="py-3 px-3 font-semibold">ช่างผู้รับผิดชอบ</th>
                <th className="py-3 px-4 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRepairs.map((req) => {
                const statusInfo = STATUS_LABELS[req.status];
                const urgencyInfo = URGENCY_LABELS[req.urgency];

                return (
                  <tr 
                    key={req.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectRepair(req)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {req.request_no}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {req.created_at.split(' ')[0]}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-800 whitespace-nowrap">{req.reporter_name}</div>
                      <div className="text-[10px] text-slate-400 whitespace-nowrap">{req.reporter_department}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{req.building}</div>
                      <div className="text-[11px] text-slate-500">{req.room}</div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] border border-slate-200">
                        {PROBLEM_TYPE_LABELS[req.problem_type]}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${urgencyInfo.badge}`}>
                        {urgencyInfo.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                        {req.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        {req.status === 'accepted' && <UserCheck className="w-3 h-3 text-cyan-600" />}
                        {req.status === 'in_progress' && <Wrench className="w-3 h-3 text-blue-600 animate-spin" />}
                        {req.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {statusInfo.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {req.technician_name ? (
                        <div>
                          <div className="font-medium text-slate-800 text-xs flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-amber-500" />
                            <span>{req.technician_name}</span>
                          </div>
                          {req.due_date && (
                            <div className="text-[10px] text-slate-400">ครบกำหนด: {req.due_date}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">ยังไม่ได้มอบหมาย</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRepair(req);
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                          title="ดูรายละเอียดใบแจ้งซ่อม"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPrintSlip(req);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="พิมพ์ใบแจ้งซ่อม A4"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRepairs.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-700">ไม่พบรายการใบแจ้งซ่อม</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        ไม่มีข้อมูลที่ตรงกับตัวกรองที่คุณกำหนด ลองปรับเปลี่ยนคำค้นหาหรือล้างตัวกรอง
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 text-xs text-blue-600 hover:underline font-medium"
                      >
                        ล้างตัวกรองทั้งหมด
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-2">
          <span>แสดง {filteredRepairs.length} รายการ จากทั้งหมด {scopedRepairs.length} รายการ</span>
          <span>สิทธิ์เข้าถึง: {currentUser.role === 'admin' ? 'ผู้ดูแล (ดูได้ทั้งหมด)' : currentUser.role === 'technician' ? 'ช่าง (ดูเฉพาะงานตนเอง)' : 'ผู้แจ้ง (ดูเฉพาะงานตนเอง)'}</span>
        </div>
      </div>

    </div>
  );
};
