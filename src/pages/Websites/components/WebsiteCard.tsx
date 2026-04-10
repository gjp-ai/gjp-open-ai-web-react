import { useMemo, useState } from 'react'
import type { Website } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'

interface WebsiteCardProps {
  website: Website
}

const DefaultLogoIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ color: 'var(--color-primary)' }}
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
      fill="currentColor"
    />
  </svg>
)

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

export const WebsiteCard = ({ website }: WebsiteCardProps) => {
  const t = useT()
  const [imageError, setImageError] = useState(false)

  const tags = useMemo(() => getUniqueTags(website.tags ?? ''), [website.tags])
  const tagsLabel = tags.join(', ')
  
  const hasLogo = website.logoUrl && !imageError

  const cardBody = (
    <div className="website-card__layout">
      <div className="website-card__logo" aria-hidden={!hasLogo}>
        {hasLogo ? (
          <img
            src={website.logoUrl}
            alt={website.name}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <DefaultLogoIcon />
        )}
      </div>
      <div className="website-card__content">
        <h3 className="website-card__title" title={website.name}>
          {website.name}
        </h3>
        {tagsLabel ? (
          <span
            className="website-card__tags"
            aria-label={`${t('websites.tags_label')}: ${tagsLabel}`}
            title={tagsLabel}
          >
            {tagsLabel}
          </span>
        ) : null}
      </div>
    </div>
  )

  // no description state or handlers — card shows tags only

  return (
    <article className="card website-card" aria-label={website.name}>
      {website.url ? (
        <a className="website-card__link" href={website.url} target="_blank" rel="noopener noreferrer">
          {cardBody}
        </a>
      ) : (
        cardBody
      )}
      {/* description and info icon removed — only tags are shown */}
    </article>
  )
}

export default WebsiteCard
