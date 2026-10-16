import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { 
  BookOpen, 
  Layers, 
  GitBranch, 
  Database, 
  ShieldCheck, 
  Boxes, 
  CheckCircle2, 
  Copy, 
  Check, 
  Cpu,
  FileCode,
  Sparkles
} from 'lucide-react';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Prompt, sans-serif'
});

export const OoadExplorer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'usecase' | 'noun' | 'class' | 'sequence' | 'er' | 'oop'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mermaidRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Diagrams source code
  const classDiagramCode = `classDiagram
    direction TB

    class UserRole {
        <<enumeration>>
        ADMIN
        TEACHER
        TECHNICIAN
    }

    class ProblemType {
        <<enumeration>>
        ELECTRICAL
        AIRCON
        COMPUTER
        FURNITURE
        OTHER
    }

    class UrgencyLevel {
        <<enumeration>>
        LOW
        MEDIUM
        HIGH
    }

    class RequestStatus {
        <<enumeration>>
        PENDING
        ACCEPTED
        IN_PROGRESS
        COMPLETED
    }

    class User {
        -int id
        -string username
        -string password_hash
        -string fullname
        -string email
        -UserRole role
        -string department
        -string phone
        -bool is_active
        -datetime created_at
        +set_password(string password) void
        +check_password(string password) bool
        +is_admin() bool
        +is_teacher() bool
        +is_technician() bool
        +can_view_request(RepairRequest req) bool
        +can_edit_request(RepairRequest req) bool
    }

    class RepairRequest {
        -int id
        -string request_no
        -int user_id
        -string building
        -string room
        -ProblemType problem_type
        -string description
        -UrgencyLevel urgency
        -RequestStatus status
        -int assigned_to
        -date due_date
        -datetime completion_date
        -float cost
        -string result
        -datetime created_at
        -datetime updated_at
        +generate_request_no(int seq, datetime dt) string
        +can_transition_to(string new_status) bool
        +assign_to_technician(User tech, User actor, date due_date) void
        +start_repair(User actor) void
        +complete_repair(User actor, float cost, string result) void
        +to_dict() dict
    }

    class RepairImage {
        -int id
        -int repair_id
        -string image_type
        -string image_path
        -string original_filename
        -datetime uploaded_at
        +to_dict() dict
    }

    class Comment {
        -int id
        -int repair_id
        -int user_id
        -string comment
        -datetime created_at
        +to_dict() dict
    }

    class RepairStatusHistory {
        -int id
        -int repair_id
        -string old_status
        -string new_status
        -int changed_by
        -string remark
        -datetime created_at
        +to_dict() dict
    }

    User "1" --> "0..*" RepairRequest : reports (user_id)
    User "1" --> "0..*" RepairRequest : assigned (assigned_to)
    User "1" --> "0..*" Comment : writes
    RepairRequest "1" *-- "0..*" RepairImage : has (Composition)
    RepairRequest "1" *-- "0..*" Comment : has (Composition)
    RepairRequest "1" *-- "0..*" RepairStatusHistory : tracks (Composition)
    RepairRequest ..> RequestStatus : uses
    RepairRequest ..> ProblemType : uses
    RepairRequest ..> UrgencyLevel : uses
    User ..> UserRole : uses`;

  const sequenceCreateCode = `sequenceDiagram
    autonumber
    actor Teacher as 👩‍🏫 Teacher (ผู้แจ้ง)
    participant UI as 🖥️ Frontend (Web App)
    participant Ctrl as ⚙️ RepairController / Route
    participant Svc as 🧠 RepairService
    participant Repo as 📦 RepairRepository
    participant Req as 📋 RepairRequest (Domain Model)
    participant DB as 🗄️ SQLite Database

    Teacher->>UI: กรอกฟอร์มแจ้งซ่อม (สถานที่, ปัญหา, รูปภาพ)
    UI->>Ctrl: POST /repairs/create (FormData)
    Ctrl->>Svc: create_request(user, building, room, type, desc, file)
    
    rect rgb(240, 248, 255)
        note over Svc,Repo: ขั้นตอนสร้างเลขที่เอกสารและ Entity
        Svc->>Repo: get_next_sequence_for_month("202510")
        Repo-->>Svc: sequence = 6
        Svc->>Req: generate_request_no(6) -> "RP-202510-006"
        Svc->>Req: new RepairRequest(status=PENDING)
        Svc->>Req: _record_history(None -> PENDING)
    end

    opt มีรูปภาพแนบ
        Svc->>Svc: secure_filename() & save image
        Svc->>Req: attach RepairImage(type="before")
    end

    Svc->>Repo: save(request)
    Repo->>DB: INSERT INTO repair_requests & history
    DB-->>Repo: Success (Row ID)
    Repo-->>Svc: Saved RepairRequest
    Svc-->>Ctrl: (True, request, "แจ้งซ่อมสำเร็จ")
    Ctrl-->>UI: SweetAlert Success Notification & Redirect
    UI-->>Teacher: แสดงหน้ารายละเอียดใบแจ้งซ่อม`;

  const sequenceCloseCode = `sequenceDiagram
    autonumber
    actor Tech as 🔧 Technician (ช่าง)
    participant UI as 🖥️ Frontend (Web App)
    participant Ctrl as ⚙️ RepairController
    participant Svc as 🧠 RepairService
    participant Req as 📋 RepairRequest (Entity)
    participant DB as 🗄️ SQLite Database

    Tech->>UI: กรอกผลการซ่อม (ค่าใช้จ่าย 450 บาท, อะไหล่, รูปหลังซ่อม)
    UI->>Ctrl: POST /repairs/{id}/complete
    Ctrl->>Svc: complete_repair(repair_id, actor, cost, result, file)

    rect rgb(255, 245, 245)
        note over Svc,Req: ตรวจสอบความถูกต้องตามหลัก Encapsulation & RBAC
        Svc->>Req: complete_repair(actor, cost, result)
        alt Actor ไม่ใช่ช่างที่ได้รับมอบหมาย
            Req-->>Svc: raise RepairAuthorizationError
        else สถานะปัจจุบันไม่ใช่ IN_PROGRESS
            Req-->>Svc: raise RepairTransitionError ("ห้ามข้ามขั้นตอน")
        else ค่าใช้จ่ายติดลบ หรือผลซ่อมว่างเปล่า
            Req-->>Svc: raise ValueError
        else ผ่านทุกเงื่อนไข (Valid Transition)
            Req->>Req: status = COMPLETED
            Req->>Req: cost = 450.00, result = text
            Req->>Req: _record_history("in_progress" -> "completed")
        end
    end

    opt มีรูปภาพหลังซ่อม (After Image)
        Svc->>Req: attach RepairImage(type="after")
    end

    Svc->>DB: db.session.commit()
    DB-->>Svc: Commit OK
    Svc-->>Ctrl: (True, "ปิดงานซ่อมเรียบร้อย")
    Ctrl-->>UI: SweetAlert2 Celebration + Confetti
    UI-->>Tech: อัปเดตสถานะเป็น "ซ่อมเสร็จสิ้น"`;

  const erDiagramCode = `erDiagram
    users ||--o{ repair_requests : "reports (user_id)"
    users ||--o{ repair_requests : "assigned_to"
    users ||--o{ comments : "writes"
    users ||--o{ repair_status_history : "changed_by"
    
    repair_requests ||--o{ repair_images : "contains"
    repair_requests ||--o{ comments : "discusses"
    repair_requests ||--o{ repair_status_history : "tracks_history"

    users {
        int id PK
        string username UK
        string password_hash
        string fullname
        string email UK
        string role "admin|teacher|technician"
        string department
        string phone
        boolean is_active
        datetime created_at
    }

    repair_requests {
        int id PK
        string request_no UK "RP-YYYYMM-XXX"
        int user_id FK
        string building
        string room
        string problem_type "electrical|aircon|computer|furniture|other"
        text description
        string urgency "low|medium|high"
        string status "pending|accepted|in_progress|completed"
        int assigned_to FK
        date due_date
        datetime completion_date
        float cost
        text result
        datetime created_at
        datetime updated_at
    }

    repair_images {
        int id PK
        int repair_id FK
        string image_type "before|after"
        string image_path
        string original_filename
        datetime uploaded_at
    }

    comments {
        int id PK
        int repair_id FK
        int user_id FK
        text comment
        datetime created_at
    }

    repair_status_history {
        int id PK
        int repair_id FK
        string old_status
        string new_status
        int changed_by FK
        string remark
        datetime created_at
    }`;

  // Re-render mermaid when subtab changes
  useEffect(() => {
    let diagram = '';
    if (activeSubTab === 'class') diagram = classDiagramCode;
    else if (activeSubTab === 'sequence') diagram = sequenceCreateCode;
    else if (activeSubTab === 'er') diagram = erDiagramCode;

    if (diagram && mermaidRef.current) {
      mermaidRef.current.innerHTML = '';
      const uniqueId = `mermaid-${Date.now()}`;
      mermaid.render(uniqueId, diagram).then(({ svg }) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      }).catch(err => {
        console.error("Mermaid error:", err);
      });
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold text-blue-200 border border-blue-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            เอกสารสถาปัตยกรรมระบบตามเกณฑ์ OOAD &amp; OOP ครบถ้วน
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            ศูนย์วิเคราะห์และออกแบบระบบ SchoolFix
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            แจกแจงตั้งแต่การสกัดคลาส (Noun Extraction), Use Case, Class Diagram, Sequence Diagram, 
            ER Diagram จนถึง 5 เสาหลัก OOP ที่นำมาลงมือเขียนโค้ดจริง
          </p>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'overview', label: '1. ขอบเขต & วัตถุประสงค์', icon: BookOpen },
          { id: 'usecase', label: '2. Use Case & Workflow', icon: GitBranch },
          { id: 'noun', label: '3. Noun Extraction', icon: Boxes },
          { id: 'class', label: '4. Class Diagram', icon: Layers },
          { id: 'sequence', label: '5. Sequence Diagrams', icon: Cpu },
          { id: 'er', label: '6. Database ER Diagram', icon: Database },
          { id: 'oop', label: '7. 5 เสาหลัก OOP ในระบบ', icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        
        {/* TAB 1: OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6 text-xs sm:text-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">๑. ความเป็นมาและปัญหาของระบบเดิม</h3>
              <p className="text-slate-600 leading-relaxed">
                ในโรงเรียนส่วนใหญ่ การแจ้งซ่อมอุปกรณ์ชำรุด เช่น เครื่องปรับอากาศ หลอดไฟ คอมพิวเตอร์ โต๊ะ หรือเก้าอี้เรียน 
                ยังคงพึ่งพาเอกสารกระดาษหรือการพิมพ์ลงในกลุ่มแชทไลน์ ทำให้เกิดปัญหาสำคัญ 4 ประการ:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1.5 text-slate-700 pl-2">
                <li><strong>ข้อมูลตกหล่นและสูญหาย:</strong> เอกสารกระดาษอาจสูญหาย หรือข้อความในไลน์ถูกดันหายไป</li>
                <li><strong>ผู้แจ้งไม่สามารถติดตามสถานะงานได้:</strong> ครูผู้แจ้งไม่ทราบว่างานได้รับเรื่องแล้วหรือไม่ หรือช่างจะเข้าวันใด</li>
                <li><strong>การมอบหมายงานขาดความชัดเจน:</strong> ผู้ดูแลระบบไม่สามารถควบคุมกำหนดเสร็จ (Due Date) หรือแจกแจงภาระงานช่างได้อย่างเป็นธรรม</li>
                <li><strong>ขาดการบันทึกประวัติค่าใช้จ่ายและอะไหล่:</strong> โรงเรียนไม่ทราบว่างบประมาณซ่อมบำรุงในแต่ละปีถูกใช้ไปกับอุปกรณ์ใดมากที่สุด</li>
              </ul>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">๒. วัตถุประสงค์ของระบบ SchoolFix</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <div className="font-bold text-blue-900 mb-1">ศูนย์กลางรับแจ้งออนไลน์ 24 ชม.</div>
                  <div className="text-xs text-blue-800">
                    เปิดให้ครูและบุคลากรทุกท่านสามารถแจ้งซ่อมผ่านเว็บได้ทันที พร้อมแนบรูปถ่ายความเสียหายและจุดติดตั้ง
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <div className="font-bold text-emerald-900 mb-1">ติดตามสถานะแบบเรียลไทม์</div>
                  <div className="text-xs text-emerald-800">
                    ผู้แจ้งเห็นสถานะการดำเนินงานทุกขั้นตอน ตั้งแต่รอรับเรื่อง จนถึงซ่อมเสร็จสิ้น พร้อมระบบสอบถามใน Comment
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <div className="font-bold text-amber-900 mb-1">มอบหมายงานและควบคุมกำหนดเสร็จ</div>
                  <div className="text-xs text-amber-800">
                    ผู้ดูแลระบบ (Admin) สามารถมอบหมายงานให้ช่างที่ตรงกับสายงาน พร้อมกำหนด Due Date ได้อย่างเป็นระบบ
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <div className="font-bold text-purple-900 mb-1">บันทึกผลงาน ค่าใช้จ่าย และ Audit Trail</div>
                  <div className="text-xs text-purple-800">
                    เก็บหลักฐานภาพก่อน-หลังซ่อม บันทึกงบประมาณค่าซ่อมจริง และเก็บประวัติผู้ดำเนินการทุกครั้งเพื่อความโปร่งใส
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">๓. ผู้ใช้งานระบบ (Actors)</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800 border border-rose-200">Admin</span>
                  <div>
                    <strong>ผู้ดูแลระบบงานอาคารสถานที่:</strong> มอบหมายงานช่าง, กำหนดวันเสร็จ, จัดการบัญชีผู้ใช้, ดูภาพรวมแดชบอร์ดสถิติ, ส่งออก CSV
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800 border border-blue-200">Teacher</span>
                  <div>
                    <strong>ครูและบุคลากรโรงเรียน:</strong> สร้างใบแจ้งซ่อม, แนบภาพความเสียหาย, ติดตามเฉพาะงานที่ตนเองแจ้ง, พิมพ์ใบแจ้งซ่อม A4, เพิ่มความคิดเห็น
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">Technician</span>
                  <div>
                    <strong>ช่างซ่อมบำรุงโรงเรียน:</strong> ดูเฉพาะงานที่ได้รับมอบหมาย, กดยืนยันเริ่มซ่อม (Start), บันทึกผลงาน ค่าใช้จ่าย และแนบภาพหลังซ่อม (Complete)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USE CASE & WORKFLOW */}
        {activeSubTab === 'usecase' && (
          <div className="space-y-6 text-xs sm:text-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">แผนภาพจำแนก Use Case ตามบทบาท</h3>
              <p className="text-slate-600 mb-4">
                ระบบแบ่ง Use Case ตามหลัก Single Responsibility Principle และ Role-Based Access Control (RBAC):
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Admin */}
                <div className="border border-rose-200 rounded-2xl p-4 bg-rose-50/30 space-y-2">
                  <div className="font-bold text-rose-800 text-sm border-b border-rose-200 pb-2">
                    👨‍💼 Admin Use Cases
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    <li>• ดูรายการใบแจ้งซ่อมทั้งหมดในโรงเรียน</li>
                    <li>• มอบหมายงานให้ช่าง (Assign Technician)</li>
                    <li>• กำหนดวันแล้วเสร็จ (Set Due Date)</li>
                    <li>• จัดการบัญชีผู้ใช้ (เพิ่ม/ระงับ/แก้ไข Role)</li>
                    <li>• ดูแดชบอร์ดสรุปสถิติและงบประมาณ</li>
                    <li>• ส่งออกข้อมูลใบแจ้งซ่อมเป็นไฟล์ CSV</li>
                  </ul>
                </div>

                {/* Teacher */}
                <div className="border border-blue-200 rounded-2xl p-4 bg-blue-50/30 space-y-2">
                  <div className="font-bold text-blue-800 text-sm border-b border-blue-200 pb-2">
                    👩‍🏫 Teacher Use Cases
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    <li>• สร้างใบแจ้งซ่อมใหม่ (Create Request)</li>
                    <li>• อัปโหลดภาพก่อนซ่อม (Before Photo)</li>
                    <li>• ติดตามสถานะงานของตนเอง (Track Status)</li>
                    <li>• พิมพ์ใบแจ้งซ่อมรูปแบบ A4 (Print Slip)</li>
                    <li>• เพิ่มความคิดเห็นประสานงาน (Comment)</li>
                    <li>• <em>ไม่อนุญาตให้ดูข้อมูลใบแจ้งของครูท่านอื่น</em></li>
                  </ul>
                </div>

                {/* Technician */}
                <div className="border border-amber-200 rounded-2xl p-4 bg-amber-50/30 space-y-2">
                  <div className="font-bold text-amber-800 text-sm border-b border-amber-200 pb-2">
                    🔧 Technician Use Cases
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    <li>• ดูเฉพาะงานที่ตนเองได้รับมอบหมาย</li>
                    <li>• กดยืนยันเริ่มดำเนินการซ่อม (Start Repair)</li>
                    <li>• บันทึกผลการซ่อมและอะไหล่ที่ใช้</li>
                    <li>• บันทึกค่าใช้จ่ายจริง (Cost in Baht)</li>
                    <li>• อัปโหลดภาพหลังซ่อมเสร็จ (After Photo)</li>
                    <li>• <em>ไม่อนุญาตให้แก้ไขงานที่มิได้รับมอบหมาย</em></li>
                  </ul>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Workflow State Machine (ลำดับสถานะงานซ่อม)</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 font-mono">
                <div className="flex flex-wrap items-center gap-2 font-sans font-semibold">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg border border-amber-300">
                    1. pending (รอรับเรื่อง)
                  </span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-lg border border-cyan-300">
                    2. accepted (รับเรื่องแล้ว)
                  </span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg border border-blue-300">
                    3. in_progress (กำลังซ่อม)
                  </span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300">
                    4. completed (ซ่อมเสร็จสิ้น)
                  </span>
                </div>
                <div className="text-slate-600 font-sans text-xs pt-2 border-t border-slate-200">
                  <strong>กฎการเปลี่ยนสถานะ (Invariants):</strong> ระบบไม่อนุญาตให้ข้ามขั้นตอน (เช่น จาก pending ไป completed โดยตรงจะถูกปฏิเสธด้วย `RepairTransitionError`) และเมื่อปิดงานเสร็จแล้วจะถือเป็น Terminal State ไม่สามารถแก้ไขได้
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NOUN EXTRACTION */}
        {activeSubTab === 'noun' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">การวิเคราะห์คำนาม (Noun Extraction Analysis)</h3>
            <p className="text-slate-600">
              จากการวิเคราะห์บริบทงานแจ้งซ่อมโรงเรียน สกัดคำนามเพื่อกำหนดเป็น Class, Attribute หรือ ละเว้น ดังตาราง:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold text-xs border-b border-slate-200">
                  <tr>
                    <th className="p-3">คำนามที่พบ (Noun)</th>
                    <th className="p-3">ผลการคัดเลือก</th>
                    <th className="p-3">คลาส / คุณสมบัติเป้าหมาย</th>
                    <th className="p-3">เหตุผลทางสถาปัตยกรรม (Justification)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">ผู้ใช้งาน / ครู / ช่าง / ผู้ดูแล</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Candidate Class</span></td>
                    <td className="p-3 font-mono text-blue-600">User</td>
                    <td className="p-3 text-slate-600">เป็น Entity หลักที่ระบุตัวตน สิทธิ์ และความรับผิดชอบในระบบ</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">ใบแจ้งซ่อม / รายการแจ้งซ่อม</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Candidate Class</span></td>
                    <td className="p-3 font-mono text-blue-600">RepairRequest</td>
                    <td className="p-3 text-slate-600">เป็น Aggregate Root หลัก ควบคุมวงจรชีวิตของงานซ่อมทั้งหมด</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">รูปภาพก่อนซ่อม / รูปภาพหลังซ่อม</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Candidate Class</span></td>
                    <td className="p-3 font-mono text-blue-600">RepairImage</td>
                    <td className="p-3 text-slate-600">มีคุณสมบัติเฉพาะตัว (พาธ, ประเภท before/after, วันที่อัปโหลด) สัมพันธ์แบบ Composition</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">ข้อความความคิดเห็น / ประสานงาน</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Candidate Class</span></td>
                    <td className="p-3 font-mono text-blue-600">Comment</td>
                    <td className="p-3 text-slate-600">มีผู้เขียนและเวลาสร้าง เป็นบันทึกการสื่อสาร One-to-Many</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">ประวัติการเปลี่ยนสถานะ</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Candidate Class</span></td>
                    <td className="p-3 font-mono text-blue-600">RepairStatusHistory</td>
                    <td className="p-3 text-slate-600">จำเป็นสำหรับ Audit Trail เพื่อบันทึกว่าใครเปลี่ยนสถานะเมื่อใด</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">เลขที่ใบแจ้ง (RP-YYYYMM-XXX)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Attribute</span></td>
                    <td className="p-3 font-mono text-slate-600">RepairRequest.request_no</td>
                    <td className="p-3 text-slate-600">เป็นรหัสอ้างอิงที่ไม่ซ้ำของใบแจ้งซ่อม</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">อาคาร / ห้อง / จุดติดตั้ง</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Attribute</span></td>
                    <td className="p-3 font-mono text-slate-600">RepairRequest.building, room</td>
                    <td className="p-3 text-slate-600">เป็นข้อมูลสถานที่ชำรุด</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">ค่าใช้จ่าย / งบประมาณ</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Attribute</span></td>
                    <td className="p-3 font-mono text-slate-600">RepairRequest.cost</td>
                    <td className="p-3 text-slate-600">เป็นตัวเลขทางการเงิน ใช้สรุปยอดในแดชบอร์ด</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">สถานะงาน (Pending, Accepted, ...)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">Enumeration</span></td>
                    <td className="p-3 font-mono text-purple-600">RequestStatus</td>
                    <td className="p-3 text-slate-600">เป็นชุดค่าคงที่ที่กำหนดไว้ล่วงหน้า ควบคุมด้วย State Machine</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CLASS DIAGRAM */}
        {activeSubTab === 'class' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">ผังคลาสไดอะแกรม (Class Diagram)</h3>
                <p className="text-xs text-slate-500">
                  แสดง Attribute, Method และความสัมพันธ์ Association, Composition และ Dependencies
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(classDiagramCode, 'class')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {copiedKey === 'class' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'class' ? 'คัดลอก Mermaid แล้ว' : 'คัดลอก Mermaid'}</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 overflow-x-auto flex justify-center">
              <div ref={mermaidRef} className="mermaid-container w-full flex justify-center" />
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs space-y-1 text-slate-700">
              <div className="font-bold text-blue-900">คำอธิบายความสัมพันธ์ใน Class Diagram:</div>
              <div>• <strong>Composition (สี่เหลี่ยมทึบ *--):</strong> `RepairRequest` ประกอบด้วย `RepairImage`, `Comment`, และ `RepairStatusHistory` หากลบใบแจ้งซ่อม รายการลูกจะถูกลบตามแบบ Cascade เพื่อป้องกันข้อมูลกำพร้า</div>
              <div>• <strong>Association (เส้นตรงลูกศร --&gt;):</strong> `User` มีความสัมพันธ์กับ `RepairRequest` สองบทบาท: เป็นผู้แจ้ง (reporter) และเป็นช่างผู้รับผิดชอบ (technician)</div>
            </div>
          </div>
        )}

        {/* TAB 5: SEQUENCE DIAGRAM */}
        {activeSubTab === 'sequence' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">ผังลำดับขั้นตอนการทำงาน (Sequence Diagrams)</h3>
                <p className="text-xs text-slate-500">
                  แสดงการส่งผ่าน Message ระหว่าง Actor, Controller, Service, Domain Entity และ Database
                </p>
              </div>
            </div>

            {/* Sequence 1 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  กรณีศึกษา 1: ครูสร้างใบแจ้งซ่อมใหม่ (Repair Creation Flow)
                </span>
                <button
                  onClick={() => copyToClipboard(sequenceCreateCode, 'seq1')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {copiedKey === 'seq1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>คัดลอก Mermaid</span>
                </button>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 overflow-x-auto flex justify-center">
                <div ref={mermaidRef} className="mermaid-container w-full flex justify-center" />
              </div>
            </div>

            {/* Sequence 2 Text */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  กรณีศึกษา 2: ช่างบันทึกผลการซ่อมและปิดงาน (Complete Repair Flow)
                </span>
                <button
                  onClick={() => copyToClipboard(sequenceCloseCode, 'seq2')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {copiedKey === 'seq2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>คัดลอก Mermaid</span>
                </button>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl text-slate-200 text-xs font-mono overflow-x-auto">
                <pre>{sequenceCloseCode}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ER DIAGRAM */}
        {activeSubTab === 'er' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">ผังโครงสร้างฐานข้อมูล (Entity-Relationship Diagram)</h3>
                <p className="text-xs text-slate-500">
                  ตารางฐานข้อมูล SQLite 5 ตาราง พร้อม Primary Key, Foreign Key และ Check Constraints
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(erDiagramCode, 'er')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {copiedKey === 'er' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'er' ? 'คัดลอก Mermaid แล้ว' : 'คัดลอก Mermaid'}</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 overflow-x-auto flex justify-center">
              <div ref={mermaidRef} className="mermaid-container w-full flex justify-center" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>ตาราง users:</strong> เก็บข้อมูลผู้ใช้ รหัสผ่านแฮช และบทบาท โดยจำกัด `CHECK(role IN ('admin', 'teacher', 'technician'))`
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>ตาราง repair_requests:</strong> เชื่อม FK กับ `users.id` พร้อมกฎ `ON DELETE CASCADE` และ `ON DELETE SET NULL` สำหรับช่าง
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: 5 OOP PILLARS */}
        {activeSubTab === 'oop' && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                การประยุกต์ใช้ 5 เสาหลักของ Object-Oriented Programming (OOP)
              </h3>
              <p className="text-slate-600">
                ระบบ SchoolFix มิได้เพียงแค่สร้าง Class ทิ้งไว้ แต่มีการนำหลัก OOP มาเป็นหัวใจสำคัญในการบังคับใช้กฎระเบียบธุรกิจ (Business Rules):
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Encapsulation */}
              <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>Encapsulation (การห่อหุ้มและการซ่อนข้อมูล)</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  • <strong>User Password:</strong> ไม่มีการเปิดเผย `password_hash` ออกไปภายนอก ควบคุมการแฮชและตรวจสอบผ่านเมธอด `set_password()` และ `check_password()`
                </p>
                <p className="text-slate-700 text-xs leading-relaxed">
                  • <strong>State Transitions:</strong> โมเดล `RepairRequest` มีเมธอด `assign_to_technician()`, `start_repair()`, `complete_repair()` ที่ตรวจสอบ Invariants ป้องกันไม่ให้โค้ดส่วนอื่นเปลี่ยนสถานะมั่วซั่ว
                </p>
              </div>

              {/* 2. Abstraction */}
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>Abstraction (การซ่อนความซับซ้อน)</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  • แยกชั้นการทำงาน 3-Tier Layer: <strong>Routes (UI/HTTP)</strong> &rarr; <strong>Services (Business Rules)</strong> &rarr; <strong>Repositories (Database)</strong>
                </p>
                <p className="text-slate-700 text-xs leading-relaxed">
                  • Route ไม่ต้องรู้ว่า SQL Query ทำงานอย่างไร เรียกใช้เพียง `repair_service.complete_repair()` ทำให้โค้ดอ่านง่ายและทดสอบได้ง่าย
                </p>
              </div>

              {/* 3. Inheritance */}
              <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-2">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>Inheritance (การสืบทอดคุณสมบัติ)</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  • คลาส `User` สืบทอดจาก `flask_login.UserMixin` เพื่อนำพฤติกรรม `is_authenticated`, `is_active` มาใช้งานกับระบบ Session อย่างเป็นธรรมชาติ
                </p>
                <p className="text-slate-700 text-xs leading-relaxed">
                  • ข้อยกเว้นทางธุรกิจ `RepairTransitionError` และ `RepairAuthorizationError` สืบทอดจากคลาสแม่ `Exception`
                </p>
              </div>

              {/* 4. Polymorphism */}
              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs">4</span>
                  <span>Polymorphism (การพ้องรูป)</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  • คลาสนามธรรม `BaseReportExporter` นิยามอินเตอร์เฟซเมธอด `export()`
                </p>
                <p className="text-slate-700 text-xs leading-relaxed">
                  • คลาสลูก `CsvReportExporter` ส่งออกเป็น CSV (UTF-8 with BOM) รองรับการขยายไปเป็น `PdfReportExporter` ในอนาคตโดยไม่ต้องแก้โค้ด Service Layer (Open/Closed Principle)
                </p>
              </div>

            </div>

            {/* 5. Composition */}
            <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">5</span>
                <span>Composition (การประกอบกันของวัตถุ - Has-a Relationship)</span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                • คลาส `RepairRequest` ไม่ได้สืบทอดจาก Image หรือ Comment แต่มีส่วนประกอบ (Composition):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-indigo-100 font-mono">
                  • RepairRequest <strong>has-many</strong> RepairImages
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-indigo-100 font-mono">
                  • RepairRequest <strong>has-many</strong> Comments
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-indigo-100 font-mono">
                  • RepairRequest <strong>has-many</strong> StatusHistory
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
