import { Link } from 'react-router-dom'
import type { ArticleSummary } from '../../../shared/data/types'

interface ArticleCardProps {
  article: ArticleSummary
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <article className="card article-card">
      <Link to={`/public/articles/${article.id}`} className="article-card__link">
        {article.coverImageUrl ? (
          <div className="article-card__media">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              loading="lazy"
              className="article-card__image"
            />
          </div>
        ) : null}
        <div className="article-card__body">
          <h3 className="article-card__title">{article.title}</h3>
          {article.summary && (
            <p className="article-card__summary">{article.summary}</p>
          )}
          
        </div>
      </Link>
    </article>
  )
}

export default ArticleCard
