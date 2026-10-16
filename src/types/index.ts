export type UserRole = 'admin' | 'teacher' | 'technician';

export type ProblemType = 'electrical' | 'aircon' | 'computer' | 'furniture' | 'other';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type RequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed';

export interface User {
  id: number;
  username: string;
  fullname: string;
  email: string;
  role: UserRole;
  department: string;
  phone: string;
  is_active: boolean;
  avatar?: string;
}

export interface RepairImage {
  id: number;
  repair_id: number;
  image_type: 'before' | 'after';
  image_url: string;
  caption?: string;
  uploaded_at: string;
}

export interface Comment {
  id: number;
  repair_id: number;
  user_id: number;
  user_name: string;
  user_role: UserRole;
  comment: string;
  created_at: string;
}

export interface StatusHistory {
  id: number;
  repair_id: number;
  old_status: RequestStatus | null;
  new_status: RequestStatus;
  changed_by: number;
  changed_by_name: string;
  remark: string;
  created_at: string;
}

export interface RepairRequest {
  id: number;
  request_no: string;
  user_id: number;
  reporter_name: string;
  reporter_department: string;
  building: string;
  room: string;
  problem_type: ProblemType;
  description: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  assigned_to: number | null;
  technician_name?: string;
  due_date: string | null;
  completion_date: string | null;
  cost: number;
  result: string | null;
  created_at: string;
  updated_at: string;
  images: RepairImage[];
  comments: Comment[];
  history: StatusHistory[];
}
