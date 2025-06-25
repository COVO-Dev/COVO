'use client';

import { Fragment } from 'react';
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { ListItemIcon } from '@mui/material';
import IAppliedInfluencerDataProps from './AppliedInfluencerCard.model';

export default function AppliedInfluencerCard({ userData, credentials, handleSubmitAccept, handleSubmitReject, handleClick }: IAppliedInfluencerDataProps) {
  console.log(userData);
  return (
    <Fragment>
      <ListItem
        className="p-4 flex flex-col sm:flex-row gap-2 sm:gap-2 items-center hover:bg-gray-200 duration-300 "
      >
        {/* Avatar */}
        <div className="w-full sm:basis-1/4 flex justify-center flex-shrink-1">
          <Avatar
            className="rounded-full sm:w-[6rem] sm:h-[6rem] lg:w-[3rem] lg:h-[3rem] lg-xl:w-[6rem] lg-xl:h-[6rem] bg-slate-200 border-8 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm text-black hover:cursor-pointer "
            onClick={() => { handleClick(userData.influencerId._id) }}
          >
            {userData.influencerId.firstName.slice(0, 1).toLocaleUpperCase() +
              userData.influencerId.lastName.slice(0, 1).toLocaleUpperCase()}
          </Avatar>
        </div>

        {/* Message and Offer */}
        <div className="w-full sm:basis-3/4 flex flex-col gap-2 flex-shrink-4 pr-[1em]">
          <div
            className="flex flex-row sm:flex-row justify-between hover:cursor-pointer "
            onClick={() => { handleClick(userData.influencerId._id) }}
          >
            <Typography variant="body1" className="text-md sm:text-md font-bold">
              {userData.influencerId.firstName + ' ' + userData.influencerId.lastName}
            </Typography>
            <Badge className="text-xs sm:text-sm bg-[#00b88f] ">${userData.offer}</Badge>
          </div>

          {userData.message && (
            <div className="flex flex-row gap-2">
              <ListItemIcon className="min-w-[1rem] text-gray-500">
                <MessageSquare size={20} />
              </ListItemIcon>
              <div className="flex-1 w-[8em] min-w-[3rem] max-w-[12rem] ">
                <Typography variant="body2" className="text-xs sm:text-sm text-gray-500 whitespace-nowrap truncate">
                  {userData.message}
                </Typography>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-2 flex-1">
            <Button
              onClick={() =>
                handleSubmitAccept(
                  credentials.brandId,
                  userData.influencerId._id,
                  credentials.campaignId,
                  credentials.token
                )
              }
              className=" bg-black text-white hover:bg-gray-800"
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                handleSubmitReject(
                  credentials.brandId,
                  userData.influencerId._id,
                  credentials.campaignId,
                  credentials.token
                )
              }
              className="hover:bg-gray-200 border border-gray-300 text-black"
            >
              Reject
            </Button>
          </div>
        </div>
      </ListItem>
      <Divider variant="middle" />
    </Fragment>
  );
};
