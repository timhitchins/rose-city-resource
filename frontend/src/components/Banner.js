import React from 'react'
import './Banner.css'

// props will be html, entered by a Street Roots admin user in the SR admin panel
const Banner = (props) => {
  
  const { bannerEnabled, bannerContent } = props;

  const inputIsValid = (str) => {
    return (str && str.length > 0 && typeof str === 'string')
  }

  if (bannerEnabled && inputIsValid(bannerContent)) {
    return (
      <div className='banner-preview default'> 
        {/* <div style={{background: '#393e46', display: 'flex'}}
        dangerouslySetInnerHTML={
        {__html: bannerContent
          }> */}
          asdfasdf
        </div> 
    )
  } else {
    return null;
  }
}

export default Banner;