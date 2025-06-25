import { inputBoxArray } from './Join.data'
import InputButton from './input-button/InputButton.component'
import SubscribeComponent from './input-button/Subscribe.component'
import IJoinProps from './Join.model'

export default function Join(props: IJoinProps) {
  return (
    <section className={props.className}>
      <h3 className={"text-xl font-semibold"} >Join Our Newsletter</h3>
      <form>
        <fieldset >
          <div className="flex flex-col">
            {
              inputBoxArray.map(inputBox => {
                return (
                  <InputButton key={inputBox.id} id={inputBox.id} label={inputBox.label} borderColor={inputBox.borderColor} borderHoverColor={inputBox.borderHoverColor} />
                )})
            }
          </div>
          <br />
          <SubscribeComponent />
        </fieldset>
      </form>
    </section>
  );
}