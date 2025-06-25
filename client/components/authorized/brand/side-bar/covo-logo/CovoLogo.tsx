"use client"

import * as React from "react"
import Image from 'next/image'
import COVO_LOGOGRAM_BLACK_2 from "@/assets/images/COVO_LOGOGRAM_BLACK_2.png"
export function CovoLogo() {
  return (
    <div className="flex items-center justify-start">
      <Image className="opacity-80" src={COVO_LOGOGRAM_BLACK_2} alt="Logo" width={100} height={100} />
    </div>
  )
}
