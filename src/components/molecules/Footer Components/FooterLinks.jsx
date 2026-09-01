import React from 'react'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'
import { Box,List,ListItem,ListItemText } from '@mui/material'
import { animateScroll as scroll } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import { useIsHome } from '../../../hooks/useIsHome';
import SectionLink from '../../SectionLink';


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
                  <SectionLink to={link}>
                    <ListItemText primary={link} />
                  </SectionLink>
              </ListItem>

              })}

          </List>
    </>
  )
}

export default FooterLinks
