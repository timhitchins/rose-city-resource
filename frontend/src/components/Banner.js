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
    <div className='banner-preview teal'>
    <details style="margin-top: .5em; margin-bottom: .5em">
      <summary style="font-size: 1.5em; margin-top: .5em; margin-bottom: .5em">Click for Warming Shelter Locations</summary>
      <ul style="text-align: left; line-height: 1.5em; font-size: 1.25em">
      <li>Sunrise Center 18901 E Burnside Ave, Portland TriMet: MAX Blue line - Rockwood/East 188th Ave stop Bus #20 </li>
      <li>SE Stark & 187th stop Salvation Army Moore Street Community Center 5325 N Williams Ave, Portland TriMet: Bus #72 </li>
      <li>N Killingsworth & Vancouver Bus #44 </li>
      <li>N Williams & Emerson stop The Portland Building 1120 SW 5th Ave, Portland TriMet: 2, 9, 14, 17 </li>
      <li>MAX Green/Yellow/Orange Lines Mt. Scott Community Center 5530 SE 72nd Ave, Portland TriMet Bus #10 </li>
      <li>SE Harold & 72nd stop East Portland Community Center 740 SE 106th Ave, Portland TriMet: 15 </li>
      <li>SE 106th & Cherry Blossom stop Bus #20 </li>
      <li>SE Washington & 108th stop</li>
    </ul>
      <p style="text-align: center; line-height: 1.75em; font-size: 1.5em"><strong>Warming shelters stay open until the weather improves. Call 211 for any updates or to find locations accepting donations.</strong></p>
    </details>
    </div> 
  )
  } else {
    return null;
  }
}

export default Banner;
