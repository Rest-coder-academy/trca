import { createContext, useContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from "./components/molecules/Navbar/Navbar"
import Footer from "./components/organism/Footer/FooterComponent"
import Banner from './components/organism/Banner/Banner'
import Home from "./components/Pages/Home";
import CourseDetail from "./components/Pages/CourseDetail";
import ForParents from "./components/Pages/ForParents";
import ScrollToTop from "./components/ScrollToTop";
import Modal from 'react-modal';
import EnquiryForm from './components/forms/Enquiry Form/EnquiryForm';
import EnrollForm from './components/forms/EnrollForm/EnrollForm';
import "./App.css"
import FloatingIcons from './components/molecules/Floating Icons Components/FloatingIcons';
import { ToastContainer, toast } from 'react-toastify';
 let AuthContext=createContext(null)
 Modal.setAppElement('#root');

function App() {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [enrollCourse, setEnrollCourse] = useState(null);

  let openModal=()=> {
    setIsOpen(true);
  }

  let closeModal=()=> {
    setIsOpen(false);
  }

  // Enrolment modal — opened per course (paid → checkout, else → register).
  let openEnroll=(course)=> {
    setEnrollCourse(course);
  }
  let closeEnroll=()=> {
    setEnrollCourse(null);
  }

  const notify = (message) => toast(message);

  const customStyles = {
    overlay:{
      backgroundColor:"var(--rca-scrim)",
      backdropFilter:"blur(3px)",
    },
    // content: {
    //   top: '55%',
    //   left: '50%',
    //   right: 'auto',
    //   bottom: 'auto',
    //   marginRight: '-50%',
    //   transform: 'translate(-50%, -50%)',
    // },
  };
  
  

  return (
    <AuthContext.Provider className="app" value={{ openModal, closeModal, openEnroll, closeEnroll, notify }}>
      <Navbar />
      <ToastContainer className={"toast"} autoClose={2500}/>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal-enquiry-form"
        style={customStyles}

      >
        <EnquiryForm />
      </Modal>
      <Modal
        isOpen={!!enrollCourse}
        onRequestClose={closeEnroll}
        className="modal-enquiry-form"
        style={customStyles}
      >
        {enrollCourse && <EnrollForm course={enrollCourse} />}
      </Modal>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/for-parents" element={<ForParents />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FloatingIcons/>
      <Footer />
    </AuthContext.Provider>
  );
}


export let useAuth=()=>
{
  return useContext(AuthContext)
}

export default App



// import React from 'react'
// import Slider from 'react-slick';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// function App() {
//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 3, // Initial number of slides shown
//     slidesToScroll: 1,
//     responsive: [
//       {
//         breakpoint: 1024, // Adjust breakpoint as needed
//         settings: {
//           slidesToShow: 2,
//           slidesToScroll: 1,
//           infinite: true,
//           dots: true
//         }
//       },
//       {
//         breakpoint: 600, // Adjust breakpoint as needed
//         settings: {
//           slidesToShow: 1,
//           slidesToScroll: 1
//         }
//       }
//     ]
//   };

//   return (
//     <div className="responsive-slider-container" style={{border:"5px solid red",width:"80rem"}}> {/* Add a container for styling */}
//       <Slider {...settings}>
//         <div>
//           <img src="https://bootstrapmade.com/content/demo/Selecao/assets/img/testimonials/testimonials-3.jpg" alt="" />
//           <h3>Slide 1</h3>
//           <p>Content for slide 1.</p>
//         </div>
//         <div>
//         <img src="https://bootstrapmade.com/content/demo/Selecao/assets/img/testimonials/testimonials-1.jpg" alt="" />

//           <h3>Slide 2</h3>
//           <p>Content for slide 2.</p>
//         </div>
//         <div>
//         <img src="https://bootstrapmade.com/content/demo/Selecao/assets/img/testimonials/testimonials-2.jpg" alt="" />

//           <h3>Slide 3</h3>
//           <p>Content for slide 3.</p>
//         </div>
//         <div>
//           <h3>Slide 4</h3>
//           <p>Content for slide 4.</p>
//         </div>
//         <div>
//           <h3>Slide 5</h3>
//           <p>Content for slide 5.</p>
//         </div>
//         {/* Add more slides as needed */}
//       </Slider>
//     </div>
//   );
// }

// export default App
