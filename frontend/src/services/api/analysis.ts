import type { AnalysisResponse, AnalyzeRepositoryPayload } from '../../types/analysis'
import { apiClient } from './client'

export async function analyzeRepository(
  payload: AnalyzeRepositoryPayload,
): Promise<AnalysisResponse> {
  const response = await apiClient.post<AnalysisResponse>('/api/analyze', payload)
  return response.data
}
