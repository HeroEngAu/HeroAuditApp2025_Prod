"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { MdSearch } from "react-icons/md";

export default function SearchBar({ initialValue = "", placeholder = "Search..." }: { initialValue?: string, placeholder?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const debouncedSearch = useDebounce(value, 100);

useEffect(() => {
  const query = debouncedSearch.trim();
  router.push(query ? `?search=${encodeURIComponent(query)}` : "/");
}, [debouncedSearch, router]);


  return (
    <div className="flex w-full md:w-auto items-center rounded-md border border-input shadow-sm px-2">
      <MdSearch className="h-5 w-5 text-muted-foreground mr-2" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border-0 focus:outline-none focus:ring-0 bg-transparent w-full md:w-[300px]"
      />
    </div>
  );
}

