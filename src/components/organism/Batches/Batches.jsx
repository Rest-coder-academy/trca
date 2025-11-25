import { Box } from '@mui/material'
import React from 'react'

import { batches } from './batches'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'
import "./Batches.css"
import CardGrid from '../../molecules/Grid/CardGrid'
import BatchesGrid from './BatchesGrid'
import { getLatestBatches } from '../../../api/batchApi'
import useFetch from '../../../hooks/useFetch'

function Batches({limit=4}) { //?If the parent does NOT pass a limit, it will default to 5
    
    const { data: {batches}, loading } = useFetch(
    getLatestBatches,
    limit,
    [limit]   // re-fetch when limit changes
  );

  // console.log(data)
  // console.log(batches)
  if (loading) return <p>Loading latest batches...</p>;

    return (
        <Box className='batches' my={5} mx={12} id="Batches">
        <TypoGraphyComponent variant='h4' text='Upcoming Batches' component='h3' sx={{textAlign:"center",fontWeight:"bold"}} />
        <hr />
           
            <BatchesGrid xs={12} sm={12} md={6} lg={3}  mapdata={batches} />
          
    </Box>
  )
    
}

export default Batches
