import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getAppSettings } from '../data/openApi'
import type { AppSetting } from '../data/types'
import type { LanguageCode } from './UIContext'
import { useUIContext } from './useUIContext'
import { useT } from '../i18n'
import { AppSettingsContext, type AppSettingsContextValue } from './appSettingsContextCore'

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
      const cacheKey = 'gjpapp_settings'
      const fetchedFlag = 'gjpapp_settings_fetched'

      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const parsed: AppSetting[] = JSON.parse(cached)
          setSettings(parsed)
        }
      } catch {
        // JSON parse error or localStorage access error: ignore and continue to fetch.
      }

      // Call the API only once per page load (use sessionStorage to track this)
      if (!sessionStorage.getItem(fetchedFlag)) {
        const response = await getAppSettings()
        setSettings(response.data)

        try {
          localStorage.setItem(cacheKey, JSON.stringify(response.data))
        } catch {
          // Ignore storage write errors.
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
  }, [t])

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
            localStorage.setItem('gjpapp_settings', JSON.stringify(response.data))
          } catch {
            // ignore
          }
          try {
            sessionStorage.setItem('gjpapp_settings_fetched', '1')
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
    [settings, loading, error, getValue, getValues, getTags, t],
  )

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}
