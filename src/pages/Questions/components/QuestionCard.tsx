import { useEffect, useMemo, useRef, useState } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import type { Question } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'

interface QuestionCardProps {
  question: Question
}

const getUniqueTags = (tags: string) => {
  const unique: string[] = []
  const seen = new Set<string>()

  const parts = tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  for (const tag of parts) {
    const key = tag.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(tag)
    }
  }

  return unique
}

export const QuestionCard = ({ question }: QuestionCardProps) => {
  const t = useT()
  const [expanded, setExpanded] = useState(false)
  const answerRef = useRef<HTMLDivElement>(null)

  const tags = useMemo(() => getUniqueTags(question.tags ?? ''), [question.tags])

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  useEffect(() => {
    if (expanded && answerRef.current) {
      // highlight.js will find <pre><code> blocks and highlight them.
      // Run on next tick to ensure DOM is updated.
      requestAnimationFrame(() => {
        try {
          answerRef.current?.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block as HTMLElement)
          })
        } catch (e) {
          // swallow highlighting errors to avoid breaking the page
          // (e.g., unknown language or malformed nodes)
          console.error('highlight.js error', e)
        }

        // Process video embeds: convert <div> with src to <iframe>
        const videoEmbeds = answerRef.current?.querySelectorAll('.video-embed[data-provider="youtube"]')
        videoEmbeds?.forEach((div) => {
          const src = div.getAttribute('src')
          const width = div.getAttribute('width') || '600'
          const height = div.getAttribute('height') || '400'
          
          if (src && div instanceof HTMLElement) {
            const iframe = document.createElement('iframe')
            iframe.src = src
            iframe.width = width
            iframe.height = height
            iframe.className = div.className
            iframe.style.cssText = div.style.cssText
            iframe.setAttribute('frameborder', '0')
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
            iframe.setAttribute('allowfullscreen', 'true')
            
            div.parentNode?.replaceChild(iframe, div)
          }
        })
      })
    }
  }, [expanded, question.answer])

  return (
    <article 
      className="card question-card" 
      aria-label={question.question}
      onClick={toggleExpanded}
    >
      <div className="question-card__header">
        <div className="question-card__content">
          {tags.length > 0 && (
            <div className="question-card__tags">
              {tags.map((tag) => (
                <span key={tag} className="question-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h3 className="question-card__question">
            {question.question}
          </h3>
        </div>
        <div className={`question-card__icon ${expanded ? 'question-card__icon--expanded' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      {expanded && (
        <>
          <div 
            className="question-card__answer"
            ref={answerRef}
            dangerouslySetInnerHTML={{ __html: question.answer }}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="question-card__footer">
            <button 
              className="question-card__close-btn"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(false)
              }}
              aria-label={t('common.close')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
          </div>
        </>
      )}
    </article>
  )
}

export default QuestionCard
