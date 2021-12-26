import React from 'react'
import { Container, Segment, Input, Card, Grid, Ref, Sticky } from "semantic-ui-react";

export default function TestCard () {
  return (
    <Card as='article' color='teal' centered raised className="card-container">
      <Card.Header>Test Header</Card.Header>
      <Card.Meta>Test Address</Card.Meta>
      <Card.Content>Test Card Content</Card.Content>
    </Card>
  )
}
