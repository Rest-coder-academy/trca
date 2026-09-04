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
import { courses as courseCatalogue } from '../organism/courses/courses.js'

const ORIGIN = 'https://restcoderacademy.in'

// Course + Offer JSON-LD only belongs on pages that actually offer courses:
// the homepage catalogue and each /courses/<slug>. Previously baked into
// index.html, which leaked Course/Offer to /faq, /contact, /blog, etc.
const homeCourseSchema = {
  '@context': 'https://schema.org',
  '@graph': courseCatalogue.map((c) => ({
    '@type': 'Course',
    name: c.name,
    description:
      c.audience ||
      `Live, project-based ${c.name} course at Rest Coder Academy — Bengaluru.`,
    provider: { '@id': `${ORIGIN}/#org` },
    url: `${ORIGIN}/courses/${c.slug || c.courseId}`,
    ...(c.price
      ? {
          offers: {
            '@type': 'Offer',
            category: c.paid ? 'Paid' : 'Free',
            price: String(c.price),
            priceCurrency: 'INR',
            url: `${ORIGIN}/courses/${c.slug || c.courseId}`,
          },
        }
      : {}),
  })),
}

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
        {/* React 19 hoists this <script> into <head>, so it only appears on / */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeCourseSchema) }}
        />
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
