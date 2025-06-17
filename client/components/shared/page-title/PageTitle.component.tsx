import type { FC } from 'react';
import IPageTitleProps from './PageTitle.model';

const ShadcnTitle: FC<IPageTitleProps> = ({ children, className }) => {
  return (
    <h1 className={`text-3xl font-semibold  mb-[1em] ${className}`}>
      {children}
    </h1>
  );
};

export default ShadcnTitle;