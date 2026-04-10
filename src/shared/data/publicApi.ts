import type {
  ApiListResponse,
  ApiPagedResponse,
  AppSetting,
  ArticleDetail,
  ArticleSummary,
  FileItem,
  MediaItem,
  Question,
  Website,
} from './types'

const DEV_DEFAULT_BASE_URL = '/ai-api/open/'
const PROD_DEFAULT_BASE_URL = 'https://www.ganjianping.com/ai-api/open/'

const fallbackBaseUrl = import.meta.env.DEV ? DEV_DEFAULT_BASE_URL : PROD_DEFAULT_BASE_URL

const configuredBaseUrl = (import.meta.env.VITE_PUBLIC_API_BASE_URL as string | undefined) ?? fallbackBaseUrl

const API_BASE_URL = configuredBaseUrl.endsWith('/') ? configuredBaseUrl : `${configuredBaseUrl}/`

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${API_BASE_URL}${normalizedPath}`
}

const createUrl = (path: string, searchParams?: Record<string, string | number | undefined>): string => {
  const baseUrl = buildUrl(path)

  if (!searchParams) {
    return baseUrl
  }

  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value))
    }
  })

  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

const fetchJson = async <TResponse>(input: string, init?: RequestInit): Promise<TResponse> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Accept': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Request failed with status ${response.status}: ${errorText}`)
  }

  return (await response.json()) as TResponse
}

export const getAppSettings = () =>
  fetchJson<ApiListResponse<AppSetting[]>>(createUrl('app-settings'))

export const getWebsites = (
  page = 0,
  size = 60,
  search?: string,
  tag?: string,
  lang?: string,
  signal?: AbortSignal,
) =>
  // Add optional search and tag query params so callers can request server-side filtering
  fetchJson<ApiPagedResponse<Website>>(createUrl('websites', { page, size, search, tag, lang }), { signal })

export const getQuestions = (
  page = 0,
  size = 60,
  search?: string,
  tag?: string,
  lang?: string,
  signal?: AbortSignal,
) =>
  fetchJson<ApiPagedResponse<Question>>(createUrl('questions', { page, size, search, tag, lang }), { signal })

export const getArticles = (page = 0, size = 60, lang?: string, signal?: AbortSignal) =>
  fetchJson<ApiPagedResponse<ArticleSummary>>(createUrl('articles', { page, size, lang }), { signal })

export const getArticleById = (id: string) =>
  fetchJson<ApiListResponse<ArticleDetail>>(createUrl(`articles/${id}`))

export const getImages = (page = 0, size = 60, lang?: string, signal?: AbortSignal) =>
  fetchJson<ApiPagedResponse<MediaItem>>(createUrl('images', { page, size, lang }), { signal })

export const getVideos = (page = 0, size = 60, lang?: string, signal?: AbortSignal) =>
  fetchJson<ApiPagedResponse<MediaItem>>(createUrl('videos', { page, size, lang }), { signal })

export const getAudios = (page = 0, size = 60, lang?: string, signal?: AbortSignal) =>
  fetchJson<ApiPagedResponse<MediaItem>>(createUrl('audios', { page, size, lang }), { signal })

export const getFiles = (page = 0, size = 60, lang?: string, signal?: AbortSignal) =>
  fetchJson<ApiPagedResponse<FileItem>>(createUrl('files', { page, size, lang }), { signal })
