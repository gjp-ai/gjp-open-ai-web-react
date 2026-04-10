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

  return (
    <article className="card video-card">
      <div className="video-card__media-wrapper">
        <div className="video-card__media">
          {isPlaying && hasVideoSource ? (
            <video
              className="video-card__player"
              controls
              autoPlay
              playsInline
              poster={item.coverImageUrl ?? undefined}
            >
              <source src={item.url} />
            </video>
          ) : item.coverImageUrl ? (
            <>
              <img src={item.coverImageUrl} alt={item.title ?? item.name ?? t('untitled.video')} loading="lazy" />
              <button
                type="button"
                className="video-card__play-button"
                onClick={() => hasVideoSource && setIsPlaying(true)}
                aria-label={t('videos.play_video')}
                disabled={!hasVideoSource}
              >
                ▶
              </button>
            </>
          ) : (
            <div className="video-card__placeholder">
              <span>{t('placeholder.video')}</span>
              <button
                type="button"
                className="video-card__play-button"
                onClick={() => hasVideoSource && setIsPlaying(true)}
                aria-label={t('videos.play_video')}
                disabled={!hasVideoSource}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="video-card__body">
        <h3 className="video-card__title">{item.title ?? item.name ?? t('untitled.video')}</h3>
        {item.tags ? <p className="video-card__description">{item.tags}</p> : null}
      </div>
    </article>
  )
}
