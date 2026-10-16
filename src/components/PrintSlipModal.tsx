import React from 'react';
import { RepairRequest } from '../types';
import { PROBLEM_TYPE_LABELS, STATUS_LABELS, URGENCY_LABELS } from '../data/mockData';
import { Printer, X, Download } from 'lucide-react';

interface PrintSlipModalProps {
  repair: RepairRequest;
  onClose: () => void;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({ repair, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Controls (Not printed) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">พิมพ์ใบสั่งซ่อมบำรุง (A4 Printable Order)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร / บันทึก PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 Preview) */}
        <div id="printable-repair-slip" className="p-8 sm:p-12 bg-white text-slate-900 font-sans text-xs">
          
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
            <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider">เอกสารราชการภายในโรงเรียน</div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">โรงเรียนสาธิตวิทยาการบริหาร</h2>
            <h3 className="text-sm font-semibold text-slate-800">
              ใบสั่งงานแจ้งซ่อมบำรุงอุปกรณ์และอาคารสถานที่ (Repair Work Order)
            </h3>
            
            <div className="flex justify-between items-center mt-4 text-[11px] text-slate-600">
              <span>เลขที่เอกสาร: <strong className="font-mono text-slate-900 text-xs">{repair.request_no}</strong></span>
              <span>วันที่แจ้ง: <strong className="text-slate-900">{repair.created_at}</strong></span>
              <span>สถานะปัจจุบัน: <strong className="text-slate-900">{STATUS_LABELS[repair.status].label}</strong></span>
            </div>
          </div>

          {/* Section 1: Requester & Location */}
          <div className="mb-5">
            <h4 className="font-bold text-slate-900 text-xs mb-2">๑. ข้อมูลผู้แจ้งและสถานที่ชำรุด</h4>
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <tbody>
                <tr className="border-b border-slate-400">
                  <td className="w-1/4 p-2 bg-slate-100 font-semibold border-r border-slate-400">ผู้แจ้งความประสงค์:</td>
                  <td className="w-1/4 p-2 border-r border-slate-400">{repair.reporter_name}</td>
                  <td className="w-1/4 p-2 bg-slate-100 font-semibold border-r border-slate-400">กลุ่มสาระ/ฝ่ายงาน:</td>
                  <td className="w-1/4 p-2">{repair.reporter_department}</td>
                </tr>
                <tr className="border-b border-slate-400">
                  <td className="p-2 bg-slate-100 font-semibold border-r border-slate-400">อาคาร / สถานที่:</td>
                  <td className="p-2 border-r border-slate-400">{repair.building}</td>
                  <td className="p-2 bg-slate-100 font-semibold border-r border-slate-400">ห้อง / จุดติดตั้ง:</td>
                  <td className="p-2">{repair.room}</td>
                </tr>
                <tr className="border-b border-slate-400">
                  <td className="p-2 bg-slate-100 font-semibold border-r border-slate-400">ประเภทงานซ่อม:</td>
                  <td className="p-2 border-r border-slate-400">{PROBLEM_TYPE_LABELS[repair.problem_type]}</td>
                  <td className="p-2 bg-slate-100 font-semibold border-r border-slate-400">ระดับความเร่งด่วน:</td>
                  <td className="p-2">{URGENCY_LABELS[repair.urgency].label}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-slate-100 font-semibold border-r border-slate-400 align-top">รายละเอียดอาการชำรุด:</td>
                  <td colSpan={3} className="p-3 leading-relaxed min-h-[50px]">{repair.description}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Assignment */}
          <div className="mb-5">
            <h4 className="font-bold text-slate-900 text-xs mb-2">๒. การมอบหมายงานซ่อมบำรุง (ฝ่ายอาคารสถานที่)</h4>
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <tbody>
                <tr className="border-b border-slate-400">
                  <td className="w-1/4 p-2 bg-slate-100 font-semibold border-r border-slate-400">ช่างผู้รับผิดชอบ:</td>
                  <td className="w-1/4 p-2 border-r border-slate-400">{repair.technician_name || '................................................'}</td>
                  <td className="w-1/4 p-2 bg-slate-100 font-semibold border-r border-slate-400">กำหนดวันแล้วเสร็จ:</td>
                  <td className="w-1/4 p-2">{repair.due_date || '........................'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Result & Cost */}
          <div className="mb-8">
            <h4 className="font-bold text-slate-900 text-xs mb-2">๓. บันทึกผลการซ่อมและสรุปค่าใช้จ่าย</h4>
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <tbody>
                <tr className="border-b border-slate-400">
                  <td className="w-1/4 p-2 bg-slate-100 font-semibold border-r border-slate-400">วันที่ซ่อมเสร็จ:</td>
                  <td className="w-1/4 p-2 border-r border-slate-400">{repair.completion_date || '................................................'}</td>
                  <td className="w-1/4 p-2 bg-slate-100 font-semibold border-r border-slate-400">ค่าใช้จ่ายรวม (บาท):</td>
                  <td className="w-1/4 p-2 font-mono font-bold">
                    {repair.cost > 0 ? `${repair.cost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท` : '0.00 บาท'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 bg-slate-100 font-semibold border-r border-slate-400 align-top">สรุปการปฏิบัติงาน/อะไหล่:</td>
                  <td colSpan={3} className="p-3 leading-relaxed min-h-[50px]">{repair.result || '................................................................................................................................................'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Official Signatures */}
          <div className="grid grid-cols-3 gap-6 text-center mt-12 pt-6">
            <div className="space-y-1">
              <div className="border-b border-dotted border-slate-900 h-8 mx-4" />
              <div className="font-semibold text-slate-800 mt-2">({repair.reporter_name})</div>
              <div className="text-[10px] text-slate-500">ผู้แจ้งความประสงค์ / ผู้ตรวจรับ</div>
              <div className="text-[10px] text-slate-400">วันที่ ...... / ...... / ......</div>
            </div>

            <div className="space-y-1">
              <div className="border-b border-dotted border-slate-900 h-8 mx-4" />
              <div className="font-semibold text-slate-800 mt-2">({repair.technician_name || '........................................'})</div>
              <div className="text-[10px] text-slate-500">ช่างผู้ดำเนินการซ่อม</div>
              <div className="text-[10px] text-slate-400">วันที่ ...... / ...... / ......</div>
            </div>

            <div className="space-y-1">
              <div className="border-b border-dotted border-slate-900 h-8 mx-4" />
              <div className="font-semibold text-slate-800 mt-2">(นายสมชาย ดูแลดี)</div>
              <div className="text-[10px] text-slate-500">หัวหน้าฝ่ายบริหารงานอาคารสถานที่</div>
              <div className="text-[10px] text-slate-400">วันที่ ...... / ...... / ......</div>
            </div>
          </div>

          {/* Footer watermark */}
          <div className="text-center text-[9px] text-slate-400 mt-12 pt-4 border-t border-slate-200">
            เอกสารบันทึกงานซ่อมบำรุงอัตโนมัติจากระบบ SchoolFix (OOAD + OOP Platform)
          </div>

        </div>

      </div>
    </div>
  );
};
