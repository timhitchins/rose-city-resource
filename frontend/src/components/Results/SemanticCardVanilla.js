import React from 'react'
import './SemanticCard.css'



// the ribbon will show "category"
// meta can show covidMessage (for now)
// 


const SemanticCard = ({record}) => {
  console.log(record)
  const recordArray = Object.entries(record);
  console.log(recordArray)

  return (
    <>
    <div>
    {recordArray?.map((e,i) => {
      <div key={i}>
        {/* Key is: {e[0]} <br />
        Value is: {e[1]} */}
        test
      </div>
    })}
    </div>
    </>
  )

  // return (
  //   <>
  //   <div className="ui teal card">
  //     {/* this will need state to know if it's been saved  */}
  //     <a className="ui right corner label"><i className="bookmark outline icon" /></a>
  //     <div className="content">
  //       <a className="ui teal ribbon label sc-label" style="width: 85%; font-size: 1em">
  //         Parent Agency Name
  //         </a> 
  //       <p></p>
  //       <div className="header">Service Listing Name</div>
  //       <div className="meta">
  //         <a>Category</a>
  //    <span>| Updated (date)</span>
  //     </div>
  //   <p></p>
    
  //   <div className="description">
  //   <div style="padding: 7px; border-radius: 5px; margin-top: 0px; padding-top: 0px">
  //                   <div style="border: 1px solid lightgrey; padding: 7px; border-radius: 5px; margin-bottom: 7px"> 
  //       COVID MESSAGE HERE
  //             </div>
  //                    <div style="background-color: RGBA(0, 0, 0, 0.08); border-radius: 5px; padding: 7px">
  //       <span style="color: #565658">
          
  //         <p><i className="ui icon map marker alternate"></i><strong>314 SW 9th Ave, Portland, Or</strong></p>
  //         <p> <i className="ui icon link external alternate"></i>  <span style="color: #0096B7">Get Directions</span></p>
  //         <i className="ui icon phone"></i>
  //         Main Line: (503) 492-3046


  //         <p></p>
  //         <i className="ui icon link external alternate"></i>  <span style="color: #0096B7">Website</span>
          
  //        </span>
  //     </div>
  //   </div>

  //   {/* description  */}
  //   <div style="margin-left: 7px; padding-top: 15px; margin-bottom: 0px; padding-bottom: 0px"><strong>Description:</strong> </div>
       
      
  //      <div style="padding: 7px; padding-top: 0px">
  //        <p style=" padding-bottom: 5px">
  //      Central point for households experiencing homelessness or a housing crisis to seek assistance. Call and leave message to begin process of getting assistance. <i className="ui icon angle down"></i>
  //          </p>
  //      </div>

  //      <span style="margin-left: 5px"><strong>Hours:</strong> </span>
        
  //       <div style="background-color: RGBA(0, 0, 0, 0.08); border-radius: 5px; padding: 7px">
          
  //          <p style="margin-bottom: 0px">
  //          </p>
  //           <p>
  //            10:00 a.m.-7:00 p.m.
  //          </p>
  //       </div>
        
  //                      <div style="margin-left: 7px; padding-top: 15px; margin-bottom: 0px; padding-bottom: 0px">
  //       <strong>EMERGENCY MESSAGE:</strong> </div>
               
              
  //             <div style="padding: 7px; padding-top: 0px">
  //               <p>
  //             Closed due to COVID; phone appointments only
  //                 </p>
  //             </div>
        
  //             </div></div>
  //         </div>
          
  //           <div className="extra content" style="display: flex; justify-content: space-between; color: #422B75">
  //           <span>
  //             <i className="bookmark outline icon"></i>
  //             Save
  //           </span>
  //           <span className="centered">
  //             <i className="map marker alternate icon"></i>
  //             Show
  //           </span>
  //           <span>
  //             <i className="share alternate icon"></i>
  //             Share
  //           </span>
  //         </div>


  //   </>
  // )
}

export default SemanticCard
