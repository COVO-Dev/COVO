"use client";

import { useEffect, useState, Fragment } from "react";
import CardTable from "@/components/authorized/brand/discover/result-table/ResultTable.component";
import Search from "@/components/authorized/brand/discover/search-bar/Search.component";
import { type IInfluencer, columns } from "@/components/authorized/brand/discover/result-table/ColumnDef";
import { useSession } from "next-auth/react";
import { searchInfluencerRoute } from '@/lib/api/search/influencer/searchInfluencer.route';
// import { useRouter } from 'next/router';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"

export default function DiscoverComponent() {

  const { data: session } = useSession();
  const token = session?.user?.access_token;
  const [influencerData, setInfluencerData] = useState<IInfluencer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationInfo, setPaginationInfo] = useState({ totalPages: 0, currentPage: 1, totalCount: 0, pageSize: 10 }); // Initialize currentPage to 1
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state
  const router = useRouter();
  const skeletonCards = Array(5).fill("");


  useEffect(() => {
    async function fetchData(pageNumber: number) {
      if (token) {
        setIsLoading(true); // Set loading to true before fetching
        setError(null); // Clear any previous errors
        try {
          console.log(`pageNumber: ${pageNumber}`);
          const result = await searchInfluencerRoute({ username: searchQuery, page: pageNumber, limit: 10 }, token); // Pass page and limit
          if (result.status === "success") { // Check for success
            setInfluencerData(result.data.data.data);
            setPaginationInfo({
              totalPages: result.data.data.totalPages,
              totalCount: result.data.data.totalCount,
              currentPage: pageNumber,
              pageSize: 10,
            });
          } else {
            setError(result.message || "Failed to fetch data.");
            console.error("API Error:", result);
          }

        } catch (err: any) {
          setError(err.message || "An error occurred.");
          console.error("Fetch Error:", err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchData(paginationInfo.currentPage); // Fetch based on current page
  }, [token, searchQuery, paginationInfo.pageSize, paginationInfo.currentPage]);

  const handlePageChange = (newPage: number) => {
    console.log(newPage)
    setPaginationInfo((prevInfo) => {
      return { ...prevInfo, currentPage: newPage }
    });
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query); // Update the search query state
    setPaginationInfo(prevInfo => ({ ...prevInfo, currentPage: 1 })) // reset to page 1 on new search
  };

  // Handle redirect
  const handleRedirect = (influencerId: string) => {
    console.log("handleRedirect: ", influencerId);
    router.push(`/brand/influencer-profile/${influencerId}`);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center p-[2em] w-full">
      <div className="flex flex-col items-center w-[80%] pb-[2em]">
        <Search onSearch={handleSearch} />
      </div>
      {isLoading ? (
        <Fragment>{skeletonCards.map((_, index) => {
          return <Card className=" shadow-md w-[67vw] flex flex-row justify-between max-w-5xl p-4 animate-pulse" key={index}>
            <Skeleton className="h-10 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-4 w-[100px]" />
          </Card>
        })}</Fragment>

      ) :
        <CardTable
          columns={columns}
          data={influencerData}
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onCardClick={handleRedirect}
        />
      }

    </div>
  );
}