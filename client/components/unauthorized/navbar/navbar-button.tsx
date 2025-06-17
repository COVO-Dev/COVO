import { LucideIcon } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SheetClose } from '@/components/ui/sheet';

interface NavbarButtonProps extends ButtonProps {
  icon?: LucideIcon;
}

export function NavbarButton({
  icon: Icon,
  className,
  children,
  ...props
}: NavbarButtonProps) {
  return (
    <Button
      variant='ghost'
      className={cn('gap-4 text-lg justify-start text-custom-dark-gray hover:text-custom-light-apricot', className)}
      {...props}
    >
      {Icon && <Icon size={20} />}
      <span>{children}</span>
    </Button>
  );
}

export function NavbarButtonSheet(props: NavbarButtonProps) {
  return (
    <SheetClose asChild>
      <NavbarButton {...props} />
    </SheetClose>
  );
}