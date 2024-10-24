import React from 'react'
import Link from 'next/link'
import Hero from '@/components/Hero'
import InfoBoxes from '@/components/InfoBoxes'
import PropertiesRecent from '@/components/PropertiesRecent'
import PropertiesFeatured from '@/components/PropertiesFeatured'

const HomePage = () => {
  return (
    <div>
      <Hero />
      <InfoBoxes />
      <PropertiesFeatured />
      <PropertiesRecent />
    </div>
  )
}

export default HomePage