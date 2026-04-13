import { Navigate, createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { WebsitesPage } from '../pages/Websites/WebsitesPage'
import { QuestionsPage } from '../pages/Questions/QuestionsPage'
import { ArticlesPage } from '../pages/Articles/ArticlesPage'
import { ArticleDetailPage } from '../pages/Articles/ArticleDetailPage'
import { ImagesPage } from '../pages/Images/ImagesPage'
import { AudiosPage } from '../pages/Audios/AudiosPage'
import { VideosPage } from '../pages/Videos/VideosPage'
import { FilesPage } from '../pages/Files/FilesPage'
import { NotFoundPage } from '../shared/components/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/websites" replace />,
      },
      {
        path: '/websites',
        element: <WebsitesPage />,
      },
      {
        path: '/questions',
        element: <QuestionsPage />,
      },
      {
        path: '/articles',
        element: <ArticlesPage />,
      },
      {
        path: '/articles/:id',
        element: <ArticleDetailPage />,
      },
      {
        path: '/images',
        element: <ImagesPage />,
      },
      {
        path: '/audios',
        element: <AudiosPage />,
      },
      {
        path: '/videos',
        element: <VideosPage />,
      },
      {
        path: '/files',
        element: <FilesPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
], {
  basename: import.meta.env.BASE_URL,
})
