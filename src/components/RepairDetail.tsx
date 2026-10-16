import React, { useState } from 'react';
import { RepairRequest, User, UserRole } from '../types';
import { 
  PROBLEM_TYPE_LABELS, 
  STATUS_LABELS, 
  URGENCY_LABELS 
} from '../data/mockData';
import { 
  ArrowLeft, 
  Printer, 
  UserPlus, 
  Play, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Send, 
  Coins, 
  Calendar, 
  MapPin, 
  AlertCircle,
  FileCheck2,
  Image as ImageIcon,
  CheckCircle2,
  History,
  ShieldCheck,
  User as UserIcon,
  Wrench,
  X,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RepairDetailProps {
  repair: RepairRequest;
  currentUser: User;
  technicians: User[];
  onBack: () => void;
  onPrintSlip: (repair: RepairRequest) => void;
  onAssignTechnician: (repairId: number, technicianId: number, dueDate: string, remark: string) => void;
  onStartRepair: (repairId: number, remark: string) => void;
  onCompleteRepair: (repairId: number, cost: number, result: string, afterImageUrl?: string, remark?: string) => void;
  onAddComment: (repairId: number, commentText: string) => void;
}

export const RepairDetail: React.FC<RepairDetailProps> = ({
  repair,
  currentUser,
  technicians,
  onBack,
  onPrintSlip,
  onAssignTechnician,
  onStartRepair,
  onCompleteRepair,
  onAddComment
}) => {
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState<number>(technicians[0]?.id || 4);
  const [assignDueDate, setAssignDueDate] = useState<string>('');
  const [assignRemark, setAssignRemark] = useState('');

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeCost, setCompleteCost] = useState<number>(0);
  const [completeResult, setCompleteResult] = useState('');
  const [completeRemark, setCompleteRemark] = useState('');
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);

  // Comment state
  const [newComment, setNewComment] = useState('');

  const statusInfo = STATUS_LABELS[repair.status];
  const urgencyInfo = URGENCY_LABELS[repair.urgency];

  // Permissions
  const canAssign = currentUser.role === 'admin' && (repair.status === 'pending' || repair.status === 'accepted');
  const canStart = (currentUser.role === 'admin' || (currentUser.role === 'technician' && repair.assigned_to === currentUser.id)) && repair.status === 'accepted';
  const canComplete = (currentUser.role === 'admin' || (currentUser.role === 'technician' && repair.assigned_to === currentUser.id)) && repair.status === 'in_progress';

  const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    onAssignTechnician(repair.id, selectedTechId, assignDueDate, assignRemark);
    setShowAssignModal(false);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeResult.trim()) {
      alert('กรุณากรอกรายละเอียดผลการซ่อม');
      return;
    }
    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    onCompleteRepair(repair.id, Number(completeCost) || 0, completeResult, afterImagePreview || undefined, completeRemark);
    setShowCompleteModal(false);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(repair.id, newComment.trim());
    setNewComment('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="ย้อนกลับไปหน้ารายการ"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-lg font-bold text-slate-900">{repair.request_no}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                {statusInfo.label}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${urgencyInfo.badge}`}>
                {urgencyInfo.label}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              แจ้งซ่อมเมื่อ: {repair.created_at} โดย <strong className="text-slate-700">{repair.reporter_name}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          
          <button
            onClick={() => onPrintSlip(repair)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>พิมพ์ใบแจ้งซ่อม A4</span>
          </button>

          {/* Admin Assign Button */}
          {canAssign && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{repair.assigned_to ? 'เปลี่ยนช่างผู้รับผิดชอบ' : 'มอบหมายงานให้ช่าง'}</span>
            </button>
          )}

          {/* Technician Start Work Button */}
          {canStart && (
            <button
              onClick={() => onStartRepair(repair.id, 'ช่างยืนยันรับงานและเริ่มดำเนินการซ่อม')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>เริ่มดำเนินการซ่อม</span>
            </button>
          )}

          {/* Technician Complete Work Button */}
          {canComplete && (
            <button
              onClick={() => setShowCompleteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>บันทึกผลการซ่อมและปิดงาน</span>
            </button>
          )}

        </div>
      </div>

      {/* Main Grid: Details & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Problem Details, Resolution, Photos, Comments (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Problem Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>ข้อมูลและรายละเอียดอาการเสีย</span>
              </h3>
              <span className="text-xs text-slate-400">
                ประเภท: <strong className="text-slate-700">{PROBLEM_TYPE_LABELS[repair.problem_type]}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">อาคาร / สถานที่</span>
                <span className="font-semibold text-slate-800 text-sm">{repair.building}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">ห้อง / จุดติดตั้ง</span>
                <span className="font-semibold text-slate-800 text-sm">{repair.room}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                รายละเอียดปัญหาที่ระบุ:
              </span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                {repair.description}
              </div>
            </div>

            {/* Photos Gallery (Before & After) */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 block mb-2.5 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>ภาพถ่ายหลักฐานประกอบงานซ่อม (Before &amp; After)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <div className="text-[11px] font-semibold text-amber-700 mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>ภาพก่อนซ่อม (Before)</span>
                  </div>
                  {repair.images.filter(i => i.image_type === 'before').length > 0 ? (
                    <div className="space-y-2">
                      {repair.images.filter(i => i.image_type === 'before').map(img => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.image_url}
                            alt="ก่อนซ่อม"
                            className="w-full h-44 object-cover rounded-lg shadow-xs"
                          />
                          {img.caption && (
                            <p className="text-[10px] text-slate-500 mt-1">{img.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                      <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                      <span>ไม่มีรูปภาพก่อนซ่อม</span>
                    </div>
                  )}
                </div>

                {/* After */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <div className="text-[11px] font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>ภาพหลังซ่อมเสร็จ (After)</span>
                  </div>
                  {repair.images.filter(i => i.image_type === 'after').length > 0 ? (
                    <div className="space-y-2">
                      {repair.images.filter(i => i.image_type === 'after').map(img => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.image_url}
                            alt="หลังซ่อมเสร็จ"
                            className="w-full h-44 object-cover rounded-lg shadow-xs border border-emerald-200"
                          />
                          {img.caption && (
                            <p className="text-[10px] text-slate-500 mt-1">{img.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                      <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                      <span>ยังไม่มีภาพหลังซ่อมเสร็จ</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Completed Resolution Box */}
            {repair.status === 'completed' && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>บันทึกผลการซ่อมและสรุปค่าใช้จ่าย</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono">
                    เสร็จเมื่อ: {repair.completion_date}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  <strong>รายละเอียดงาน:</strong> {repair.result || 'ซ่อมแซมเรียบร้อยตามมาตรฐาน'}
                </p>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-medium">ค่าใช้จ่ายในการซ่อมแซม:</span>
                  <span className="font-bold font-mono text-emerald-900 text-base">
                    ฿{repair.cost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Card 2: Comments Discussion */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>ความคิดเห็นและประสานงาน ({repair.comments.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">พูดคุยระหว่างผู้แจ้ง ช่าง และผู้ดูแล</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {repair.comments.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        c.user_role === 'admin' ? 'bg-rose-500' : c.user_role === 'technician' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      {c.user_name}
                      <span className="text-[10px] font-normal text-slate-400">({c.user_role})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{c.created_at}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-normal pl-3.5">
                    {c.comment}
                  </p>
                </div>
              ))}

              {repair.comments.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs">
                  ยังไม่มีข้อความความคิดเห็นในรายการนี้
                </div>
              )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="พิมพ์ข้อความสอบถามหรือประสานงาน..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ส่ง</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: People info & Status Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* People & Assignment Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
              ผู้เกี่ยวข้องกับงานซ่อม
            </h3>

            {/* Reporter */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden text-xs">
                <span className="text-slate-400 block text-[10px]">ผู้แจ้งซ่อม</span>
                <span className="font-semibold text-slate-800 block truncate">{repair.reporter_name}</span>
                <span className="text-slate-500 text-[11px] block truncate">{repair.reporter_department}</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Technician */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="overflow-hidden text-xs">
                <span className="text-slate-400 block text-[10px]">ช่างผู้รับผิดชอบ</span>
                {repair.technician_name ? (
                  <>
                    <span className="font-semibold text-slate-800 block truncate">{repair.technician_name}</span>
                    {repair.due_date && (
                      <span className="text-amber-700 text-[11px] block mt-0.5">
                        กำหนดเสร็จ: <strong>{repair.due_date}</strong>
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400 italic">ยังไม่ได้มอบหมายงานให้ช่าง</span>
                )}
              </div>
            </div>
          </div>

          {/* State Timeline (History Audit Trail) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>ประวัติสถานะ (Audit Trail)</span>
              </h3>
              <span className="text-[10px] text-slate-400">{repair.history.length} รายการ</span>
            </div>

            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {repair.history.map((h) => {
                const stepStatus = STATUS_LABELS[h.new_status];
                return (
                  <div key={h.id} className="relative text-xs">
                    <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${stepStatus.bg} ${stepStatus.text} ${stepStatus.border}`}>
                        {stepStatus.label}
                      </span>
                      <p className="font-medium text-slate-800 mt-1 text-xs">
                        {h.remark || 'อัปเดตสถานะงาน'}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        โดย {h.changed_by_name} • {h.created_at}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Admin Assign Technician */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base font-bold">มอบหมายช่างผู้รับผิดชอบ</h3>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลือกช่างซ่อมบำรุง <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 bg-white"
                  required
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullname} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  กำหนดวันแล้วเสร็จ (Due Date)
                </label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  คำสั่งการ / หมายเหตุเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น โปรดเข้าดำเนินการช่วงพักเที่ยง"
                  value={assignRemark}
                  onChange={(e) => setAssignRemark(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  ยืนยันมอบหมายงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Complete Repair (Technician / Admin) */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <h3 className="text-base font-bold">บันทึกผลการซ่อมและปิดงาน</h3>
              </div>
              <button onClick={() => setShowCompleteModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ค่าใช้จ่ายรวมในการซ่อม (บาท) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={completeCost}
                    onChange={(e) => setCompleteCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  หากไม่มีค่าใช้จ่าย ให้ใส่ 0.00
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รายละเอียดผลการซ่อมแซมและอะไหล่ที่เปลี่ยน <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุสิ่งที่ได้ทำ เช่น เปลี่ยนหลอดไฟ LED 18W, เติมน้ำยาแอร์ R32, ตรวจสอบแล้วใช้งานได้ปกติ..."
                  value={completeResult}
                  onChange={(e) => setCompleteResult(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รูปภาพหลังซ่อมเสร็จ (After Image)
                </label>
                {afterImagePreview ? (
                  <div className="relative inline-block mt-1">
                    <img
                      src={afterImagePreview}
                      alt="ตัวอย่างหลังซ่อม"
                      className="h-28 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setAfterImagePreview(null)}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-500 bg-slate-50/50">
                    <Upload className="w-4 h-4 text-emerald-600 mr-2" />
                    <span className="text-emerald-700 font-medium">คลิกเพื่ออัปโหลดภาพหลังซ่อม</span>
                    <input type="file" accept="image/*" onChange={handleAfterImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  บันทึกปิดงานซ่อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
