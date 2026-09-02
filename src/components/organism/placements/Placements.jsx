import React from 'react'
import CardGrid from '../../molecules/Grid/CardGrid'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'
import { Box } from '@mui/material'
import "./Placement.css"
import PlacementCard from './PlacementCard'

function Placement() {
    return (
        <Box className='placements rca-section' id="Placements">
        <TypoGraphyComponent variant='h3' text='Placements' component='h2' sx={{textAlign:"center",fontWeight:"bold"}} />
        {/* <TypoGraphyComponent variant='h4' text='Our Trusted Placement' component='h4' sx={{textAlign:"center",fontWeight:"bold"}} /> */}

        <hr />
            <CardGrid>
                <PlacementCard/>
            </CardGrid>
    </Box>
    )
}

export default Placement
