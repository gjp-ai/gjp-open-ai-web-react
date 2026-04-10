import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { getAudios } from '../../shared/data/publicApi'
import type { MediaItem } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useT } from '../../shared/i18n'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { AudioCard } from './AudioCard'
import { AudioPlayer } from './AudioPlayer'
import { Pagination } from '../../shared/ui/Pagination'
import { Toolbar } from '../../shared/components/Toolbar/Toolbar'
import './audios.css'

const normalizeText = (value: string) => value.toLowerCase()

const matchesSearch = (item: MediaItem, query: string) => {
  if (!query) {
    return true
  }

  const text = normalizeText(query)
  const fields = [item.title ?? item.name ?? '', item.description ?? '', item.tags ?? '']
  return fields.some((field) => normalizeText(field).includes(text))
}

const hasTag = (item: MediaItem, tag: string | null) => {
  if (!tag) {
    return true
  }

  const tagList = (item.tags ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  return tagList.includes(tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

export const AudiosPage = () => {
  const { language, searchQuery, setSearchQuery } = useUIContext()
  const { getTags } = useAppSettings()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [pageSize, setPageSize] = useState(50)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const sectionTags = getTags('audio_tags')
  const t = useT()
  const failedLabel = t('failed_to_load')

  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getAudios(currentPage - 1, pageSize, language, controller.signal)
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
  }, [failedLabel, currentPage, pageSize, language])

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
          filtered.sort((a, b) => {
            const aName = a.title ?? a.name ?? ''
            const bName = b.title ?? b.name ?? ''
            return aName.localeCompare(bName, language === 'ZH' ? 'zh-CN' : 'en', { sensitivity: 'base' })
          })
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

  const handleTogglePlayer = (item: MediaItem) => {
    setActiveItem((current) => (current?.id === item.id ? null : item))
  }

  useEffect(() => {
    setShowSubtitle(false)
  }, [activeItem?.id])

  const handlePrevious = () => {
    if (displayItems.length === 0 || !activeItem) return
    const currentIndex = displayItems.findIndex((item) => item.id === activeItem.id)
    if (currentIndex === -1) return
    const prevIndex = (currentIndex - 1 + displayItems.length) % displayItems.length
    setActiveItem(displayItems[prevIndex])
  }

  const handleNext = () => {
    if (displayItems.length === 0 || !activeItem) return
    const currentIndex = displayItems.findIndex((item) => item.id === activeItem.id)
    if (currentIndex === -1) return
    const nextIndex = (currentIndex + 1) % displayItems.length
    setActiveItem(displayItems[nextIndex])
  }

  const handleAudioEnded = () => {
    if (displayItems.length === 0) return

    let nextItem: MediaItem
    if (displayItems.length === 1) {
      nextItem = displayItems[0]
    } else {
      do {
        const randomIndex = Math.floor(Math.random() * displayItems.length)
        nextItem = displayItems[randomIndex]
      } while (nextItem.id === activeItem?.id)
    }

    setActiveItem(nextItem)
  }

  const skeletonItems = Array.from({ length: 20 }, (_, index) => index)

  return (
    <section className="page audios-page">
      <Toolbar
        sectionTags={sectionTags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        namespace="audios"
      />

      {loading ? (
        <div className="grid grid--audios">
          {skeletonItems.map((item) => (
            <div key={item} className="card audio-card audio-card--skeleton" aria-hidden="true">
              <div className="audio-card__content">
                <div className="audio-card__media-wrapper">
                  <div className="skeleton skeleton--image" style={{ width: '90px', height: '90px', borderRadius: '50px' }} />
                </div>
                <div className="audio-card__info">
                  <div className="skeleton skeleton--line skeleton--line-lg" />
                  <div className="skeleton skeleton--line skeleton--line-sm" />
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
          <div className="grid grid--audios">
            {displayItems.map((item) => (
              <AudioCard
                key={item.id}
                item={item}
                isActive={activeItem?.id === item.id}
                onTogglePlayer={handleTogglePlayer}
              />
            ))}
          </div>
          {displayItems.length === 0 ? <div className="status status--empty">{t('audios.empty')}</div> : null}
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
          
          {/* Spacer to prevent content from being hidden behind the fixed player */}
          {activeItem ? <div style={{ height: '160px' }} /> : null}

          {activeItem ? (
            <AudioPlayer
              item={activeItem}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onEnded={handleAudioEnded}
              showSubtitle={showSubtitle}
              onToggleSubtitle={setShowSubtitle}
            />
          ) : null}
        </>
      ) : null}
    </section>
  )
}
