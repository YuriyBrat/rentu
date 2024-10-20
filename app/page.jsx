import React from 'react'
import Link from 'next/link'
import Hero from '@/components/Hero'
import InfoBoxes from '@/components/InfoBoxes'
import HomeProperties from '@/components/HomeProperties'
import PropertiesFeatured from '@/components/PropertiesFeatured'

const HomePage = () => {
  return (
    <div>
      <Hero />
      <InfoBoxes />
      <PropertiesFeatured />
      <HomeProperties />
    </div>
  )
}

export default HomePage