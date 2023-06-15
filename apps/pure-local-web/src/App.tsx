import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Chat } from './chat'
import { Embeddings } from './embeddings'
import { Create } from './create'

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
