import { cn } from "@/lib/utils";


export default function FormHeader({
  title,
  description,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <div className={cn("text-center mb-8", className)} {...props}>
      {Icon && <Icon className="mx-auto h-8 w-8 text-primary" />}
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}
