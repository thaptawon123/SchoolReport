import { User, RepairRequest, ProblemType, UrgencyLevel, RequestStatus, UserRole } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'somchai_admin',
    fullname: 'นายสมชาย ดูแลดี',
    email: 'somchai.admin@school.ac.th',
    role: 'admin',
    department: 'ฝ่ายบริหารงานทั่วไปและอาคารสถานที่',
    phone: '081-234-5678',
    is_active: true
  },
  {
    id: 2,
    username: 'teacher_wilai',
    fullname: 'ครูวิไล สอนศิลป์',
    email: 'wilai.art@school.ac.th',
    role: 'teacher',
    department: 'กลุ่มสาระการเรียนรู้ศิลปะ',
    phone: '082-345-6789',
    is_active: true
  },
  {
    id: 3,
    username: 'teacher_nopadol',
    fullname: 'ครูนภดล วิทยา',
    email: 'nopadol.sci@school.ac.th',
    role: 'teacher',
    department: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์',
    phone: '083-456-7890',
    is_active: true
  },
  {
    id: 4,
    username: 'tech_prasert',
    fullname: 'นายประเสริฐ ซ่อมไว',
    email: 'prasert.fix@school.ac.th',
    role: 'technician',
    department: 'หน่วยงานซ่อมบำรุงไฟฟ้าและปรับอากาศ',
    phone: '084-567-8901',
    is_active: true
  },
  {
    id: 5,
    username: 'tech_kamol',
    fullname: 'นายกมล ไอทีเทพ',
    email: 'kamol.it@school.ac.th',
    role: 'technician',
    department: 'ศูนย์เทคโนโลยีและคอมพิวเตอร์',
    phone: '085-678-9012',
    is_active: true
  }
];

export const PROBLEM_TYPE_LABELS: Record<ProblemType, string> = {
  electrical: 'ระบบไฟฟ้าและแสงสว่าง',
  aircon: 'เครื่องปรับอากาศและพัดลม',
  computer: 'คอมพิวเตอร์และอุปกรณ์ไอที',
  furniture: 'โต๊ะ เก้าอี้ และเฟอร์นิเจอร์',
  other: 'อื่นๆ / ทั่วไป'
};

export const URGENCY_LABELS: Record<UrgencyLevel, { label: string; badge: string }> = {
  low: { label: 'ปกติ (Low)', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  medium: { label: 'ปานกลาง (Medium)', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'เร่งด่วน (High)', badge: 'bg-rose-50 text-rose-700 border-rose-200' }
};

export const STATUS_LABELS: Record<RequestStatus, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: 'รอรับเรื่อง', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  accepted: { label: 'รับเรื่องแล้ว', bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  in_progress: { label: 'กำลังดำเนินการ', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  completed: { label: 'ซ่อมเสร็จสิ้น', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' }
};

export const ROLE_LABELS: Record<UserRole, { label: string; badge: string }> = {
  admin: { label: 'ผู้ดูแลระบบ (Admin)', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  teacher: { label: 'ครู/บุคลากร (Teacher)', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  technician: { label: 'ช่างซ่อมบำรุง (Technician)', badge: 'bg-amber-100 text-amber-800 border-amber-200' }
};

export const INITIAL_REPAIRS: RepairRequest[] = [
  {
    id: 1,
    request_no: 'RP-202510-001',
    user_id: 2,
    reporter_name: 'ครูวิไล สอนศิลป์',
    reporter_department: 'กลุ่มสาระการเรียนรู้ศิลปะ',
    building: 'อาคาร 2 (เฉลิมพระเกียรติ)',
    room: 'ห้อง 224',
    problem_type: 'aircon',
    description: 'เครื่องปรับอากาศไม่เย็น มีน้ำหยดลงบนโต๊ะนักเรียน และมีเสียงพัดลมสั่นดังผิดปกติรบกวนการเรียนการสอน',
    urgency: 'high',
    status: 'completed',
    assigned_to: 4,
    technician_name: 'นายประเสริฐ ซ่อมไว',
    due_date: '2025-10-14',
    completion_date: '2025-10-15 15:30:00',
    cost: 450,
    result: 'ทำการล้างแอร์ เติมน้ำยา R32 และเปลี่ยนท่อน้ำทิ้งที่อุดตัน ทดสอบเดินเครื่อง 30 นาที อุณหภูมิลดลงปกติ ไม่มีน้ำหยดแล้ว',
    created_at: '2025-10-12 09:15:00',
    updated_at: '2025-10-15 15:30:00',
    images: [
      {
        id: 1,
        repair_id: 1,
        image_type: 'before',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        caption: 'ภาพคราบน้ำหยดและฟิลเตอร์อุดตัน',
        uploaded_at: '2025-10-12 09:15:00'
      },
      {
        id: 2,
        repair_id: 1,
        image_type: 'after',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'ล้างทำความสะอาดและต่อท่อน้ำทิ้งใหม่เรียบร้อย',
        uploaded_at: '2025-10-15 15:30:00'
      }
    ],
    comments: [
      {
        id: 1,
        repair_id: 1,
        user_id: 4,
        user_name: 'นายประเสริฐ ซ่อมไว',
        user_role: 'technician',
        comment: 'รับทราบครับ กำลังเตรียมชุดล้างแอร์และบันไดยาวขึ้นไปช่วงบ่าย',
        created_at: '2025-10-13 11:20:00'
      },
      {
        id: 2,
        repair_id: 1,
        user_id: 2,
        user_name: 'ครูวิไล สอนศิลป์',
        user_role: 'teacher',
        comment: 'ขอบคุณมากค่ะ วันนี้แอร์เย็นสบาย นักเรียนเรียนได้ปกติแล้ว',
        created_at: '2025-10-15 16:05:00'
      }
    ],
    history: [
      {
        id: 1,
        repair_id: 1,
        old_status: null,
        new_status: 'pending',
        changed_by: 2,
        changed_by_name: 'ครูวิไล สอนศิลป์',
        remark: 'สร้างใบแจ้งซ่อมใหม่ในระบบ',
        created_at: '2025-10-12 09:15:00'
      },
      {
        id: 2,
        repair_id: 1,
        old_status: 'pending',
        new_status: 'accepted',
        changed_by: 1,
        changed_by_name: 'นายสมชาย ดูแลดี (Admin)',
        remark: 'มอบหมายงานให้ช่างประเสริฐ ซ่อมไว',
        created_at: '2025-10-12 10:30:00'
      },
      {
        id: 3,
        repair_id: 1,
        old_status: 'accepted',
        new_status: 'in_progress',
        changed_by: 4,
        changed_by_name: 'นายประเสริฐ ซ่อมไว (Technician)',
        remark: 'ช่างเข้าตรวจสอบและเริ่มดำเนินการซ่อม',
        created_at: '2025-10-13 13:00:00'
      },
      {
        id: 4,
        repair_id: 1,
        old_status: 'in_progress',
        new_status: 'completed',
        changed_by: 4,
        changed_by_name: 'นายประเสริฐ ซ่อมไว (Technician)',
        remark: 'ปิดงานซ่อมเรียบร้อย ค่าใช้จ่าย 450.00 บาท',
        created_at: '2025-10-15 15:30:00'
      }
    ]
  },
  {
    id: 2,
    request_no: 'RP-202510-002',
    user_id: 2,
    reporter_name: 'ครูวิไล สอนศิลป์',
    reporter_department: 'กลุ่มสาระการเรียนรู้ศิลปะ',
    building: 'อาคารศิลปะ',
    room: 'ห้องปฏิบัติการวาดเขียน 1',
    problem_type: 'electrical',
    description: 'หลอดไฟนีออนเพดานกระพริบ 2 ราง และเต้ารับปลั๊กไฟติดผนังด้านหน้าห้องไม่มีกระแสไฟ เสียบโปรเจกเตอร์ไม่ได้',
    urgency: 'medium',
    status: 'in_progress',
    assigned_to: 4,
    technician_name: 'นายประเสริฐ ซ่อมไว',
    due_date: '2025-10-18',
    completion_date: null,
    cost: 0,
    result: null,
    created_at: '2025-10-14 13:40:00',
    updated_at: '2025-10-15 09:00:00',
    images: [
      {
        id: 3,
        repair_id: 2,
        image_type: 'before',
        image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
        caption: 'ภาพรางหลอดไฟที่ดับและกระพริบ',
        uploaded_at: '2025-10-14 13:40:00'
      }
    ],
    comments: [
      {
        id: 3,
        repair_id: 2,
        user_id: 4,
        user_name: 'นายประเสริฐ ซ่อมไว',
        user_role: 'technician',
        comment: 'เบิกหลอด LED T8 และเต้ารับใหม่จากพัสดุเรียบร้อยแล้ว กำลังขึ้นไปเปลี่ยนครับ',
        created_at: '2025-10-15 09:10:00'
      }
    ],
    history: [
      {
        id: 5,
        repair_id: 2,
        old_status: null,
        new_status: 'pending',
        changed_by: 2,
        changed_by_name: 'ครูวิไล สอนศิลป์',
        remark: 'สร้างใบแจ้งซ่อมใหม่ในระบบ',
        created_at: '2025-10-14 13:40:00'
      },
      {
        id: 6,
        repair_id: 2,
        old_status: 'pending',
        new_status: 'accepted',
        changed_by: 1,
        changed_by_name: 'นายสมชาย ดูแลดี (Admin)',
        remark: 'มอบหมายช่างประเสริฐ ซ่อมไว',
        created_at: '2025-10-14 14:15:00'
      },
      {
        id: 7,
        repair_id: 2,
        old_status: 'accepted',
        new_status: 'in_progress',
        changed_by: 4,
        changed_by_name: 'นายประเสริฐ ซ่อมไว (Technician)',
        remark: 'เริ่มตรวจเช็คระบบไฟฟ้าและเบิกอะไหล่',
        created_at: '2025-10-15 09:00:00'
      }
    ]
  },
  {
    id: 3,
    request_no: 'RP-202510-003',
    user_id: 3,
    reporter_name: 'ครูนภดล วิทยา',
    reporter_department: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์',
    building: 'อาคารวิทยาศาสตร์',
    room: 'ห้องคอมพิวเตอร์ 3',
    problem_type: 'computer',
    description: 'เครื่องคอมพิวเตอร์ประจำโต๊ะครูเปิดไม่ติด พาวเวอร์ซัพพลายมีกลิ่นไหม้ หน้าจอขึ้น No Signal',
    urgency: 'high',
    status: 'accepted',
    assigned_to: 5,
    technician_name: 'นายกมล ไอทีเทพ',
    due_date: '2025-10-17',
    completion_date: null,
    cost: 0,
    result: null,
    created_at: '2025-10-15 08:30:00',
    updated_at: '2025-10-15 10:00:00',
    images: [],
    comments: [
      {
        id: 4,
        repair_id: 3,
        user_id: 5,
        user_name: 'นายกมล ไอทีเทพ',
        user_role: 'technician',
        comment: 'ตรวจเช็คเบื้องต้น คาดว่า PSU เสีย จะนำตัวสำรอง 550W ไปสับเปลี่ยนให้ช่วงบ่ายครับ',
        created_at: '2025-10-15 10:15:00'
      }
    ],
    history: [
      {
        id: 8,
        repair_id: 3,
        old_status: null,
        new_status: 'pending',
        changed_by: 3,
        changed_by_name: 'ครูนภดล วิทยา',
        remark: 'แจ้งซ่อมคอมพิวเตอร์เปิดไม่ติด',
        created_at: '2025-10-15 08:30:00'
      },
      {
        id: 9,
        repair_id: 3,
        old_status: 'pending',
        new_status: 'accepted',
        changed_by: 1,
        changed_by_name: 'นายสมชาย ดูแลดี (Admin)',
        remark: 'มอบหมายช่างกมล ไอทีเทพ',
        created_at: '2025-10-15 10:00:00'
      }
    ]
  },
  {
    id: 4,
    request_no: 'RP-202510-004',
    user_id: 3,
    reporter_name: 'ครูนภดล วิทยา',
    reporter_department: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์',
    building: 'อาคาร 1 (ตึกอำนวยการ)',
    room: 'ห้องพักครูวิทย์ 105',
    problem_type: 'furniture',
    description: 'ขาเก้าอี้หมุนสำนักงานหัก 1 ขา และรางลิ้นชักโต๊ะทำงานหลุด ไม่สามารถเลื่อนปิดได้',
    urgency: 'low',
    status: 'pending',
    assigned_to: null,
    technician_name: undefined,
    due_date: null,
    completion_date: null,
    cost: 0,
    result: null,
    created_at: '2025-10-16 08:00:00',
    updated_at: '2025-10-16 08:00:00',
    images: [],
    comments: [],
    history: [
      {
        id: 10,
        repair_id: 4,
        old_status: null,
        new_status: 'pending',
        changed_by: 3,
        changed_by_name: 'ครูนภดล วิทยา',
        remark: 'สร้างใบแจ้งซ่อมใหม่ในระบบ',
        created_at: '2025-10-16 08:00:00'
      }
    ]
  },
  {
    id: 5,
    request_no: 'RP-202510-005',
    user_id: 2,
    reporter_name: 'ครูวิไล สอนศิลป์',
    reporter_department: 'กลุ่มสาระการเรียนรู้ศิลปะ',
    building: 'อาคารหอประชุมใหญ่',
    room: 'ห้องควบคุมระบบเสียง ชั้นลอย',
    problem_type: 'other',
    description: 'กลอนประตูด้านข้างชำรุด หลวมหลุด ไม่สามารถล็อคจากด้านในได้ เกรงว่าอุปกรณ์เสียงจะสูญหาย',
    urgency: 'medium',
    status: 'pending',
    assigned_to: null,
    technician_name: undefined,
    due_date: null,
    completion_date: null,
    cost: 0,
    result: null,
    created_at: '2025-10-16 10:15:00',
    updated_at: '2025-10-16 10:15:00',
    images: [],
    comments: [],
    history: [
      {
        id: 11,
        repair_id: 5,
        old_status: null,
        new_status: 'pending',
        changed_by: 2,
        changed_by_name: 'ครูวิไล สอนศิลป์',
        remark: 'สร้างใบแจ้งซ่อมกลอนประตูหอประชุม',
        created_at: '2025-10-16 10:15:00'
      }
    ]
  }
];
