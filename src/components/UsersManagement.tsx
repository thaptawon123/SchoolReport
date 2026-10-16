import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ROLE_LABELS } from '../data/mockData';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Lock
} from 'lucide-react';

interface UsersManagementProps {
  currentUser: User;
  users: User[];
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  onToggleUserStatus: (userId: number) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  currentUser,
  users,
  onAddUser,
  onToggleUserStatus
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullname.trim() || !email.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }
    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setErrorMsg(`ชื่อผู้ใช้ '${username}' มีอยู่ในระบบแล้ว`);
      return;
    }
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg(`อีเมล '${email}' มีอยู่ในระบบแล้ว`);
      return;
    }

    onAddUser({
      username: username.trim(),
      fullname: fullname.trim(),
      email: email.trim(),
      role,
      department: department.trim() || 'ฝ่ายวิชาการ',
      phone: phone.trim() || '-',
      is_active: true
    });

    setShowAddModal(false);
    setUsername('');
    setPassword('');
    setFullname('');
    setEmail('');
    setDepartment('');
    setPhone('');
    setErrorMsg('');
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const techCount = users.filter(u => u.role === 'technician').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>จัดการบัญชีผู้ใช้งานระบบ (User Management)</span>
          </h2>
          <p className="text-xs text-slate-500">
            ควบคุมสิทธิ์การเข้าถึง กำหนดบทบาท และระงับ/เปิดใช้งานบัญชีผู้ใช้
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มผู้ใช้งานใหม่</span>
        </button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700">ผู้ดูแลระบบ (Admin)</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{adminCount} บัญชี</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-700">ครู / บุคลากร (Teacher)</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{teacherCount} บัญชี</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700">ช่างซ่อมบำรุง (Technician)</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{techCount} บัญชี</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-3 font-semibold">ชื่อผู้ใช้ (Username)</th>
                <th className="py-3 px-3 font-semibold">ชื่อ - นามสกุล</th>
                <th className="py-3 px-3 font-semibold">อีเมล</th>
                <th className="py-3 px-3 font-semibold">กลุ่มสาระ / ฝ่ายงาน</th>
                <th className="py-3 px-3 font-semibold">บทบาท (Role)</th>
                <th className="py-3 px-3 font-semibold">สถานะบัญชี</th>
                <th className="py-3 px-4 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const roleBadge = ROLE_LABELS[u.role].badge;
                const isCurrent = u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400">#{u.id}</td>
                    
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">
                      {u.username}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{u.fullname}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{u.phone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      {u.department}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${roleBadge}`}>
                        {ROLE_LABELS[u.role].label}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>เปิดใช้งาน</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          <UserX className="w-3 h-3" />
                          <span>ระงับการใช้งาน</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isCurrent ? (
                        <span className="text-[10px] text-slate-400 font-medium">บัญชีปัจจุบัน</span>
                      ) : (
                        <button
                          onClick={() => onToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                            u.is_active
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.is_active ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base font-bold">เพิ่มบัญชีผู้ใช้งานใหม่</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3.5 text-xs">
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น teacher_somporn"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รหัสผ่านเริ่มต้น <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น ครูสมพร วงศ์สว่าง"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  อีเมลโรงเรียน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="somporn@school.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  บทบาทในระบบ (Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="teacher">ครู/บุคลากร (Teacher)</option>
                  <option value="technician">ช่างซ่อมบำรุง (Technician)</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  กลุ่มสาระ / ฝ่ายงาน
                </label>
                <input
                  type="text"
                  placeholder="เช่น กลุ่มสาระการเรียนรู้ภาษาไทย"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  บันทึกผู้ใช้ใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
