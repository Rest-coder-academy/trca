import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent';
import ButtonComponent from '../../atoms/ButtonComponent/ButtonComponent';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import BatchItem from './BatchItem';
import { isBatchUpcoming } from './batchDateUtils';
import LaptopIcon from '@mui/icons-material/Laptop';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CallIcon from '@mui/icons-material/Call';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import { useAuth } from '../../../App';
import { courses } from '../courses/courses';


 function BatchesCard({name,date,day,time,trainer,duration,mode,contact}) {
    let {openModal,openEnroll}=useAuth()
    let upcoming=isBatchUpcoming(date)
    // Funnel an upcoming batch straight into its course's enrolment flow.
    let course=courses.find((c)=>c.name===name)
    let canEnroll=upcoming && !!course
    let onCta=canEnroll
      ? ()=>openEnroll({courseId:course.courseId,name:course.name,paid:course.paid,price:course.price})
      : openModal
    let ctaLabel=canEnroll ? "Enroll Now" : (upcoming ? "Enquire Now" : "Join the Waitlist")
  return (
    <Card sx={{}} className="card">
      <Box className="course-header">
        <TypoGraphyComponent
          variant="h5"
          sx={{ mb: ".6rem" }}
          component="h5"
          text={name}
        />
        {!upcoming && (
          <Box component="span" className="batch-status-chip">Batch closed</Box>
        )}
      </Box>
      <CardContent className="card-content">
        <List className="links">
          {upcoming
            ? <>
                <BatchItem title="Date" data={date} icon={<CalendarMonthIcon/>} />
                <BatchItem title="Day" data={day} icon={<CalendarTodayIcon/>} />
                <BatchItem title="Time" data={time}  icon={<AccessTimeIcon/>} />
              </>
            : <BatchItem title="Status" data="New dates coming soon" icon={<CalendarMonthIcon/>} />
          }
          <BatchItem title="Duration" data={duration} icon={<AlarmOnIcon/>} />
          <BatchItem title="Mode" data={mode} icon={<LaptopIcon/>} />
          <BatchItem title="Trainer" data={trainer} icon={<PersonIcon/>} />
          <BatchItem title="Contact" data={contact} icon={<CallIcon/>} />
        </List>

      </CardContent>
      <CardActions sx={{}} className="card-actions">
        <ButtonComponent
          size="large"
          variant={canEnroll && course.paid ? "contained" : "outlined"}
          label={ctaLabel}
          onBtnClick={onCta}
        />
      </CardActions>
    </Card>
  );
}


export default BatchesCard