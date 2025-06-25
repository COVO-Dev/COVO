import IInputButtonProps from './InputButton.model';

export default function InputButtonImportant(props: IInputButtonProps) {
  return (
    <>
      <label htmlFor={props.id} className="my-[1em]" >{ props.label }<em className="text-red-500">*</em></label>
      <div className="relative lg:w-[80%] " >
        <input placeholder={ `Enter your ${ props.label.toLowerCase() }`  }type="text" id={ props.id } className={ `w-full border-b-2 ${ props.borderColor } bg-transparent text-gray-300 focus:outline-none focus:border-white peer ` }/>
        <span className={ `absolute bottom-0 left-1/2 w-0 h-[2px] ${ props.borderHoverColor }  transition-all duration-300 peer-focus:left-0 peer-focus:w-full ` }></span>
      </div>
    </>
  )
}