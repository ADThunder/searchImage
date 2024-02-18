/** @format */

"use client";
import { Input } from "@/components/ui/input";
import { DownloadIcon, Search } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { useState, useEffect } from "react";
import { Photo } from "../../types";
import Navbar from "@/components/shared/Navbar";
import { useDebounce } from "use-debounce";

import { saveAs } from "file-saver";

type ImageSearch = {
  total: number;
  total_pages: number;
  results: Photo[];
};

export default function Home() {
  const [page, setPage] = useState(1);
  const [value, setSearchValue] = useState("");
  const [searchValue] = useDebounce(value, 300);
  const itemsPerPage = 39;
  const apiKey = process.env.NEXT_PUBLIC_IMAGE_API;

  const fetchImages = (page = 1) =>
    fetch(
      `https://api.unsplash.com/search/photos?page=${page}&query=${
        searchValue || "nature"
      }&per_page=${itemsPerPage}&client_id=${apiKey}`
    ).then((res) => res.json());

  const {
    isPending,
    error,
    data: imageData,
    refetch,
  } = useQuery<ImageSearch>({
    queryKey: ["imageData", page],
    queryFn: () => fetchImages(page),
  });

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value);
  }

  useEffect(() => {
    refetch();
    // first
    let timer = setTimeout(() => refetch(), 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [searchValue, refetch]);

  // data
  const data = imageData?.results ?? [];

  //
  const downloadImage = (image_url: string, imageName: string) => {
    saveAs(image_url, `${imageName}.jpg`); // Put your image URL here.
  };

  return (
    <div className="px-8 max-w-7xl mx-auto flex flex-col gap-4 pb-10">
      <Navbar />
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={handleSearch}
          placeholder="Search"
          className="pl-8"
        />
      </div>
      {isPending ? (
        <div className="w-full py-8 text-center animate-bounce ">
          loading...
        </div>
      ) : (
        <main className="grid w-full grid-cols-2 md:grid-cols-4 gap-4">
          {newData(data).map((d, i) => (
            <div key={i} className="grid gap-4  ">
              {d.map((innterdata, innterkey) => (
                <div key={innterkey} className="relative ">
                  <button
                    onClick={() =>
                      downloadImage(innterdata.urls.full, innterdata.slug)
                    }
                    className="absolute top-4 right-4  rounded-full p-3  bg-slate-700/50 hover:opacity-80  "
                  >
                    <DownloadIcon />
                  </button>
                  <img
                    className="h-full max-w-full rounded-lg object-cover"
                    src={innterdata.urls.regular}
                    alt=""
                  />
                </div>
              ))}
            </div>
          ))}
        </main>
      )}

      {/* main images */}
    </div>
  );
}

function newData(array: Photo[]) {
  const size = 3;
  const newArray = [];

  for (let i = 0; i < array.length; i += size) {
    newArray.push(array.slice(i, i + size));
  }
  return newArray;
}
