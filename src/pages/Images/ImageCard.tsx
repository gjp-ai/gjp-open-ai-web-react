import type { MediaItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'

interface ImageCardProps {
  item: MediaItem
  onClick?: () => void
}

export const ImageCard = ({ item, onClick }: ImageCardProps) => {
  const t = useT()
  const imageSource = item.thumbnailUrl ?? item.url
  const altText = item.altText ?? item.name ?? t('placeholder.image')

  const cardContent = (
    <figure className="card image-card">
      <img src={imageSource} alt={altText} loading="lazy" className="image-card__image" />
      <figcaption className="image-card__overlay">
        <div className="image-card__title">{item.name ?? item.title ?? 'Untitled image'}</div>
      </figcaption>
    </figure>
  )

  if (onClick) {
    return (
      <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
        {cardContent}
      </button>
    )
  }

  return cardContent
}
