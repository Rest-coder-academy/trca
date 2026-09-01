import React from 'react'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'
import { Box,List,ListItem,ListItemText } from '@mui/material'
import { Link, animateScroll as scroll } from 'react-scroll';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useIsHome } from '../../../hooks/useIsHome';


function FooterLinks() {
  let links=['Placements', 'Reviews','Batches'];
  const isHome = useIsHome();
  const navigate = useNavigate();

  // "About Us" lives in the homepage hero — scroll to it there, or navigate
  // home first from anywhere else, same as the section links below.
  let scrollToTop=()=>
  {
    if(isHome)
    {
      scroll.scrollToTop()
    }
    else
    {
      navigate('/')
    }
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
