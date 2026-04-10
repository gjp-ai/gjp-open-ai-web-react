import type { FileItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'

interface FileCardProps {
  item: FileItem
}

export const FileCard = ({ item }: FileCardProps) => {
  const t = useT()
  const downloadLabel = item.name ? `${t('file.download')} ${item.name}` : t('file.download')

  return (
    <article className="card file-card">
      <span className="file-card__name" title={item.description ?? undefined}>
        {item.name}
      </span>
      <a
        className="file-card__download-button"
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={downloadLabel}
        title={downloadLabel}
      >
        <span aria-hidden="true">⬇</span>
      </a>
    </article>
  )
}
