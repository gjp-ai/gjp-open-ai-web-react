import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AppSettingsProvider } from '../shared/contexts/AppSettingsContext'
import { UIProvider } from '../shared/contexts/UIContext'
import { router } from './routes'

const App = () => (
  <UIProvider>
    <AppSettingsProvider>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    </AppSettingsProvider>
  </UIProvider>
)

export default App
