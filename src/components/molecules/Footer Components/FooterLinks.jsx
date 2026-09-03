import React from 'react'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'
import { List, ListItem, ListItemText } from '@mui/material'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { scroller } from 'react-scroll';

// Real pages (added over the SEO push) get router links; the two homepage
// sections (Courses, Reviews) route home first, then scroll — so they work
// from any page, not just "/".
const pageLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'For Parents', to: '/for-parents' },
  { label: 'Success Stories', to: '/placements' },
  { label: 'FAQs', to: '/faq' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];
const sectionLinks = ['Courses', 'Reviews'];

function FooterLinks() {
  const navigate = useNavigate();
  const location = useLocation();

  // On the homepage scroll to the section; from any other route go home and
  // let Home scroll to it (via location state) — mirrors the navbar.
  const goToSection = (id) => {
    if (location.pathname === '/') {
      scroller.scrollTo(id, { smooth: true, offset: -62, duration: 400 });
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  return (
    <>
      <TypoGraphyComponent variant='h5' component='h2' text='Who Are We' />
      <List className='links'>
        {pageLinks.map((l) => (
          <ListItem key={l.to}>
            <RouterLink to={l.to}>
              <ListItemText primary={l.label} />
            </RouterLink>
          </ListItem>
        ))}
        {sectionLinks.map((id) => (
          <ListItem key={id} onClick={() => goToSection(id)} style={{ cursor: 'pointer' }}>
            <ListItemText primary={id} />
          </ListItem>
        ))}
      </List>
    </>
  )
}

export default FooterLinks
