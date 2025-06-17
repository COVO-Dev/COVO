import Legal from './legal/Legal.component';
import Contact from './contact/Contact.component';
import IContactLegalProps from './ContactLegal.model'

export default function ContactLegal(props: IContactLegalProps) {
  return (
    <section className={ props.className } >
      <Legal />
      <Contact />
    </section>
  )
}