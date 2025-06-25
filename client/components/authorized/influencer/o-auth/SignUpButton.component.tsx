// import React from 'react';
import { Button } from '@/components/ui/button'; // Adjust path as needed
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from 'lucide-react';

const OAuthSignupButton = ({ platformName, platformUrl, disabled }) => {
  const openLink = (link) => {
    window.open(link, '_blank');
  };

  const getIcon = () => {
    switch (platformName.toLowerCase()) {
      case 'facebook':
        return <Facebook className=" h-6 w-6 basis-1/6" />;
      case 'instagram':
        return <Instagram className=" h-6 w-6 basis-1/6" />;
      case 'youtube':
        return <Youtube className=" h-6 w-6 basis-1/6" />;
      case 'twitter':
        return <Twitter className=" h-6 w-6 basis-1/6" />;
      default:
        return null; // Or a default icon
    }
  };

  return (
    <Button
      disabled={disabled}
      className={`w-full lg-xl:w-[90%] justify-center border-2 border-black hover:bg-white hover:text-black disabled `}
      onClick={() => openLink(platformUrl)}
    >
      <p className="justify-center flex items-center w-[67%] gap-2 ">
        {getIcon()}
        {platformName.toUpperCase()}
      </p>
    </Button>
  );
};

export default OAuthSignupButton;