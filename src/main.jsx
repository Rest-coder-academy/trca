import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import '../design/tokens.css'
import './index.css'
import './styles/colors.css'
import App from './App.jsx'
import theme from './theme.js'

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
)
