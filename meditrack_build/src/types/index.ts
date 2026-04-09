export interface User {
  id: string;
  phone: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  avatar_url: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  profile_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  extracted_text: string | null;
  analysis: ReportAnalysis | null;
  report_type: string | null;
  created_at: string;
  signed_file_url?: string;
}

export interface ReportAnalysis {
  key_findings: string[];
  abnormal_values: AbnormalValue[];
  risk_flags: RiskFlag[];
  summary: string;
  recommendations: string[];
}

export interface AbnormalValue {
  parameter: string;
  value: string;
  normal_range: string;
  status: 'high' | 'low' | 'critical';
}

export interface RiskFlag {
  condition: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ChatMessage {
  id: string;
  report_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
