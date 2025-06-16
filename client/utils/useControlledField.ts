import { useController, Control, FieldValues, Path } from "react-hook-form";

export default function useControlledField<T extends FieldValues>(name: Path<T>, control: Control<T>) {
  const { field } = useController<T>({ name, control });
  return field;
}
