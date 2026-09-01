import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent';
import ButtonComponent from '../../atoms/ButtonComponent/ButtonComponent';
import { List, ListItem, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../../App';
import { useBatches } from '../Batches/useBatches';
import { getNextBatchForCourse, formatBatchDateShort } from '../Batches/batchDateUtils';


 function CoursesCard({name,slug,courseId,paid,price,badge,backend,audience,frontend,syllabus1,syllabus2}) {
    let {openEnroll}=useAuth()
    let batches=useBatches()
    let nextBatch=getNextBatchForCourse(name,batches)
    let enroll=()=>openEnroll({courseId,name,paid,price})
  return (
    <Card sx={{ }} className='card'>
        <RouterLink to={`/courses/${slug}`} className="course-header-link">
        <Box className="course-header">
            {badge && <Box component="span" className="course-badge">{badge}</Box>}
            <TypoGraphyComponent
            variant="h5"
            sx={{mb:".3rem"}}
            component="h5"
            text={name}
        />
        <Box component="span" className="next-batch-tag">
            {nextBatch ? `Next batch · ${formatBatchDateShort(nextBatch.date)}` : "New dates coming soon"}
        </Box>
        {paid && (
          <Box component="span" className="course-price">
            ₹{Number(price).toLocaleString("en-IN")} <span className="course-emi">· EMI available</span>
          </Box>
        )}
         <TypoGraphyComponent
            variant="text"
            sx={{}}
            component="p"
            text={audience}
        />
        </Box>
    <CardContent className='card-content'>

          <List className='links' sx={{listStyleType:"disc"}}>
          <TypoGraphyComponent
            variant="h6"
            sx={{}}
            component="h6"
            text={frontend?"Front End":"Syllabus"}
        />
              {frontend && frontend.map((link,id)=>
              {
               return <ListItem  key={id} sx={{ display: 'list-item',visibility:link?"visible":"hidden"}}>
                    <ListItemText
                      primary={link}
                    />
              </ListItem>
          
          
              })}
{/* Syllabus  */}
        {syllabus1 && syllabus1.map((link,id)=>
              {
               return <ListItem  key={id} sx={{ display: 'list-item',visibility:link?"visible":"hidden"}}>
                    <ListItemText
                      primary={link}
                    />
              </ListItem>
          
          
              })}
               
               
          </List>
          <List className='links' sx={{listStyleType:"disc"}}>
    <TypoGraphyComponent
            variant="h6"
            sx={{}}
            component="h6"
            text={backend?"Backend":"syllabus"}
        />
              {backend && backend.map((link,id)=>
              {
               return <ListItem  key={id} sx={{ display: link?'list-item':"none" }}>
                    <ListItemText
                      primary={link}
                    />
              </ListItem>
          
              })}
              {/* Syllabus  */}
        {syllabus2 && syllabus2.map((link,id)=>
              {
               return <ListItem  key={id} sx={{ display: 'list-item',visibility:link?"visible":"hidden"}}>
                    <ListItemText
                      primary={link}
                    />
              </ListItem>
          
          
              })}
               
          </List>
  {/* <Typography variant="body2" color="text.secondary">
    Lizards are a widespread group of squamate reptiles, with over 6,000
    species, ranging across all continents except Antarctica
  </Typography> */}
</CardContent>
        </RouterLink>
<CardActions sx={{}} className='card-actions'>

  <ButtonComponent size='small' variant={paid?'contained':'outlined'} label='Enroll Now'  borderRadius='0' sx={{}} onBtnClick={enroll}/>
  <ButtonComponent size='small' variant='outlined' label='View Syllabus' borderRadius='0' sx={{}} component={RouterLink} to={`/courses/${slug}`}/>
</CardActions>
</Card>
  );
}


export default CoursesCard