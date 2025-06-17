import Image from "next/image";
import COVO_WHITE_NO_BG_2 from "@/assets/images/COVO_WHITE_NO_BG_2.png"
import ICovoBackgroundProps from './CovoBackground.model'

export default function CovoBackground(props: ICovoBackgroundProps) {
  return (
    <section className={ props.className }>
      <Image className="opacity-50" src={COVO_WHITE_NO_BG_2} alt="COVO_WHITE_NO_BG" />
    </section>
  )
}