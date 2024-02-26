import { EuiText } from '@elastic/eui'
import PageHeader from './PageHeader.tsx'
import React from 'react'

const takePartLink = 'https://docs.google.com/forms/d/e/1FAIpQLSdzkYh3RuF0n3WL4ydf84NWJsX4hwFghS4ADKUWjHkCGRvJ2g/viewform?usp=sf_link'

export default function TakePart() {
  return (
    <>
      <PageHeader/>
      <EuiText><h1>Take part</h1></EuiText>
      <EuiText>
        <p>
          Get ready to lace up those shoes and step into action, we're thrilled to announce the launch of our March Step Challenge,{' '}
          kicking off on March 1st! Make your steps count for the Month of March by contributing to your teams tally, and competing{' '}
          for the top of our Siren leaderboard 🥇
        </p>

        <ul>
          <li>
            <b>Tracking Steps:</b> Participants can track their steps using their phones or smartwatches during the day and by{' '}
            logging their total on our very own Siren Steps website! Submit your step count whenever suits you best, we recommend{' '}
            updating the site a minimum of once per week.
          </li>
          <li>
            <b>Opt-In/Opt-Out Deadline:</b> We would love for each of you to get involved, but understand a step challenge is not for{' '}
            everyone. Please Opt In or Opt Out using <a target="_blank" href={takePartLink}>this link</a>. Those who opt in{' '}
            will be allocated to a random team.
          </li>
        </ul>

        <p>
          We'll be reaching out to each of you during the week to reveal your team and provide further details.Let's make March the month
          of moving and grooving! 🎉
        </p>
      </EuiText>
    </>
  )
}
