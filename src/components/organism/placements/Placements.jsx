import React from 'react'
import { Link } from 'react-router-dom'
import CardGrid from '../../molecules/Grid/CardGrid'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'
import { Box } from '@mui/material'
import "./Placement.css"
import PlacementCard from './PlacementCard'

function Placement() {
    return (
        <Box className='placements rca-section' id="Placements">
        <TypoGraphyComponent variant='h3' text='Placements' component='h3' sx={{textAlign:"center",fontWeight:"bold"}} />
        {/* <TypoGraphyComponent variant='h4' text='Our Trusted Placement' component='h4' sx={{textAlign:"center",fontWeight:"bold"}} /> */}

        <hr />
            <CardGrid>
                <PlacementCard/>
            </CardGrid>
            <Box sx={{ textAlign: "center", mt: 2 }}>
                <Link className="placements-more-link" to="/placements">See full success stories →</Link>
            </Box>
    </Box>
    )
}

export default Placement
