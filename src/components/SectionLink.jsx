import { Link } from 'react-scroll'
import { Link as RouterLink } from 'react-router-dom'
import { useIsHome } from '../hooks/useIsHome'

// Shared by Navbar and FooterLinks: an in-page section link only works on
// "/" (that's where the sections actually render). On "/" it smooth-scrolls;
// from anywhere else it routes to "/#Section" and Home's own scroll-to-hash
// effect takes it from there. Single implementation so the two navs can't
// drift out of sync with each other.
function SectionLink({ to, children }) {
  const isHome = useIsHome()

  return isHome
    ? <Link to={to} smooth={true} offset={-62} activeClass='active' spy={true}>{children}</Link>
    : <RouterLink to={`/#${to}`}>{children}</RouterLink>
}

export default SectionLink
