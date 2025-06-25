import Image from 'next/image';
import ILogoArrayProps from './LogoArray.model'

export default function LogoArrayComponent(props: ILogoArrayProps) {
  return (
    <div className={props.className} >
      {
        props.logoArray.map(logo => {
          return (
            <a key={logo.id} href={logo.href} target="active" >
              <Image
                src={logo.src}
                alt={logo.altName}
                width={20}
                height={20}
                className='filter invert brightness-0 opacity-80'>
              </Image>
            </a>
          )
        })
      }
    </div>
  )
}