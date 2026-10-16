/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, RepairRequest, ProblemType, UrgencyLevel, RequestStatus } from './types';
import { INITIAL_USERS, INITIAL_REPAIRS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { RepairsList } from './components/RepairsList';
import { CreateRepairModal } from './components/CreateRepairModal';
import { RepairDetail } from './components/RepairDetail';
import { PrintSlipModal } from './components/PrintSlipModal';
import { UsersManagement } from './components/UsersManagement';
import { OoadExplorer } from './components/OoadExplorer';
import { CodebaseExplorer } from './components/CodebaseExplorer';
import { ForbiddenView } from './components/ForbiddenView';
import { ToastContainer, ToastMessage } from './components/SweetAlertToast';

export default function App() {
  // Top-level Navigation mode
  const [activeTab, setActiveTab] = useState<'app' | 'ooad' | 'codebase'>('app');

  // Application view within 'app' mode
  const [currentView, setCurrentView] = useState<'dashboard' | 'list' | 'create' | 'detail' | 'users' | 'forbidden'>('dashboard');

  // State Store
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // default Somchai Admin
  const [repairs, setRepairs] = useState<RepairRequest[]>(INITIAL_REPAIRS);

  // Active repair for detail & print views
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);
  const [printSlipRepair, setPrintSlipRepair] = useState<RepairRequest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Role switching
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    addToast('info', `สลับบทบาทเป็น: ${user.fullname}`, `สิทธิ์: ${user.role} (${user.department})`);
    
    // Check if user has permission to stay on current view
    if (currentView === 'users' && user.role !== 'admin') {
      setCurrentView('dashboard');
    }
    if (currentView === 'detail' && selectedRepair) {
      if (user.role === 'teacher' && selectedRepair.user_id !== user.id) {
        setCurrentView('forbidden');
      } else if (user.role === 'technician' && selectedRepair.assigned_to !== user.id) {
        setCurrentView('forbidden');
      }
    }
  };

  // Inspect detail with authorization policy check (Section 2 & 8)
  const handleSelectRepair = (repair: RepairRequest) => {
    setSelectedRepair(repair);
    if (currentUser.role === 'teacher' && repair.user_id !== currentUser.id) {
      setCurrentView('forbidden');
      return;
    }
    if (currentUser.role === 'technician' && repair.assigned_to !== currentUser.id) {
      setCurrentView('forbidden');
      return;
    }
    setCurrentView('detail');
  };

  // Create new repair request
  const handleCreateRepair = (
    newRepairData: Omit<RepairRequest, 'id' | 'request_no' | 'created_at' | 'updated_at' | 'comments' | 'history'>,
    beforeImageUrl?: string
  ) => {
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nextSeq = repairs.length + 1;
    const requestNo = `RP-${yyyymm}-${String(nextSeq).padStart(3, '0')}`;
    const nowStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

    const newRepair: RepairRequest = {
      ...newRepairData,
      id: Date.now(),
      request_no: requestNo,
      status: 'pending',
      cost: 0,
      result: null,
      created_at: nowStr,
      updated_at: nowStr,
      images: beforeImageUrl
        ? [
            {
              id: Date.now(),
              repair_id: Date.now(),
              image_type: 'before',
              image_url: beforeImageUrl,
              caption: 'ภาพถ่ายความเสียหายเมื่อสร้างใบแจ้งซ่อม',
              uploaded_at: nowStr
            }
          ]
        : [],
      comments: [],
      history: [
        {
          id: Date.now(),
          repair_id: Date.now(),
          old_status: null,
          new_status: 'pending',
          changed_by: currentUser.id,
          changed_by_name: currentUser.fullname,
          remark: 'สร้างใบแจ้งซ่อมใหม่ในระบบ',
          created_at: nowStr
        }
      ]
    };

    setRepairs([newRepair, ...repairs]);
    setIsCreateModalOpen(false);
    setSelectedRepair(newRepair);
    setCurrentView('detail');
    addToast('success', 'สร้างใบแจ้งซ่อมสำเร็จ!', `หมายเลขอ้างอิง ${requestNo}`);
  };

  // Admin assigns technician (pending -> accepted)
  const handleAssignTechnician = (repairId: number, technicianId: number, dueDate: string, remark: string) => {
    const tech = users.find((u) => u.id === technicianId);
    if (!tech) return;

    const now = new Date();
    const nowStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

    setRepairs((prev) =>
      prev.map((r) => {
        if (r.id !== repairId) return r;
        const oldStatus = r.status;
        const newStatus: RequestStatus = 'accepted';
        return {
          ...r,
          status: newStatus,
          assigned_to: technicianId,
          technician_name: tech.fullname,
          due_date: dueDate || r.due_date,
          updated_at: nowStr,
          history: [
            ...r.history,
            {
              id: Date.now(),
              repair_id: r.id,
              old_status: oldStatus,
              new_status: newStatus,
              changed_by: currentUser.id,
              changed_by_name: `${currentUser.fullname} (Admin)`,
              remark: remark || `มอบหมายงานให้ช่าง ${tech.fullname}`,
              created_at: nowStr
            }
          ]
        };
      })
    );

    // Update selected repair in detail view
    setSelectedRepair((prev) =>
      prev && prev.id === repairId
        ? {
            ...prev,
            status: 'accepted',
            assigned_to: technicianId,
            technician_name: tech.fullname,
            due_date: dueDate || prev.due_date,
            updated_at: nowStr,
            history: [
              ...prev.history,
              {
                id: Date.now(),
                repair_id: prev.id,
                old_status: prev.status,
                new_status: 'accepted',
                changed_by: currentUser.id,
                changed_by_name: `${currentUser.fullname} (Admin)`,
                remark: remark || `มอบหมายงานให้ช่าง ${tech.fullname}`,
                created_at: nowStr
              }
            ]
          }
        : prev
    );

    addToast('success', 'มอบหมายงานสำเร็จ!', `ช่าง ${tech.fullname} ได้รับมอบหมายงานนี้`);
  };

  // Technician starts repair (accepted -> in_progress)
  const handleStartRepair = (repairId: number, remark: string) => {
    const now = new Date();
    const nowStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

    setRepairs((prev) =>
      prev.map((r) => {
        if (r.id !== repairId) return r;
        return {
          ...r,
          status: 'in_progress',
          updated_at: nowStr,
          history: [
            ...r.history,
            {
              id: Date.now(),
              repair_id: r.id,
              old_status: r.status,
              new_status: 'in_progress',
              changed_by: currentUser.id,
              changed_by_name: `${currentUser.fullname} (${currentUser.role})`,
              remark: remark || 'ช่างเริ่มดำเนินการซ่อมแซม',
              created_at: nowStr
            }
          ]
        };
      })
    );

    setSelectedRepair((prev) =>
      prev && prev.id === repairId
        ? {
            ...prev,
            status: 'in_progress',
            updated_at: nowStr,
            history: [
              ...prev.history,
              {
                id: Date.now(),
                repair_id: prev.id,
                old_status: prev.status,
                new_status: 'in_progress',
                changed_by: currentUser.id,
                changed_by_name: `${currentUser.fullname} (${currentUser.role})`,
                remark: remark || 'ช่างเริ่มดำเนินการซ่อมแซม',
                created_at: nowStr
              }
            ]
          }
        : prev
    );

    addToast('info', 'เริ่มดำเนินการซ่อมแล้ว', 'สถานะเปลี่ยนเป็น "กำลังดำเนินการ"');
  };

  // Technician completes repair (in_progress -> completed)
  const handleCompleteRepair = (
    repairId: number,
    cost: number,
    result: string,
    afterImageUrl?: string,
    remark?: string
  ) => {
    const now = new Date();
    const nowStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

    const newAfterImage = afterImageUrl
      ? {
          id: Date.now(),
          repair_id: repairId,
          image_type: 'after' as const,
          image_url: afterImageUrl,
          caption: 'ภาพหลังซ่อมแซมเสร็จสิ้น',
          uploaded_at: nowStr
        }
      : undefined;

    setRepairs((prev) =>
      prev.map((r) => {
        if (r.id !== repairId) return r;
        const images = newAfterImage ? [...r.images, newAfterImage] : r.images;
        return {
          ...r,
          status: 'completed',
          cost,
          result,
          completion_date: nowStr,
          updated_at: nowStr,
          images,
          history: [
            ...r.history,
            {
              id: Date.now(),
              repair_id: r.id,
              old_status: r.status,
              new_status: 'completed',
              changed_by: currentUser.id,
              changed_by_name: `${currentUser.fullname} (${currentUser.role})`,
              remark: remark || `ปิดงานซ่อมเรียบร้อย ค่าใช้จ่าย: ${cost.toLocaleString()} บาท`,
              created_at: nowStr
            }
          ]
        };
      })
    );

    setSelectedRepair((prev) =>
      prev && prev.id === repairId
        ? {
            ...prev,
            status: 'completed',
            cost,
            result,
            completion_date: nowStr,
            updated_at: nowStr,
            images: newAfterImage ? [...prev.images, newAfterImage] : prev.images,
            history: [
              ...prev.history,
              {
                id: Date.now(),
                repair_id: prev.id,
                old_status: prev.status,
                new_status: 'completed',
                changed_by: currentUser.id,
                changed_by_name: `${currentUser.fullname} (${currentUser.role})`,
                remark: remark || `ปิดงานซ่อมเรียบร้อย ค่าใช้จ่าย: ${cost.toLocaleString()} บาท`,
                created_at: nowStr
              }
            ]
          }
        : prev
    );

    addToast('success', 'ปิดงานซ่อมเสร็จสมบูรณ์!', `บันทึกค่าใช้จ่าย ${cost.toLocaleString()} บาท เรียบร้อยแล้ว`);
  };

  // Add comment
  const handleAddComment = (repairId: number, commentText: string) => {
    const now = new Date();
    const nowStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

    const newCommentObj = {
      id: Date.now(),
      repair_id: repairId,
      user_id: currentUser.id,
      user_name: currentUser.fullname,
      user_role: currentUser.role,
      comment: commentText,
      created_at: nowStr
    };

    setRepairs((prev) =>
      prev.map((r) => {
        if (r.id !== repairId) return r;
        return {
          ...r,
          comments: [...r.comments, newCommentObj]
        };
      })
    );

    setSelectedRepair((prev) =>
      prev && prev.id === repairId
        ? {
            ...prev,
            comments: [...prev.comments, newCommentObj]
          }
        : prev
    );

    addToast('info', 'เพิ่มความคิดเห็นแล้ว', 'ข้อความถูกส่งเข้าสู่ระบบประสานงาน');
  };

  // Admin add user
  const handleAddUser = (newUserData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...newUserData,
      id: users.length + 1
    };
    setUsers([...users, newUser]);
    addToast('success', 'สร้างบัญชีผู้ใช้ใหม่สำเร็จ!', `ผู้ใช้: ${newUser.fullname} (${newUser.role})`);
  };

  // Admin toggle user status
  const handleToggleUserStatus = (userId: number) => {
    if (userId === currentUser.id) {
      addToast('warning', 'ไม่อนุญาต', 'ไม่สามารถปิดการใช้งานบัญชีที่คุณกำลังล็อกอินอยู่ได้');
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newStatus = !u.is_active;
        addToast(
          'info',
          `${newStatus ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'} บัญชีสำเร็จ`,
          `${u.fullname} มีสถานะ: ${newStatus ? 'ใช้งานได้' : 'ถูกระงับ'}`
        );
        return { ...u, is_active: newStatus };
      })
    );
  };

  // Export CSV download
  const handleExportCsv = () => {
    // Generate UTF-8 with BOM CSV matching report_service.py
    const BOM = '\uFEFF';
    const headers = [
      'เลขที่ใบแจ้งซ่อม',
      'วันที่แจ้ง',
      'ผู้แจ้งซ่อม',
      'กลุ่มสาระ/แผนก',
      'อาคาร/สถานที่',
      'ห้อง/จุดติดตั้ง',
      'ประเภทปัญหา',
      'ระดับความเร่งด่วน',
      'สถานะ',
      'ช่างผู้รับผิดชอบ',
      'กำหนดเสร็จ',
      'วันที่ซ่อมเสร็จ',
      'ค่าใช้จ่าย (บาท)',
      'รายละเอียดผลการซ่อม'
    ];

    // Filter according to user scope
    const exportData = currentUser.role === 'admin'
      ? repairs
      : currentUser.role === 'teacher'
      ? repairs.filter((r) => r.user_id === currentUser.id)
      : repairs.filter((r) => r.assigned_to === currentUser.id);

    const rows = exportData.map((r) => [
      `"${r.request_no}"`,
      `"${r.created_at}"`,
      `"${r.reporter_name}"`,
      `"${r.reporter_department}"`,
      `"${r.building}"`,
      `"${r.room}"`,
      `"${r.problem_type}"`,
      `"${r.urgency}"`,
      `"${r.status}"`,
      `"${r.technician_name || '-'}"`,
      `"${r.due_date || '-'}"`,
      `"${r.completion_date || '-'}"`,
      `"${r.cost.toFixed(2)}"`,
      `"${(r.result || r.description).replace(/"/g, '""')}"`
    ]);

    const csvContent = BOM + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `schoolfix_repairs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast('success', 'ส่งออกข้อมูล CSV สำเร็จ!', `ดาวน์โหลดข้อมูล ${exportData.length} รายการเรียบร้อยแล้ว`);
  };

  const pendingCount = repairs.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Main Body */}
      {activeTab === 'app' ? (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Sidebar */}
          <Sidebar
            currentUser={currentUser}
            currentView={currentView as any}
            onNavigate={(view) => {
              if (view === 'create') {
                setIsCreateModalOpen(true);
              } else {
                setCurrentView(view);
              }
            }}
            onExportCsv={handleExportCsv}
            pendingCount={pendingCount}
          />

          {/* Center Main Content View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
            {currentView === 'dashboard' && (
              <Dashboard
                currentUser={currentUser}
                repairs={repairs}
                onSelectRepair={handleSelectRepair}
                onNavigateCreate={() => setIsCreateModalOpen(true)}
              />
            )}

            {currentView === 'list' && (
              <RepairsList
                currentUser={currentUser}
                repairs={repairs}
                onSelectRepair={handleSelectRepair}
                onPrintSlip={(r) => setPrintSlipRepair(r)}
                onNavigateCreate={() => setIsCreateModalOpen(true)}
                onExportCsv={handleExportCsv}
              />
            )}

            {currentView === 'detail' && selectedRepair && (
              <RepairDetail
                repair={selectedRepair}
                currentUser={currentUser}
                technicians={users.filter((u) => u.role === 'technician' && u.is_active)}
                onBack={() => setCurrentView('list')}
                onPrintSlip={(r) => setPrintSlipRepair(r)}
                onAssignTechnician={handleAssignTechnician}
                onStartRepair={handleStartRepair}
                onCompleteRepair={handleCompleteRepair}
                onAddComment={handleAddComment}
              />
            )}

            {currentView === 'users' && currentUser.role === 'admin' && (
              <UsersManagement
                currentUser={currentUser}
                users={users}
                onAddUser={handleAddUser}
                onToggleUserStatus={handleToggleUserStatus}
              />
            )}

            {currentView === 'forbidden' && (
              <ForbiddenView onBack={() => setCurrentView('list')} />
            )}
          </main>
        </div>
      ) : activeTab === 'ooad' ? (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <OoadExplorer />
        </main>
      ) : (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <CodebaseExplorer />
        </main>
      )}

      {/* Create Repair Modal */}
      {isCreateModalOpen && (
        <CreateRepairModal
          currentUser={currentUser}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateRepair}
        />
      )}

      {/* Print Slip Modal (A4 Printable) */}
      {printSlipRepair && (
        <PrintSlipModal
          repair={printSlipRepair}
          onClose={() => setPrintSlipRepair(null)}
        />
      )}

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SchoolFix — ระบบแจ้งซ่อมภายในโรงเรียนตามหลัก OOAD และ OOP</span>
          <span className="text-[11px] text-slate-400">
            Backend: Python 3.10+ / Flask / SQLite • Frontend Preview: React / Tailwind CSS
          </span>
        </div>
      </footer>

    </div>
  );
}
