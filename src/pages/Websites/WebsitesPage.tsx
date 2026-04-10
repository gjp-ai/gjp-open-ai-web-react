import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { getWebsites } from '../../shared/data/publicApi'
import type { Website } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { useT } from '../../shared/i18n'
import { Pagination } from '../../shared/ui/Pagination'
import { WebsiteCard } from './components/WebsiteCard'
import { Toolbar } from '../../shared/components/Toolbar/Toolbar'
import './websites.css'

const normalizeText = (value: string) => value.toLowerCase()

const matchesSearch = (website: Website, query: string) => {
  if (!query) {
    return true
  }

  const text = normalizeText(query)
  const fields = [website.name, website.description ?? '', website.tags ?? '']
  return fields.some((field) => normalizeText(field).includes(text))
}

const hasTag = (website: Website, tag: string | null) => {
  if (!tag) {
    return true
  }

  const tagList = (website.tags ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return tagList.includes(tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

export const WebsitesPage = () => {
  const { language, searchQuery, setSearchQuery } = useUIContext()
  const { getTags } = useAppSettings()
  const [items, setItems] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [pageSize, setPageSize] = useState(500)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const sectionTags = getTags('website_tags')
  const t = useT()
  const failedLabel = t('failed_to_load')

  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getWebsites(currentPage - 1, pageSize, undefined, undefined, language, controller.signal)
        setItems(response.data.content)
        setTotalElements(response.data.totalElements)
        setTotalPages(response.data.totalPages)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        const message = err instanceof Error ? err.message : failedLabel
        setError(message)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    // Debounce the request to avoid double-fetching in React StrictMode
    const timeoutId = setTimeout(() => {
      void fetchData()
    }, 10)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [failedLabel, pageSize, currentPage, language])

  useEffect(() => {
    setCurrentPage(1)
  }, [language])

  const displayItems = useMemo(
    () => {
      const trimmedQuery = searchQuery.trim()
      let filtered = items.filter((item) => item.lang === language)
      
      if (trimmedQuery) {
        filtered = filtered.filter((item) => matchesSearch(item, trimmedQuery))
      }
      
      if (selectedTag) {
        filtered = filtered.filter((item) => hasTag(item, selectedTag))
      }

      // Sort items
      switch (sortOrder) {
        case 'displayOrder':
          filtered.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          break
        case 'alpha':
          filtered.sort((a, b) => a.name.localeCompare(b.name, language === 'ZH' ? 'zh-CN' : 'en', { sensitivity: 'base' }))
          break
        case 'recent':
          filtered.sort((a, b) => {
            const aTime = new Date(a.updatedAt ?? '').getTime()
            const bTime = new Date(b.updatedAt ?? '').getTime()
            return Number.isNaN(bTime - aTime) ? 0 : bTime - aTime
          })
          break
        default:
          filtered.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          break
      }

      return filtered
    },
    [items, language, searchQuery, selectedTag, sortOrder],
  )

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  const skeletonItems = Array.from({ length: 30 }, (_, index) => index)

  return (
    <section className="page">
      <Toolbar
        sectionTags={sectionTags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        namespace="websites"
      />

      {loading ? (
        <div className="grid grid--websites">
          {skeletonItems.map((item) => (
            <div key={item} className="card website-card website-card--skeleton" aria-hidden="true">
              <div className="website-card__layout">
                <div className="website-card__logo">
                  <div className="skeleton skeleton--image" />
                </div>
                <div className="website-card__content">
                  <div className="skeleton skeleton--line skeleton--line-lg" />
                  <div className="website-card__tags skeleton skeleton--line skeleton--line-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="status status--error">
          <span>{t('failed_to_load')}</span>
          <span className="status__message">{error}</span>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid grid--websites">
            {displayItems.map((item) => (
              <WebsiteCard key={item.id} website={item} />
            ))}
          </div>
          {displayItems.length === 0 ? <div className="status status--empty">{t('websites.empty')}</div> : null}
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      ) : null}
    </section>
  )
}
