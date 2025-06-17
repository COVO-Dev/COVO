import { logoArray } from './Contact.data';
import IContactProps from './Contact.model'
import LogoArrayComponent from './logo-array/LogoArray.component'

export default function Contact(props: IContactProps) {
  return (
    <section className={ props.className }>
      <br/>
      <h3 className="text-xl font-semibold" >Contact Us</h3>
      <LogoArrayComponent className={`flex flex-row justify-around my-[2em] lg:pr-[25%]`} logoArray={logoArray} />
    </section>
  );
}