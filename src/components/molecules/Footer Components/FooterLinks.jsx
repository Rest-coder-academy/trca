import React from 'react'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'
import { Box,List,ListItem,ListItemText } from '@mui/material'
import { Link, animateScroll as scroll } from 'react-scroll';
import { Link as RouterLink, useLocation } from 'react-router-dom';


function FooterLinks() {
  let links=['Placements', 'Reviews','Batches'];
  const location = useLocation();
  const isHome = location.pathname === '/';

  let scrollToTop=()=>
  {
    scroll.scrollToTop()
  }
  return (
    <>
        <TypoGraphyComponent variant='h5' component='h5' text='Who Are We'/>
        <List className='links'>
        <ListItem onClick={scrollToTop}>

                    <ListItemText
                      primary={"About Us"}
                    />
            </ListItem>
              {links.map((link,id)=>
              {
               return <ListItem  key={id}>
                  {isHome
                    ? <Link to={link} smooth={true} offset={-62}>
                        <ListItemText primary={link} />
                      </Link>
                    : <RouterLink to={`/#${link}`}>
                        <ListItemText primary={link} />
                      </RouterLink>
                  }
              </ListItem>

              })}

          </List>
    </>
  )
}

export default FooterLinks
