import { Box ,TextField,InputAdornment} from '@mui/material'
import React from 'react'
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent'




function FooterAddress() {
  let address=`#364, 3rd Floor, 16th Main, 4th T Block East, Pattabhirama Nagar, Jayanagar, Bengaluru, Karnataka 560041`
let contact=`Mobile: 8073762257`;
let email=`Email: restcoderacademy@gmail.com`;


  return (
    <>
        <TypoGraphyComponent variant='h5' component='h2'  text="Address"/>
        <TypoGraphyComponent variant='body2' component='p' text={address}/>
        <TypoGraphyComponent variant='body2' component='p' text={contact}/>
        <TypoGraphyComponent variant='body2' component='p' text={email}/>
       

        


    </>
  )
}

export default FooterAddress
