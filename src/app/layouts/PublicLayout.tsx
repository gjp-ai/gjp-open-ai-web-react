import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Footer } from '../../shared/components/Footer'
import { LanguageToggle } from '../../shared/ui/LanguageToggle'
import { ThemeToggle } from '../../shared/ui/ThemeToggle'
import { ThemeColorPicker } from '../../shared/ui/ThemeColorPicker'
import { useAppSettings } from '../../shared/contexts/useAppSettings'
import { useUIContext } from '../../shared/contexts/useUIContext'

const sectionLinks = [
  { path: '/websites', label: { EN: 'Websites', ZH: '网站' }, tagsKey: 'website_tags' },
  { path: '/questions', label: { EN: 'Q&A', ZH: '问答' }, tagsKey: 'question_tags' },
  { path: '/articles', label: { EN: 'Articles', ZH: '文章' }, tagsKey: 'article_tags' },
  { path: '/images', label: { EN: 'Images', ZH: '图片' }, tagsKey: 'image_tags' },
  { path: '/videos', label: { EN: 'Videos', ZH: '视频' }, tagsKey: 'video_tags' },
]

export const PublicLayout = () => {
  const location = useLocation()
  const { getTags } = useAppSettings()
  const { language } = useUIContext()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const renderIcon = (key: string) => {
    switch (key) {
      case 'website_tags':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15 15 0 010 20" />
          </svg>
        )
      case 'question_tags':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )
      case 'article_tags':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15V6a2 2 0 00-2-2H7L3 6v9a2 2 0 002 2h14a2 2 0 002-2z" />
            <path d="M7 7h8M7 11h8" />
          </svg>
        )
      case 'image_tags':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )
      case 'audio_tags':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M9 9v6a3 3 0 006 0V9" />
          </svg>
        )
      case 'video_tags':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="2" y="5" width="15" height="14" rx="2" />
            <path d="M23 7l-6 5 6 5V7z" />
          </svg>
        )
      case 'file_tags':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="layout">
      <header className="site-header">
        {/* Hamburger menu button (mobile only) */}
        <button
          type="button"
          className="site-header__menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        <NavLink to="/websites" className="site-logo">
          <img src={`${import.meta.env.BASE_URL}favicon.ico`} alt="Site logo" className="site-logo__img" />
        </NavLink>

        {/* Desktop navigation */}
        <nav className="site-header__sections" aria-label="Main navigation">
          {sectionLinks.map((link) => {
            const tags = getTags(link.tagsKey)
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `section-link${isActive ? ' section-link--active' : ''}`}
                title={tags.length > 0 ? tags.join(', ') : undefined}
              >
                <span className="section-link__icon" aria-hidden>
                  {renderIcon(link.tagsKey)}
                </span>
                <span className="section-link__label">{link.label[language]}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          <ThemeColorPicker />
          <LanguageToggle />
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <nav className="mobile-menu" aria-label="Mobile navigation">
            <div className="mobile-menu__content">
              {sectionLinks.map((link) => {
                const tags = getTags(link.tagsKey)
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) => `mobile-menu__link${isActive ? ' mobile-menu__link--active' : ''}`}
                    title={tags.length > 0 ? tags.join(', ') : undefined}
                  >
                    <span className="mobile-menu__icon" aria-hidden>
                      {renderIcon(link.tagsKey)}
                    </span>
                    <span className="mobile-menu__label">{link.label[language]}</span>
                  </NavLink>
                )
              })}
            </div>
          </nav>
        </>
      )}

      <main className="layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
