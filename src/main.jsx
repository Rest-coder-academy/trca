import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
// Montserrat, self-hosted. Five weights, matching --rca-fw-* in tokens.css.
// Was a fonts.googleapis.com <link>: a third-party request on every page load,
// on the critical path, that the site cannot render correct type without.
import '@fontsource/montserrat/300.css'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/700.css'
import '../design/tokens.css'
import './index.css'
import './styles/colors.css'
import App from './App.jsx'
import theme from './theme.js'
import { initTracking } from './lib/tracking-init.js'

// Initialise Meta Pixel + Google Ads gtag once, at boot. GA4 is already
// installed statically in index.html; this file adds the paid-ads pixels
// when their IDs are configured in Vite env. Missing env = silent no-op,
// so a preview build never fires against the real ad accounts.
initTracking()

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </BrowserRouter>,
)
