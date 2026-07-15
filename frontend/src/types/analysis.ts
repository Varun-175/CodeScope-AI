export type RepositoryLanguage = {
  language: string
  lines: number
}

export type RepositoryMetadata = {
  name: string
  owner: string
  branch: string
  primary_language: string
  languages: RepositoryLanguage[]
  framework: string
  files: number
  directories: number
  extensions: Record<string, number>
  functions: number
  classes: number
  supported_files: number
  parsed_files: number
  lines_of_code: number
  readme: string
  license: string
  entry_points: string[]
  largest_file: string
  largest_file_lines: number
  large_files?: Array<{ path: string; lines: number }>
  most_imported_module: string
  import_counts?: Array<{ module: string; count: number }>
  folder_structure: Array<{ path: string; files: number; directories: number }>
  directory_metrics?: Array<{ path: string; files: number; lines: number }>
  has_tests: boolean
  analysis_time: number
}

export type HealthDetails = {
  reasons?: Array<{ points: number; reason: string }>
  largest_file_lines: number
  files: number
  functions: number
  classes: number
  source: string
}

export type RepositoryHealth = {
  score: number
  status: string
  details: HealthDetails
}

export type RepositorySummary = {
  overview: string
  technologies: string[]
  purpose: string
  complexity: string
  assessment: string
}

export type RepositoryDna = {
  project_type: string
  framework: string
  architecture: string
  primary_language: string
  repository_size: string
  maturity: string
  confidence: number
}

export type ArchitectureAnalysis = {
  pattern: string
  layers: string[]
  modules: string[]
  entry_points: string[]
}

export type RepositoryRisk = {
  path?: string
  lines?: number
  severity?: string
  reason?: string
  points?: number
}

export type RepositoryRisks = {
  critical: RepositoryRisk[]
  warnings: RepositoryRisk[]
  largest_files: RepositoryRisk[]
  complexity_hotspots: RepositoryRisk[]
}

export type DependencyInfo = {
  name: string
  version: string
  source: string
}

export type DependencyHealth = {
  total_dependencies: number
  package_manager?: string
  dependency_source?: string
  framework?: string
  top_dependencies?: DependencyInfo[]
  detected: DependencyInfo[]
  healthy: DependencyInfo[]
  unknown: DependencyInfo[]
}

export type AnalysisResponse = {
  repository: RepositoryMetadata
  health: RepositoryHealth
  summary: RepositorySummary
  dna: RepositoryDna
  architecture: ArchitectureAnalysis
  risks: RepositoryRisks
  dependency_health: DependencyHealth
}

export type AnalyzeRepositoryPayload = {
  repo_url: string
  branch?: string
}
