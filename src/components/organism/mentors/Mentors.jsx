import React from 'react'
import CardGrid from '../../molecules/Grid/CardGrid'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'
import { Box } from '@mui/material'
import "./Mentors.css"
import MentorsCard from './MentorsCard'
import { useTrainers } from './useTrainers'

function Mentors() {
    const trainers = useTrainers();
    return (
        <Box className='mentors' my={5} mx={12} id="Trainers">
            <TypoGraphyComponent variant='h3' text='Our Trainers' component='h3' sx={{ textAlign: "center", fontWeight: "bold" }} />
            <hr />
            <CardGrid>
                <MentorsCard trainers={trainers} />
            </CardGrid>
        </Box>
    )
}

export default Mentors
