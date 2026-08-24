export type RepositoryBranch = {
  name: string
}

export type RepositoryTreeItem = {
  path: string
  type: 'blob' | 'tree'
  size?: number
}

function repositoryUrl(owner: string, name: string, path: string) {
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}${path}`
}

async function githubRequest<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  })

  if (!response.ok) {
    const message = response.status === 403
      ? 'GitHub API rate limit exceeded. Please try again later or add credentials.'
      : `GitHub request failed (${response.status}).`
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function getRepositoryBranches(owner: string, name: string): Promise<RepositoryBranch[]> {
  return githubRequest<RepositoryBranch[]>(repositoryUrl(owner, name, '/branches?per_page=30'))
}

export async function getRepositoryTree(owner: string, name: string, branch: string): Promise<RepositoryTreeItem[]> {
  const result = await githubRequest<{ tree?: RepositoryTreeItem[] }>(
    repositoryUrl(owner, name, `/git/trees/${encodeURIComponent(branch)}?recursive=1`),
  )
  return result.tree ?? []
}

export async function getRepositoryFile(owner: string, name: string, branch: string, path: string): Promise<string> {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  const url = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/${encodeURIComponent(branch)}/${encodedPath}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to retrieve file contents (${response.status}).`)
  }

  return response.text()
}