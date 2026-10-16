import React, { useState } from 'react';
import { User, ProblemType, UrgencyLevel, RepairRequest } from '../types';
import { PROBLEM_TYPE_LABELS } from '../data/mockData';
import { 
  FileText, 
  MapPin, 
  AlertCircle, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Send,
  Sparkles
} from 'lucide-react';

interface CreateRepairModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (newRepair: Omit<RepairRequest, 'id' | 'request_no' | 'created_at' | 'updated_at' | 'comments' | 'history'>, beforeImageUrl?: string) => void;
}

export const CreateRepairModal: React.FC<CreateRepairModalProps> = ({
  currentUser,
  onClose,
  onSubmit
}) => {
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [problemType, setProblemType] = useState<ProblemType>('aircon');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle local image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('ขนาดไฟล์ภาพต้องไม่เกิน 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick preset sample fill
  const handleFillPreset = (presetType: 'aircon' | 'projector' | 'chair') => {
    if (presetType === 'aircon') {
      setBuilding('อาคาร 3 (วิทยาการ)');
      setRoom('ห้อง 302 ชั้น 3');
      setProblemType('aircon');
      setUrgency('high');
      setDescription('เครื่องปรับอากาศเปิดไม่ติด มีไฟกระพริบสีส้มที่แผงควบคุม และมีน้ำหยดไหลลงมาริมหน้าต่าง');
    } else if (presetType === 'projector') {
      setBuilding('อาคาร 1 (อำนวยการ)');
      setRoom('ห้องประชุมราชพฤกษ์');
      setProblemType('computer');
      setUrgency('high');
      setDescription('โปรเจกเตอร์ฉายภาพไม่ออก พัดลมเครื่องดังมากแล้วดับไปเอง ต้องใช้ในการประชุมบ่ายนี้');
    } else {
      setBuilding('อาคาร 2 (มัธยม)');
      setRoom('ห้องเรียน 215');
      setProblemType('furniture');
      setUrgency('low');
      setDescription('โต๊ะนักเรียนแถวหลังชำรุด พนักพิงหลุด และเก้าอี้โยก 2 ตัว');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!building.trim()) {
      setErrorMsg('กรุณาระบุอาคารหรือสถานที่');
      return;
    }
    if (!room.trim()) {
      setErrorMsg('กรุณาระบุห้องหรือจุดติดตั้ง');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('กรุณากรอกรายละเอียดปัญหา');
      return;
    }

    onSubmit(
      {
        user_id: currentUser.id,
        reporter_name: currentUser.fullname,
        reporter_department: currentUser.department,
        building: building.trim(),
        room: room.trim(),
        problem_type: problemType,
        description: description.trim(),
        urgency,
        status: 'pending',
        assigned_to: null,
        due_date: null,
        completion_date: null,
        cost: 0,
        result: null,
        images: []
      },
      previewImage || undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">สร้างใบแจ้งซ่อมอุปกรณ์ใหม่</h3>
              <p className="text-xs text-blue-200">แบบฟอร์มบันทึกความชำรุดของอุปกรณ์และอาคารสถานที่</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets for testing */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            ตัวอย่างข้อมูลด่วน:
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleFillPreset('aircon')}
              className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
            >
              แอร์ไม่เย็น (ด่วน)
            </button>
            <button
              type="button"
              onClick={() => handleFillPreset('projector')}
              className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
            >
              โปรเจกเตอร์เสีย
            </button>
            <button
              type="button"
              onClick={() => handleFillPreset('chair')}
              className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
            >
              โต๊ะเก้าอี้ชำรุด
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อาคาร / สถานที่ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น อาคาร 2 (เฉลิมพระเกียรติ)"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ห้อง / จุดติดตั้ง <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น ห้องปฏิบัติการ 224, ชั้น 2"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประเภทปัญหา <span className="text-rose-500">*</span>
              </label>
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value as ProblemType)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                {Object.entries(PROBLEM_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับความเร่งด่วน <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as UrgencyLevel[]).map((level) => {
                  const isSelected = urgency === level;
                  const labels = {
                    low: 'ปกติ',
                    medium: 'ปานกลาง',
                    high: 'เร่งด่วน'
                  };
                  return (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setUrgency(level)}
                      className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? level === 'high'
                            ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                            : level === 'medium'
                            ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold'
                            : 'bg-slate-100 border-slate-500 text-slate-800 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {labels[level]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รายละเอียดอาการเสีย / ปัญหาที่พบ <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="ระบุอาการชำรุด เช่น มีกลิ่นไหม้, เปิดเครื่องไม่ติด, น้ำหยด..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รูปภาพประกอบความเสียหาย (ก่อนซ่อม)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-4 pb-4 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-400 transition-colors bg-slate-50/50">
              {previewImage ? (
                <div className="relative group">
                  <img
                    src={previewImage}
                    alt="ภาพตัวอย่าง"
                    className="max-h-36 rounded-xl object-cover shadow-sm border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 hover:underline">
                    คลิกเพื่ออัปโหลดรูปภาพ
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    รองรับ JPG, PNG, WEBP (สูงสุด 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Reporter Preview Info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
            <span>ผู้แจ้ง: <strong className="text-slate-700">{currentUser.fullname}</strong> ({currentUser.department})</span>
            <span className="text-blue-600 font-semibold">สถานะเริ่มต้น: รอรับเรื่อง (Pending)</span>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>บันทึกและส่งใบแจ้งซ่อม</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
