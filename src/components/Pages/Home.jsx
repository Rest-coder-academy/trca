import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scroller } from 'react-scroll'
import Banner from '../organism/Banner/Banner'
import Courses from '../organism/courses/Courses.jsx'
import Mentors from '../organism/mentors/Mentors.jsx'
import Reviews from '../organism/reviews/Reviews.jsx'
import Clients from '../organism/clients/Clients.jsx'
import Placement from '../organism/placements/Placements.jsx'
import Batches from '../organism/Batches/Batches.jsx'
import EnquiryForm from '../forms/Enquiry Form/EnquiryForm.jsx'


function Home() {
  const location = useLocation()

  // Arriving here with a "#Section" hash (e.g. a nav link clicked from a
  // course page) scrolls to that section once this page has mounted.
  useEffect(() => {
    if (location.hash) {
      scroller.scrollTo(location.hash.slice(1), { smooth: true, offset: -62 })
    }
  }, [location])

  return (
    <section>
        <Banner/>
        <Courses/>
        <Mentors/>
        <Reviews/>
        <Clients/>
        <Batches/>
        <Placement/>

       
    </section>
  )
}

export default Home
