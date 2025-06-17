import ILegalElementsProps from './LegalElements.model'
import {legalObjectsArray} from './LegalElements.data'

export default function LegalElements(props: ILegalElementsProps) {
  return (
    <nav className={ props.className }>
        <ul>
          {
            legalObjectsArray.map(legalObject => {
              return (
                <li key={legalObject.id}><a target="active" href={legalObject.href}>{legalObject.content}</a></li>
              )
            })
          }
        </ul>
    </nav>
  )
}