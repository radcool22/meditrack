import { supabase } from '@/lib/supabase';
import type { Report, ChatMessage } from '@/types';

export async function uploadReport(
  profileId: string,
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
): Promise<Report> {
  const fileExt = fileName.split('.').pop()?.toLowerCase() || 'bin';
  const storagePath = `reports/${profileId}/${crypto.randomUUID()}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('medical-reports')
    .upload(storagePath, fileBuffer, {
      contentType: fileType,
      upsert: false,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // Save report metadata
  const { data, error } = await supabase
    .from('reports')
    .insert({
      profile_id: profileId,
      file_url: storagePath,
      file_name: fileName,
      file_type: fileType,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReports(profileId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getReportById(reportId: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) return null;
  return data;
}

export async function getSignedFileUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('medical-reports')
    .createSignedUrl(storagePath, 3600); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}

export async function downloadReportFile(storagePath: string): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from('medical-reports')
    .download(storagePath);

  if (error) throw error;
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function updateReport(
  reportId: string,
  updates: Partial<Pick<Report, 'extracted_text' | 'analysis' | 'report_type'>>
): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReport(reportId: string): Promise<void> {
  // Get report to find file path
  const report = await getReportById(reportId);
  if (!report) throw new Error('Report not found');

  // Delete file from storage
  await supabase.storage
    .from('medical-reports')
    .remove([report.file_url]);

  // Delete report record (cascades to chat_messages)
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId);

  if (error) throw error;
}

export async function saveChatMessage(
  reportId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ report_id: reportId, role, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChatMessages(reportId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function verifyReportOwnership(
  reportId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('reports')
    .select('profiles!inner(user_id)')
    .eq('id', reportId)
    .eq('profiles.user_id', userId)
    .single();

  return !!data;
}
