import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark'
export type LanguageCode = 'EN' | 'ZH'
export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red'

interface UIContextValue {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  toggleLanguage: () => void
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const UIContext = createContext<UIContextValue | undefined>(undefined)

const THEME_STORAGE_KEY = 'gjp.theme'
const LANGUAGE_STORAGE_KEY = 'gjp.language'
const THEME_COLOR_STORAGE_KEY = 'gjp.themeColor'

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getPreferredLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') {
    return 'EN'
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null
  if (stored === 'EN' || stored === 'ZH') {
    return stored
  }

  const browserLanguage = window.navigator.language.toLowerCase()
  return browserLanguage.includes('zh') ? 'ZH' : 'EN'
}

const getPreferredThemeColor = (): ThemeColor => {
  if (typeof window === 'undefined') {
    return 'blue'
  }

  const stored = window.localStorage.getItem(THEME_COLOR_STORAGE_KEY) as ThemeColor | null
  if (stored === 'blue' || stored === 'purple' || stored === 'green' || stored === 'orange' || stored === 'red') {
    return stored
  }

  return 'blue'
}

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => getPreferredTheme())
  const [language, setLanguageState] = useState<LanguageCode>(() => getPreferredLanguage())
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => getPreferredThemeColor())
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    const root = window.document.documentElement
    root.dataset.theme = theme
    root.classList.remove('theme-light', 'theme-dark')
    root.classList.add(`theme-${theme}`)
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(THEME_COLOR_STORAGE_KEY, themeColor)
    const root = window.document.documentElement
    root.dataset.themeColor = themeColor
  }, [themeColor])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'EN' ? 'ZH' : 'EN'))
  }, [])

  const setThemeColor = useCallback((color: ThemeColor) => {
    setThemeColorState(color)
  }, [])

  const value = useMemo<UIContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      language,
      setLanguage,
      toggleLanguage,
      themeColor,
      setThemeColor,
      searchQuery,
      setSearchQuery,
    }),
    [theme, language, themeColor, searchQuery, setLanguage, setTheme, toggleLanguage, toggleTheme, setThemeColor, setSearchQuery],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export const useUIContext = () => {
  const context = useContext(UIContext)

  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider')
  }

  return context
}
