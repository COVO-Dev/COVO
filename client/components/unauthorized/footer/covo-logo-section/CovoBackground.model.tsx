import { type StaticImageData } from 'next/image';

export default interface ICovoBackgroundProps {
  className: string;
  src: StaticImageData;
  alt: string;
}