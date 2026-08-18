import type { AnalysisResponse, AnalyzeRepositoryPayload, ChatResponse, RepositoryIndexStatus, SettingsPayload } from '../../types/analysis'
import { apiClient } from './client'

export async function analyzeRepository(
  payload: AnalyzeRepositoryPayload,
): Promise<AnalysisResponse> {
  const response = await apiClient.post<AnalysisResponse>('/api/analyze', payload)
  return response.data
}

export async function getSettings(): Promise<SettingsPayload> {
  const response = await apiClient.get<SettingsPayload>('/api/settings')
  return response.data
}

export async function saveSettings(payload: SettingsPayload): Promise<SettingsPayload> {
  const response = await apiClient.put<SettingsPayload>('/api/settings', payload)
  return response.data
}

export async function testProvider(provider: string): Promise<{ ok: boolean; provider: string; message: string }> {
  const response = await apiClient.post('/api/settings/test-provider', { provider })
  return response.data
}

export async function getRepositoryIndexStatus(): Promise<RepositoryIndexStatus> {
  const response = await apiClient.get<RepositoryIndexStatus>('/api/repository/status')
  return response.data
}

export async function reindexRepository(): Promise<RepositoryIndexStatus> {
  const response = await apiClient.post<RepositoryIndexStatus>('/api/repository/reindex')
  return response.data
}

export async function chatWithRepository(question: string): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/api/chat', { question })
  return response.data
}
