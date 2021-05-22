import React from 'react'
import './Banner.scss'

// props will be html, entered by a Street Roots admin user in the SR admin panel
const Banner = (props) => {
  
  const { bannerEnabled, bannerContent } = props;

  const inputIsValid = (str) => {
    return (str && str.length > 0 && typeof str === 'string')
  }

  const markup = ({__html: bannerContent})

  if (bannerEnabled && inputIsValid(bannerContent)) {
  return (
    <div className='banner-preview default'
      dangerouslySetInnerHTML={markup}>
    </div> 
  )
  } else {
  return null;
  }
}

export default Banner;