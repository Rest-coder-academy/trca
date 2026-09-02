import React from 'react'
import CardGrid from '../../molecules/Grid/CardGrid'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'
import { Box } from '@mui/material'
import "./Mentors.css"
import MentorsCard from './MentorsCard'
import { useTrainers } from './useTrainers'

function Mentors() {
    const trainers = useTrainers();
    // Nothing entered yet → don't show an empty "Our Trainers" heading.
    if (!trainers || trainers.length === 0) return null;
    return (
        <Box className='mentors rca-section' id="Trainers">
            <TypoGraphyComponent variant='h3' text='Our Trainers' component='h2' sx={{ textAlign: "center", fontWeight: "bold" }} />
            <hr />
            <CardGrid>
                <MentorsCard trainers={trainers} />
            </CardGrid>
        </Box>
    )
}

export default Mentors
