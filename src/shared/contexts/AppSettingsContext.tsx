import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getAppSettings } from '../data/publicApi'
import type { AppSetting } from '../data/types'
import { useUIContext, type LanguageCode } from './UIContext'
import { useT } from '../i18n'

interface AppSettingsContextValue {
  settings: AppSetting[]
  loading: boolean
  error: string | null
  getValue: (name: string, lang?: LanguageCode) => string | undefined
  getValues: (name: string) => Partial<Record<LanguageCode, string>>
  getTags: (name: string, lang?: LanguageCode) => string[]
  reload: () => Promise<void>
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined)

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useUIContext()
  const t = useT()
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Try to load cached settings from localStorage first for instant availability
      const cacheKey = 'gjpb_app_settings'
      const fetchedFlag = 'gjpb_app_settings_fetched'

      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const parsed: AppSetting[] = JSON.parse(cached)
          setSettings(parsed)
        }
      } catch (err) {
        // JSON parse error or localStorage access error: ignore and continue to fetch
        // eslint-disable-next-line no-console
        console.warn('Failed to read cached app settings from localStorage', err)
      }

      // Call the API only once per page load (use sessionStorage to track this)
      if (!sessionStorage.getItem(fetchedFlag)) {
        const response = await getAppSettings()
        setSettings(response.data)

        try {
          localStorage.setItem(cacheKey, JSON.stringify(response.data))
        } catch (err) {
          // Ignore storage write errors
          // eslint-disable-next-line no-console
          console.warn('Failed to write app settings to localStorage', err)
        }

        try {
          sessionStorage.setItem(fetchedFlag, '1')
        } catch {
          // ignore
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('failed_to_load')
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  const groupedSettings = useMemo(() => {
    const groups = new Map<string, Map<LanguageCode, string>>()

    settings.forEach((setting) => {
      if (!groups.has(setting.name)) {
        groups.set(setting.name, new Map())
      }

      groups.get(setting.name)?.set(setting.lang, setting.value)
    })

    return groups
  }, [settings])

  const getValue = useCallback(
    (name: string, lang: LanguageCode = language) => groupedSettings.get(name)?.get(lang),
    [groupedSettings, language],
  )

  const getValues = useCallback(
    (name: string) => {
      const map = groupedSettings.get(name)

      if (!map) {
        return {}
      }

      const result: Partial<Record<LanguageCode, string>> = {}
      map.forEach((value, langKey) => {
        result[langKey] = value
      })
      return result
    },
    [groupedSettings],
  )

  const getTags = useCallback(
    (name: string, lang: LanguageCode = language) => {
      const value = getValue(name, lang)

      if (!value) {
        return []
      }

      return value
        .replace(/[“”]/g, '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    },
    [getValue, language],
  )

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      loading,
      error,
      getValue,
      getValues,
      getTags,
      // reload should force a fresh fetch and update localStorage
      reload: async () => {
        setLoading(true)
        setError(null)
        try {
          const response = await getAppSettings()
          setSettings(response.data)
          try {
            localStorage.setItem('gjpb_app_settings', JSON.stringify(response.data))
          } catch (err) {
            // ignore
            // eslint-disable-next-line no-console
            console.warn('Failed to write app settings to localStorage', err)
          }
          try {
            sessionStorage.setItem('gjpb_app_settings_fetched', '1')
          } catch {
            // ignore
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : t('failed_to_load')
          setError(message)
        } finally {
          setLoading(false)
        }
      },
    }),
    [settings, loading, error, getValue, getValues, getTags, loadSettings],
  )

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext)

  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider')
  }

  return context
}
