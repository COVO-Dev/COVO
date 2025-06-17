"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {Fragment} from "react";
import { Input } from "@/components/ui/input";
// import { type IInfluencer, categories, brandArray, columns } from "./ColumnDef";
import { type IInfluencer, columns } from "./ColumnDef";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface IDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  paginationInfo: {
    totalPages: number,
    currentPage: number,
    totalCount: number,
    pageSize: number,
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onCardClick: (id: string) => void;
}

export default function CardTable<TData, TValue>({
  columns,
  data,
  paginationInfo,
  onPageChange,
  onCardClick,
}: IDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: paginationInfo.currentPage -1,
        pageSize: paginationInfo.pageSize
      }
    },
    onStateChange: (state) => {
        if (state.pagination?.pageIndex !== undefined) {
            onPageChange(state.pagination.pageIndex + 1);
        }
    }
  });
  console.log("cardTable component data:", data);

  const goToPage = (page: number) => {
    console.log(`goToPage paginationInfo: ${ paginationInfo.totalPages }, page:${ page }`)
    if (page >= 1 && page <= paginationInfo.totalPages) {
        onPageChange(page);
    }
  }
  // console.log("CardTable Data props:", data);

  return (
    <div className="space-y-4">
      {/* Sorting Header */}

      {/* <div className="flex bg-[hsl(var(--sidebar-border))] sticky top-16 z-10 ">
        <div className="flex flex-row justify-between items-center space-x-2  w-full px-[3em]">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <Button
                key={header.id}
                variant="outline"
                onClick={header.column.getToggleSortingHandler()}
                className="text-sm bg-transparent  "
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </Button>
            ))
          )}
        </div>
      </div> */}

      {/* Results as Cards */}
      <div className="grid grid-cols-1 gap-4">
        {table.getRowModel().rows.map((row) => (
          <Card
            key={row.id}
            className=" shadow-sm hover:shadow-md w-[67vw] flex flex-row justify-between max-w-5xl "
            onClick={() => onCardClick(row.original._id)}
          >
            <Card className="grid grid-cols-4 items-center justify-between py-3  w-full px-[1em] ">
              {/* <CardTitle>
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id}>
                    {cell.column.columnDef.header === "Name" &&
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    }
                  </div>
                ))}
              </CardTitle> */}

              {row.getVisibleCells().map((cell) => (
                <Fragment key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Fragment>
               ))
              }

              {/* {row.getVisibleCells().map((cell) => (
                <div key={cell.id} className="border-2 border-indigo-400 " >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  <p>{cell.column.columnDef.id}</p>
                </div>
              ))} */}

            </Card>
          </Card>
        ))}
      </div>

       {/* pagination footer */}
       <div className="flex justify-between items-center">
        <Button
          variant="outline"
          disabled={paginationInfo.currentPage === 1}
          onClick={() => goToPage(paginationInfo.currentPage - 1)} // Use goToPage
        >
          Previous
        </Button>

        {/* Page Number Display with Input */}
          <div className="flex flex-row">
            <label htmlFor="pageInput">Page:</label>
            <input
                type="number"
                id="pageInput"
                value={paginationInfo.currentPage}
                onChange={(e) => {
                    const page = Number(e.target.value);
                    goToPage(page);
                }}
                min="1"
                max={paginationInfo.totalPages}
                className="w-12 border rounded px-2" // Adjust styling as needed
            />
            <span> / {paginationInfo.totalPages}</span>
          </div>

        <Button
          variant="outline"
          disabled={paginationInfo.currentPage === paginationInfo.totalPages}
          onClick={() => goToPage(paginationInfo.currentPage + 1)} // Use goToPage
        >
          Next
        </Button>
      </div>

    </div>
  );
}
