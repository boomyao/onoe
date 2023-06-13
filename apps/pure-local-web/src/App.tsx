import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Chat } from './chat'
import { Embeddings } from './embeddings'

const router = createBrowserRouter([
  { path: '/chat', element: <Chat /> },
  { path: '/embeddings', element: <Embeddings /> },
])

function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App
