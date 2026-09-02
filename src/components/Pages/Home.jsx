import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scroller } from 'react-scroll'
import Banner from '../organism/Banner/Banner'
import Courses from '../organism/courses/Courses.jsx'
import Mentors from '../organism/mentors/Mentors.jsx'
import Reviews from '../organism/reviews/Reviews.jsx'
import Clients from '../organism/clients/Clients.jsx'
import Placement from '../organism/placements/Placements.jsx'
import EnquiryForm from '../forms/Enquiry Form/EnquiryForm.jsx'


function Home() {
  const location = useLocation()

  // Arriving from another page with a section to reach (nav on a course page
  // sends { scrollTo }); scroll once the sections have rendered.
  useEffect(() => {
    const id = location.state?.scrollTo
    if (id) {
      const t = setTimeout(() => scroller.scrollTo(id, { smooth: true, offset: -62, duration: 400 }), 120)
      return () => clearTimeout(t)
    }
  }, [location.state])

  return (
    <section>
        <Banner/>
        <Courses/>
        <Mentors/>
        <Reviews/>
        <Clients/>
        <Placement/>

       
    </section>
  )
}

export default Home
