'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export default function Studio() {
  return (
    <>
      <style>{`
        html {
          font-size: 16px !important;
        }
      `}</style>
      <NextStudio config={config} />
    </>
  )
}
