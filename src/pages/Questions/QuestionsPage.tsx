import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { getQuestions } from '../../shared/data/publicApi'
import type { Question } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { useT } from '../../shared/i18n'
import { Pagination } from '../../shared/ui/Pagination'
import { QuestionCard } from './components/QuestionCard'
import { Toolbar } from '../../shared/components/Toolbar/Toolbar'
import './questions.css'

const normalizeText = (value: string) => value.toLowerCase()

const matchesSearch = (question: Question, query: string) => {
  if (!query) {
    return true
  }

  const text = normalizeText(query)
  const fields = [question.question, question.answer, question.tags ?? '']
  return fields.some((field) => normalizeText(field).includes(text))
}

const hasTag = (question: Question, tag: string | null) => {
  if (!tag) {
    return true
  }

  const tagList = (question.tags ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return tagList.includes(tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

export const QuestionsPage = () => {
  const { language, searchQuery, setSearchQuery } = useUIContext()
  const { getTags } = useAppSettings()
  const [items, setItems] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [pageSize, setPageSize] = useState(500)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const sectionTags = getTags('question_tags')
  const t = useT()
  const failedLabel = t('failed_to_load')

  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getQuestions(currentPage - 1, pageSize, undefined, undefined, language, controller.signal)
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
          filtered.sort((a, b) => a.question.localeCompare(b.question, language === 'ZH' ? 'zh-CN' : 'en', { sensitivity: 'base' }))
          break
        case 'recent':
          filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          break
      }

      return filtered
    },
    [items, searchQuery, selectedTag, sortOrder, language]
  )

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  const skeletonItems = Array.from({ length: 5 }, (_, index) => index)

  return (
    <div className="page-container">
      <Toolbar
        sectionTags={sectionTags}
        selectedTag={selectedTag}
        onSelectTag={handleTagSelect}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onClearSearch={handleClearSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        namespace="questions"
      />

      {loading ? (
        <div className="grid grid--questions">
          {skeletonItems.map((item) => (
            <div key={item} className="card question-card question-card--skeleton" aria-hidden="true">
              <div className="question-card__header">
                <div className="skeleton skeleton--line skeleton--line-lg" style={{ width: '70%' }} />
              </div>
              <div className="question-card__tags" style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="skeleton skeleton--pill-sm" style={{ width: '60px' }} />
                <div className="skeleton skeleton--pill-sm" style={{ width: '80px' }} />
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
          {displayItems.length > 0 ? (
            <div className="grid grid--questions">
              {displayItems.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          ) : (
            <div className="status status--empty">{t('questions.empty')}</div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      ) : null}
    </div>
  )
}
