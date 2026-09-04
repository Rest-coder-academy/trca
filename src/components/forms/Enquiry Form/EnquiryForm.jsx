import { Box } from '@mui/material';
import React, { useState } from 'react'
import InputBoxComponent from '../../atoms/InputBoxComponent/InputBoxComponent';
import TextAreaComponent from '../../atoms/TextAreaComponent/TextAreaComponent';
import DropdownComponent from '../../atoms/DropdownComponent/DropdownComponent';
import "./EnquiryForm.css"
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent';
import ButtonComponent from '../../atoms/ButtonComponent/ButtonComponent';
import { useAuth } from '../../../App';
import { regex } from '../../../regex/regex';
import { trackLead } from '../../../lib/analytics';
import axios from 'axios';

const WHATSAPP_FALLBACK_NUMBERS=["918073762257","919110424403"]
const WHATSAPP_PREFILL=encodeURIComponent("Hi Rest Coder Academy, I'd like to enquire about a course.")
const SUBMIT_TIMEOUT_MS=10000

function EnquiryForm() {

  let [enquiryData,setenquiryData]=useState({fullname:"",mobile:"",email:"",experience:"",message:""})
  // const { register, handleSubmit, watch, formState: { errors } , control, reset} = useForm();
  let [enquiryErrors,setenquiryErrors]=useState({})
  let [isSubmitting,setIsSubmitting]=useState(false)
  let [submitFailed,setSubmitFailed]=useState(false)

  let {closeModal,notify}=useAuth()

    let  options =[
        { label: "Working professional - Technical roles", id: 1 },
        { label: "Working professional - Non technical", id: 2 },
        { label: "College student - Final year", id: 3 },
        { label: "College student - 1st to pre-final year", id: 4 },
        { label: "Others", id: 5 }]
    
      
let changeEnquiryData=({target:{name,value}})=>
{
    setenquiryData({...enquiryData,[name]:value})
}
let changeDropDown=(value)=>
{
    setenquiryData({...enquiryData,experience: value.label})
}
    
const handleSubmit = async (e)=>
  {
    e.preventDefault();

    if(isSubmitting)
    {
      return
    }

    let errors=validateEnquiryForm(enquiryData)
    setenquiryErrors(errors)

    if(Object.keys(errors).length>0)
    {
      return
    }

    await sendEnquiry()
  };

  let sendEnquiry=async ()=>
  {
    setSubmitFailed(false)
    setIsSubmitting(true)
    try
    {
      // Same-origin Cloudflare Pages Function (functions/api/enquiry.js) that
      // writes to our own D1 database. Replaces the old trcabe.onrender.com backend.
      // axios only resolves for 2xx responses by default; anything else (and network
      // errors/timeouts) rejects and is handled in the catch block below.
      await axios.post('/api/enquiry',enquiryData,{timeout:SUBMIT_TIMEOUT_MS})

      // GA4 lead — the enquiry saved, so we have their contact details.
      trackLead("enquiry_form")

      notify(`Enquiry received. We'll call you on ${enquiryData.mobile} within one working day.`)
      closeModal()
    }
    catch(err)
    {
      console.log(err)
      setSubmitFailed(true)
    }
    finally
    {
      setIsSubmitting(false)
    }
  }


  let validateEnquiryForm=({fullname,mobile,email,experience,message})=>
  {
    let errors={}
    
    //! fullname
    if(!fullname)
    {
      errors.fullname="Full Name is Required"
    }
    else if(fullname.length<3)
    {
      errors.fullname="Full Name should be more than 3 characters"
    }
    else if(!regex.nameRegex.test(fullname))
    {
      errors.fullname="Full Name Should Contain Only Alphabets"
    }

    //! mobile
    if(!mobile)
      {
        errors.mobile="Mobile is Required"
      }
      else if(!regex.mobileRegex.test(mobile))
      {
        errors.mobile="Invalid Mobile Number"
      }

      //! email

      if(!email)
      {
        errors.email="Email is Required"
      }
      else if(!regex.emailRegex.test(email))
      {
        errors.email="Invalid Email Number"
      }

         //! experience
    if(!experience)
      {
        errors.experience="Experience is Required"
      }
      // else if(!regex.emailRegex.test(email))
      // {
      //   errors.email="Invalid Email Number"
      // }

      return errors;
  }
  return (
    <form   className="enquiry-form" onSubmit={handleSubmit}>
      <Box className="form-heading">
        <TypoGraphyComponent
          component="h6"
          variant="h6"
            text="Enquire Now"
        //   text="Login"
        />
       <ButtonComponent
       paddingX={1}
       paddingY={1}
            onBtnClick={closeModal}
          >
           ×
          </ButtonComponent>
      </Box>

      <Box className="enquiry-fields">
        <Box className="enquiry-field">
          <InputBoxComponent
            value={enquiryData.fullname}
            label="Full Name"
            variant="outlined"
            onChange={changeEnquiryData}
            name="fullname"
            error={enquiryErrors.fullname?true:false}
            helperText={enquiryErrors.fullname}
          />
        </Box>
        <Box className="enquiry-field">
          <InputBoxComponent
            value={enquiryData.mobile}
            label="Mobile"
            variant="outlined"
            onChange={changeEnquiryData}
            name="mobile"
            error={enquiryErrors.mobile?true:false}
            helperText={enquiryErrors.mobile}
          />
        </Box>
        <Box className="enquiry-field">
          <InputBoxComponent
            value={enquiryData.email}
            label="Email"
            variant="outlined"
            onChange={changeEnquiryData}
            name="email"
            error={enquiryErrors.email?true:false}
            helperText={enquiryErrors.email}
          />
        </Box>
        <Box className="enquiry-field">
          <DropdownComponent
            label="Experience"
            options={options}
            name="experience"
            onChange={changeDropDown}
            value={options}
            helperText={enquiryErrors.experience}
            error={enquiryErrors.experience?true:false}
          />
        </Box>
        <Box className="enquiry-field">
          <TextAreaComponent
            className="text-area"
            label='Message'
            name="message"
            value={enquiryData.message}
            onChange={changeEnquiryData}
          
          />
        </Box>
        {submitFailed && (
          <Box className="enquiry-submit-error" role="alert">
            <TypoGraphyComponent
              component="p"
              variant="body2"
              text="We couldn't send that just now. Message us on WhatsApp and we'll pick it up straight away."
            />
            <div className="enquiry-whatsapp-links">
              {WHATSAPP_FALLBACK_NUMBERS.map((num) => (
                <a
                  key={num}
                  className="enquiry-whatsapp-fallback"
                  href={`https://wa.me/${num}?text=${WHATSAPP_PREFILL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp {num.replace(/^91/, "").replace(/(\d{5})(\d{5})/, "$1 $2")}
                </a>
              ))}
            </div>
          </Box>
        )}
        <Box className="enquiry-field-button">
          <ButtonComponent
            variant="contained"
            paddingX={1.5}
            paddingY={0.7}
            type="submit"
            label="Submit"
            loading={isSubmitting}
          />
        </Box>
      </Box>

    </form>
  );
}

export default EnquiryForm
