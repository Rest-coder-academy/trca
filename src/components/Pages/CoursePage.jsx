import { useParams, Navigate, Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import { courses } from '../organism/courses/courses'
import { useBatches } from '../organism/Batches/useBatches'
import { getNextBatchForCourse, formatBatchDateShort } from '../organism/Batches/batchDateUtils'
import Placements from '../organism/placements/Placements.jsx'
import TypoGraphyComponent from '../atoms/TypoGraphyComponent/TypoGraphyComponent'
import ButtonComponent from '../atoms/ButtonComponent/ButtonComponent'
import { useAuth } from '../../App'
import "./CoursePage.css"

function CoursePage() {
  const { slug } = useParams()
  const course = courses.find((c) => c.slug === slug)
  const { openModal } = useAuth()
  const batches = useBatches()
  const nextBatch = course ? getNextBatchForCourse(course.name, batches) : null

  if (!course) {
    return <Navigate to="/" replace />
  }

  return (
    <Box className="course-page">
      <Box className="course-page-hero">
        <RouterLink to="/" className="course-page-back">← All courses</RouterLink>
        <TypoGraphyComponent variant="h3" component="h1" text={course.name} />
        <TypoGraphyComponent variant="body1" component="p" text={course.audience} />

        <Box className="course-page-meta">
          {nextBatch ? (
            <>
              <span>Next batch · {formatBatchDateShort(nextBatch.date)}</span>
              {nextBatch.duration && <span>{nextBatch.duration}</span>}
              {nextBatch.mode && <span className="course-page-meta-mode">{nextBatch.mode}</span>}
            </>
          ) : (
            <span>New dates coming soon</span>
          )}
        </Box>

        <Box className="course-page-actions">
          <ButtonComponent
            size="large"
            variant="contained"
            bgColor="bg-btn-blue"
            borderRadius="0px"
            label="Enquire Now"
            onBtnClick={() => openModal(`I'm interested in the ${course.name} course.`)}
          />
          <a href="#syllabus" className="course-page-syllabus-link">View syllabus</a>
        </Box>
      </Box>

      {nextBatch?.trainer && (
        <Box className="course-page-section course-page-trainer">
          <TypoGraphyComponent variant="h5" component="h2" text="Trainer" />
          <TypoGraphyComponent variant="body1" component="p" text={nextBatch.trainer} />
        </Box>
      )}

      <Box className="course-page-section" id="syllabus">
        <TypoGraphyComponent variant="h5" component="h2" text="Syllabus" />
        <Box className="course-page-syllabus-grid">
          {course.frontend?.some(Boolean) && (
            <Box className="course-page-syllabus-col">
              <TypoGraphyComponent variant="h6" component="h3" text="Frontend" />
              <ul>
                {course.frontend.filter(Boolean).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </Box>
          )}
          {course.backend?.some(Boolean) && (
            <Box className="course-page-syllabus-col">
              <TypoGraphyComponent variant="h6" component="h3" text="Backend" />
              <ul>
                {course.backend.filter(Boolean).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </Box>
          )}
        </Box>
      </Box>

      <Placements />
    </Box>
  )
}

export default CoursePage
