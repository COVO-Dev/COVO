import { Fragment } from 'react';
import {
  ListItem,
  Avatar,
  Typography,
  Badge,
  ListItemIcon,
  Button,
  Divider,
} from '@mui/material'; // Assuming you are using Material UI
import { MessageSquare, User } from 'lucide-react';
import Image from 'next/image';

const AppliedInfluencerCardFallback = () => {
  return (
    <Fragment>
      <ListItem className="p-4 flex flex-col sm:flex-row gap-2 sm:gap-2 items-center bg-red-100 h-[6em]">
        {/* Avatar */}
        <div className="w-full sm:basis-1/4 flex justify-center ">
          <Avatar className="rounded-full  w-[4rem] h-[4rem]  border-4 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm text-black">
            <User />
          </Avatar>
        </div>

        {/* Message and Offer */}
        <div className="w-full sm:basis-3/4 flex flex-col gap-2 flex-shrink-4 pr-[1em]">
          <div className="flex flex-row sm:flex-row justify-between ">
            <Typography variant="h6" className="text-lg sm:text-md font-bold">
              No Applications yet!
            </Typography>
          </div>

          <div className="flex flex-row gap-2">
            <div className="flex flex-1 gap-2 w-[8em] min-w-[3rem] max-w-[12rem] ">
              <MessageSquare size={20} />
              <Typography
                variant="body2"
                className="text-xs sm:text-sm text-gray-500 whitespace-nowrap truncate"
              >
                No message available
              </Typography>
            </div>
          </div>
        </div>
      </ListItem>
      <Divider variant="middle" />
    </Fragment>
  );
};

export default AppliedInfluencerCardFallback;