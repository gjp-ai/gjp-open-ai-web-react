import { useEffect, useState } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { useParams, Link } from 'react-router-dom'
import { getArticleById } from '../../shared/data/openApi'
import type { ArticleDetail } from '../../shared/data/types'
import { useT } from '../../shared/i18n'
import './articles.css'

export const ArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coverVisible, setCoverVisible] = useState(true)
  const t = useT()
  const invalidIdMessage = t('articles.invalid_id')
  const failedToLoadMessage = t('failed_to_load')

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError(invalidIdMessage)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await getArticleById(id)
        setArticle(response.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : failedToLoadMessage
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void fetchArticle()
    // `t` (translation function) is stable via `useT` and not required as a
    // dependency for fetching data. Restrict the effect to `id` so we only
    // refetch when the article id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Highlight code blocks and process video embeds after article content is rendered
  useEffect(() => {
    if (!article) return

    // highlight.js will find <pre><code> blocks and highlight them.
    // Run on next tick to ensure DOM is updated.
    requestAnimationFrame(() => {
      try {
        // Find all code blocks that haven't been highlighted yet
        const codeBlocks = document.querySelectorAll('.article-detail__body pre code:not(.hljs)')
        codeBlocks.forEach((block) => {
          if (block instanceof HTMLElement) {
            hljs.highlightElement(block)
          }
        })

        // Add copy buttons to code blocks
        const preBlocks = document.querySelectorAll('.article-detail__body pre:not(.code-block-with-copy)')
        preBlocks.forEach((pre) => {
          if (pre instanceof HTMLElement) {
            // Mark this pre block as processed
            pre.classList.add('code-block-with-copy')

            // Create wrapper div
            const wrapper = document.createElement('div')
            wrapper.className = 'code-block-wrapper'

            // Create copy button
            const copyButton = document.createElement('button')
            copyButton.className = 'code-copy-button'
            copyButton.innerHTML = `
              <svg class="copy-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="4" width="8" height="10" rx="1"/>
                <path d="M8 4V2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2"/>
              </svg>
              <span class="copy-text">Copy</span>
              <span class="copied-text" style="display: none;">Copied!</span>
            `
            copyButton.setAttribute('aria-label', 'Copy code')

            // Add click handler
            copyButton.addEventListener('click', async () => {
              const codeElement = pre.querySelector('code')
              if (codeElement) {
                try {
                  await navigator.clipboard.writeText(codeElement.textContent || '')

                  // Show "Copied!" feedback
                  const copyText = copyButton.querySelector('.copy-text')
                  const copiedText = copyButton.querySelector('.copied-text')
                  if (copyText && copiedText) {
                    copyText.setAttribute('style', 'display: none;')
                    copiedText.setAttribute('style', 'display: inline;')
                    copyButton.classList.add('copied')

                    setTimeout(() => {
                      copyText.setAttribute('style', 'display: inline;')
                      copiedText.setAttribute('style', 'display: none;')
                      copyButton.classList.remove('copied')
                    }, 2000)
                  }
                } catch (err) {
                  console.error('Failed to copy code:', err)
                }
              }
            })

            // Wrap the pre element and add copy button
            pre.parentNode?.insertBefore(wrapper, pre)
            wrapper.appendChild(pre)
            wrapper.appendChild(copyButton)
          }
        })
      } catch (e) {
        // swallow highlighting errors to avoid breaking the page
        // (e.g., unknown language or malformed nodes)
        console.error('highlight.js error', e)
      }

      // Process video embeds: convert <div> with src to <iframe>
      const videoEmbeds = document.querySelectorAll('.article-detail__body .video-embed[data-provider="youtube"]')
      videoEmbeds.forEach((div) => {
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
  }, [article])

  if (loading) {
    return (
      <section className="page article-detail article-detail--skeleton">
        <div className="article-detail__header">
          <div className="skeleton skeleton--icon" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div className="skeleton skeleton--line skeleton--line-lg" style={{ height: '2rem', flex: 1, maxWidth: '60%', margin: '0 auto' }} />
        </div>

        <div className="article-detail__hero">
          <div className="skeleton skeleton--image" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
        </div>

        <article className="article-detail__content">
          <div className="article-detail__meta" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            <div className="skeleton skeleton--pill" style={{ width: '120px' }} />
            <div className="skeleton skeleton--pill" style={{ width: '150px' }} />
            <div className="skeleton skeleton--pill" style={{ width: '100px' }} />
          </div>

          <hr />

          <div className="article-detail__body">
            <div className="skeleton skeleton--line" style={{ width: '100%', marginBottom: '1rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '90%', marginBottom: '1rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '95%', marginBottom: '1rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '85%', marginBottom: '1rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '92%', marginBottom: '1rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '40%', marginBottom: '2rem' }} />

            <div className="skeleton skeleton--image" style={{ width: '100%', height: '300px', marginBottom: '2rem' }} />

            <div className="skeleton skeleton--line" style={{ width: '100%', marginBottom: '1rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '95%', marginBottom: '1rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '90%', marginBottom: '1rem' }} />
          </div>
        </article>
      </section>
    )
  }

  if (error || !article) {
    return (
      <section className="page article-detail">
        <div className="status status--error">
          <span>{t('failed_to_load')}</span>
          {error ? <span className="status__message">{error}</span> : null}
          <Link to="/articles" className="button button--primary">
            {t('articles.back_to_list')}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page article-detail">
      <div className="article-detail__header">
        <Link to="/articles" className="article-detail__back-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="article-detail__title">{article.title}</h1>
        {article.coverImageUrl ? (
          <button
            className="article-detail__cover-toggle"
            onClick={() => setCoverVisible((v) => !v)}
            aria-label={coverVisible ? t('articles.hide_cover') : t('articles.show_cover')}
            title={coverVisible ? t('articles.hide_cover') : t('articles.show_cover')}
          >
            {coverVisible ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" strokeDasharray="3 3" />
              </svg>
            )}
          </button>
        ) : null}
      </div>

      {article.coverImageUrl && coverVisible ? (
        <div className="article-detail__hero">
          <img src={article.coverImageUrl} alt={article.title} className="article-detail__hero-img" />
        </div>
      ) : null}

      <article className="article-detail__content">
        <div className="article-detail__meta">
          {article.tags ? (
            <span className="article-detail__tags">
              {t('articles.tags')}: {article.tags};
            </span>
          ) : null}
          {article.sourceName ? (
            <span className="article-detail__source">
              {t('articles.source')}: {article.sourceName};
            </span>
          ) : null}
          {article.updatedAt ? (
            <time className="article-detail__date">
              {t('articles.updateAt')}:  {new Date(article.updatedAt).toLocaleDateString()}
            </time>
          ) : null}

        </div>

        <hr />

        <div
          className="article-detail__body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.originalUrl ? (
          <div className="article-detail__actions">
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button--primary"
            >
              {t('articles.view_original')}
            </a>
          </div>
        ) : null}
      </article>
    </section>
  )
}
