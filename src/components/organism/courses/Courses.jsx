import { Box } from '@mui/material'
import React from 'react'

import { courses } from './courses'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'
import "./Courses.css"
import CardGrid from '../../molecules/Grid/CardGrid'
import CoursesGrid from './CoursesGrid'

function Courses() {
    let mapdataContent=["","",""]
    return (
        <Box className='courses rca-section' id="Courses">
        <TypoGraphyComponent variant='h3' text='Courses' component='h3' sx={{textAlign:"center",fontWeight:"bold"}} />
        <hr />
           
            {/* 375 one column, 768 two, 1024 three, 1200+ four — the four
                widths in section 7 of the template (#11). It was sm={12},
                which left a single column all the way up to 900px. */}
            <CoursesGrid xs={12} sm={6} md={4} lg={3} mapdata={courses} />
          
    </Box>
  )
    
}

export default Courses
