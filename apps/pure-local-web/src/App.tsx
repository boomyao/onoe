import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Chat } from './pages/chat'
import { Embeddings } from './pages/embeddings'
import { Create } from './pages/create'

const router = createBrowserRouter([
  { path: '/chat', element: <Chat /> },
  { path: '/embeddings', element: <Embeddings /> },
  { path: '/create', element: <Create /> }
])

function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App
