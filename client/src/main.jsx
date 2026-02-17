import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { NotesProvider } from './context/NotesContext.jsx'
import "quill/dist/quill.snow.css";


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <NotesProvider>
    <App />
    </NotesProvider>
  </BrowserRouter>,
)
