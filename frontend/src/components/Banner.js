import React from 'react'
import './Banner.scss'

// props will be html, entered by a Street Roots admin user in the SR admin panel
const Banner = (props) => {
  
  const { bannerEnabled, bannerContent } = props;

  const inputIsValid = str => {
    return typeof str === 'string' && str.length > 0
  }

  const markup = ({__html: bannerContent})

  if (bannerEnabled === true && inputIsValid(bannerContent)) {

  return (
    <div className='banner-preview teal' dangerouslySetInnerHTML={markup}></div> 
  )
  } else {
    return null;
  }
}

export default Banner;