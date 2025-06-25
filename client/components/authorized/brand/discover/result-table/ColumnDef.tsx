"use client";

import Image from "next/image";
import COVO_LOGOGRAM_BLACK_2 from "@/assets/images/COVO_LOGOGRAM_BLACK_2.png";
import { Star } from "lucide-react";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// This type is used to define the shape of our data.
type IInfluencer = {
  socialMediaProfiles: object,
  contentAndAudience: Array<object>,
  location: Array<object>,
  profilePicture?: string,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber?: string,
  is_active: true,
  username: string,
};

const columnHelper = createColumnHelper<IInfluencer>();

const columns: ColumnDef<IInfluencer>[] = [
  columnHelper.accessor("image", {
    id: "image",
    header: "Icon",
    cell: ({ row }) => (
      <div className=" col-span-1 ">
        <Image
          src={COVO_LOGOGRAM_BLACK_2}
          // src={`${row.original.profilePicture ?? COVO_LOGOGRAM_BLACK_2}`}
          width={100}
          height={100}
          alt={row.original.firstName}
          className="rounded-[30%] bg-center "
        />
      </div>
    ),
  }),

  columnHelper.display({
    id: "influencerInfo",
    header: "Info",
    cell: ({ row }) => (
      <CardContent className=" flex flex-row justify-between items-center self-center p-2  px-[1em] col-span-2 ">
        <CardHeader className="">
          <CardTitle>{row.original.firstName} {row.original.lastName}</CardTitle>
          <CardDescription>{row.original.username}</CardDescription>
          {row.original.socialMediaProfiles && Object.keys(row.original.socialMediaProfiles).length > 0 ? (
            <CardDescription>
              {Object.entries(row.original.socialMediaProfiles).map(([platform, url], index) => (
                <a href={url} key={index} target="_blank" rel="noopener noreferrer">
                  {platform}
                </a>
              ))}
            </CardDescription>
          ) : (
            <CardDescription>No social media profiles available.</CardDescription>
          )}
        </CardHeader>
      </CardContent>
    ),
  }),

  columnHelper.display({
    id: "niche",
    header: "Niches",
    cell: ({ row }) => (
      <CardContent className="col-span-1  ">
        {
          row.original.contentAndAudience && Object.keys(row.original.contentAndAudience).length > 0 ? (
            <CardDescription>
              {
                Object.entries(row.original.contentAndAudience).map(([nicheInfo, content], index) => (
                  <p key={index}>{nicheInfo}{content}</p>
                ))
              }
            </CardDescription>
          )
            : <CardDescription>No Niche yet</CardDescription>
        }
      </CardContent>
    ),
  }),

  // columnHelper.display({
  //   id: "rating",
  //   header: "Rating",
  //   // cell: row => row.original,
  //   cell: ({ row }) => (
  //     <div className="border-2 border-blue-300 inline-flex">
  //       {row.original.rating}
  //       <Star />
  //     </div>
  //   ),
  // }),

];

export { type IInfluencer, columns };
