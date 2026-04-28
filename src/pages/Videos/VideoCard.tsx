import { useState } from 'react'
import type { MediaItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'

interface VideoCardProps {
  item: MediaItem
}

export const VideoCard = ({ item }: VideoCardProps) => {
  const t = useT()
  const [isPlaying, setIsPlaying] = useState(false)
  const hasVideoSource = Boolean(item.url)
  const title = item.title ?? item.name ?? t('untitled.video')
  const posterImage = item.coverImageUrl ?? item.thumbnailUrl ?? undefined
  const tags = (item.tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  return (
    <article className="card video-card">
      <div className="video-card__media-wrapper">
        <div className={hasVideoSource ? 'video-card__media' : 'video-card__media video-card__media--unavailable'}>
          {isPlaying && hasVideoSource ? (
            <video className="video-card__player" controls autoPlay playsInline poster={posterImage}>
              <source src={item.url} />
              {item.captionsUrl ? <track kind="captions" src={item.captionsUrl} /> : null}
            </video>
          ) : posterImage ? (
            <>
              <img src={posterImage} alt={item.altText ?? title} loading="lazy" />
              <button
                type="button"
                className="video-card__play-button"
                onClick={() => hasVideoSource && setIsPlaying(true)}
                aria-label={`${t('videos.play_video')}: ${title}`}
                disabled={!hasVideoSource}
              >
                <span className="video-card__play-icon" aria-hidden="true" />
              </button>
            </>
          ) : (
            <div className="video-card__placeholder">
              <span>{t('placeholder.video')}</span>
              <button
                type="button"
                className="video-card__play-button"
                onClick={() => hasVideoSource && setIsPlaying(true)}
                aria-label={`${t('videos.play_video')}: ${title}`}
                disabled={!hasVideoSource}
              >
                <span className="video-card__play-icon" aria-hidden="true" />
              </button>
            </div>
          )}
          {!hasVideoSource ? <span className="video-card__badge">{t('videos.unavailable')}</span> : null}
        </div>
      </div>
      <div className="video-card__body">
        <h3 className="video-card__title">{title}</h3>
        {item.description ? <p className="video-card__description">{item.description}</p> : null}
        <div className="video-card__meta">
          {tags.length > 0 ? (
            <div className="video-card__tags" aria-label={item.tags}>
              {tags.slice(0, 4).map((tag) => (
                <span key={tag} className="video-card__tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <span aria-hidden="true" />
          )}
          {hasVideoSource ? (
            <a
              className="video-card__download-button"
              href={item.url}
              download
              aria-label={`${t('videos.download')}: ${title}`}
            >
              <span className="video-card__download-icon" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
