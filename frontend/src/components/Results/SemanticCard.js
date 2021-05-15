import React from 'react'
import './SemanticCard.css'
import { Card, Icon } from 'semantic-ui-react'

// category, listing, phone, website, street, city, description, hours, covidMessage

const cardStyles = {
  marginLeft: '25px',
  marginRight: '40px',
  width: '500px',
  maxWidth: '90%'
}

const  SemanticCard = ({ record, key }) => {

  const category = record.main_category;
  const description = record.service_description
  const header = record.listing
  const covidMessage = record.covid_message
  const phone = record.phone

  // const { category, listing, phone, website, street, city, service_description, hours, covidMessage } = record;
  console.log(description)
  return (
    <>
    <HTMLCard key={key} record={record} />

    {/* <Card key={key} style={cardStyles}>
      <Card.Content header={header} />
      <Card.Content description={description} />
      <Card.Content extra style={{display: 'flex', justifyContent: 'space-between'}}>
        <div><Icon name='bookmark outline' /> Save </div>
        <div><Icon name='map marker alternate' /> Show </div>
        <div><Icon name='share alternate' /> Share </div>
      </Card.Content>
    </Card> */}

    </>
  )
}

export default SemanticCard;

const HTMLCard = ({ record, key }) => {
  const category = record.main_category;
  const description = record.service_description
  const header = record.listing
  const hours = record.hours
  const covidMessage = record.covid_message
  const street = record.street
  const phone = record.phone
  const city = record.city
  const parentOrg = record.parent_organization

  console.log({record})
  return (
  <>
  <div className="ui teal card" style={cardStyles}>

    {/* this will need state to know if it's been saved  */}
    <a className="ui right corner label large">
    <i className="bookmark outline large icon" style={{color: '#422B75'}}/></a>

    <div className="content">
      <a className="ui teal ribbon label sc-label">
      {category?.toUpperCase()}</a> 
      <p></p>

      <div className="header" style={{color: 'dark grey'}}>{header}</div>

      {/* META  */}
      {parentOrg &&
      <div className="meta">
        <a>{parentOrg}</a>
        {city && <span>| {city}</span>}
      </div>}
      <p></p>
  
    <div className="description">
      <div className='filled-content'>
      <span className='text-grey'>
        {street && 
        <>
        <p><i className="ui icon map marker alternate"></i><strong>{street}</strong></p>
        <p> <i className="ui icon link external alternate"></i>  <span className='text-purple'>Get Directions</span></p></>}
        {phone &&
        <><i className="ui icon phone"></i>
          {phone}
        <p></p></>}
        <i className="ui icon link external alternate"></i>  <span className='text-purple'>Website</span>
          
        </span>
      </div>
    </div>


    {description && 
    <><div className='card-description'>
      <strong>Description:</strong> </div>
      <div style={{padding: '7px', paddingTop: '0px'}}>
        <p style={{paddingBottom: '5px'}}>
          {description}
        </p>
     </div></>}

    {/* HOURS  */}
    {hours && 
    <><span style={{marginLeft: "5px"}}>
      <strong>Hours:</strong></span>
    <div className='card-hours'>
      <p style={{marginBottom: '0px'}}></p>
      <p>{hours}</p>
    </div></>}
      
    {/* COVID MESSAGE  */}
    {covidMessage && <>
    <div className='emergency-message' style={{color: 'dark grey'}}>
      <strong>Emergency Message:</strong> 
    </div>

    <div style={{padding: '7px', paddingTop: '0px', color: '#B03060'}}>
      <p>{covidMessage}</p>
    </div></>}

    {/* END OF MAIN CARD CONTENT  */}
  </div>
        
    <div className="extra content sc-extra" 
      style={{color: '#422B75'}}>
      <span>
        <i className="bookmark outline icon"></i>
        Save
      </span>
      <span className="centered">
        <i className="map marker alternate icon"></i>
        Show
      </span>
      <span>
        <i className="share alternate icon"></i>
        Share
      </span>
    </div>
  </div>
  </>
  )
}

//sample / ref
            // <Card
            //   href='#card-example-link-card'
            //   header='Elliot Baker'
            //   meta='Friend'
            //   description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
            // />