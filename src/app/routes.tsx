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
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="public/websites" replace />,
      },
      {
        path: 'public/websites',
        element: <WebsitesPage />,
      },
      {
        path: 'public/questions',
        element: <QuestionsPage />,
      },
      {
        path: 'public/articles',
        element: <ArticlesPage />,
      },
      {
        path: 'public/articles/:id',
        element: <ArticleDetailPage />,
      },
      {
        path: 'public/images',
        element: <ImagesPage />,
      },
      {
        path: 'public/audios',
        element: <AudiosPage />,
      },
      {
        path: 'public/videos',
        element: <VideosPage />,
      },
      {
        path: 'public/files',
        element: <FilesPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
], {
  basename: '/',
})
