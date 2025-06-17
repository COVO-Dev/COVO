import facebookLogo from '@/assets/svg/facebookLogo_SVGrepo.svg';
import instagramLogo from '@/assets/svg/instagramOutlineLogo_SVGrepo.svg';
import linkedInLogo from '@/assets/svg/linkedinLogo_SVGrepo.svg'
import xLogo from '@/assets/svg/xLogo_SVGrepo.svg'
import gmailLogo from '@/assets/svg/gmailLogo_SVGrepo.svg'

const logoArray = [
  {
    src: facebookLogo,
    id: 1,
    altName: 'Facebook logo',
    href: 'https://facebook.com',
  },
  {
    src: instagramLogo,
    id: 2,
    altName: 'Instagram logo',
    href: 'https://instagram.com',
  },
  {
    src: linkedInLogo,
    id: 3,
    altName: 'linkedIn logo',
    href: 'https://linkedin.com',
  },
  {
    src: xLogo,
    id: 4,
    altName: 'X logo',
    href: 'https://x.com',
  },
  {
    src: gmailLogo,
    id: 5,
    altName: 'gmail logo',
    href: 'https://gmail.com',
  }
]

export { logoArray };