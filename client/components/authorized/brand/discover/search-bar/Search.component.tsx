import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SearchProps {
  onSearch: (query: string) => void; // Callback to handle search
}

export default function Search({ onSearch }: SearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query); // Pass the search query to the parent component
  };

  return (
    <div className="flex flex-row justify-center items-center pt-[1em] w-[100%]">

      {/* <Input
        type="search"
        placeholder="Search for influencer..."
        className="bg-[hsl(var(--sidebar-border))] rounded-l-full border border-[#814F6A]"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button
        type="submit"
        className="rounded-r-full bg-[hsl(var(--sidebar-border))] text-black border border-[#814F6A]"
        onClick={handleSearch}
      >
        Search
      </Button> */}

      <div className="flex flex-row justify-center gap-2 w-full items-center max-w-2xl space-x-2 ">
        <Input type="search" placeholder="Search" onChange={(e) => setQuery(e.target.value)} />
        <Button className="" type="submit" onClick={handleSearch} size="lg">Search</Button>
      </div>

    </div>
  );
}
