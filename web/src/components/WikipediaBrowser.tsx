"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import "./WikipediaBrowser.css";

interface Pane {
  title: string;
  content: string;
  isHomepage: boolean;
}

const SearchBar = memo(({ onSearch }: { onSearch: (term: string, isHomepage: boolean) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm, true);
      setSearchTerm("");
    }
  };

  return (
    <div className="p-4 bg-gray-100">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter a Wikipedia page title"
          className="flex-grow px-4 py-2 text-black border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </form>
    </div>
  );
});
SearchBar.displayName = "SearchBar";

const PaneComponent = memo(({ pane, index, onClose, onClick, clickedLinks }: {
  pane: Pane;
  index: number;
  onClose: (index: number) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>, index: number) => void;
  clickedLinks: Set<string>;
}) => {
  return (
    <div className="flex-none w-[45rem] h-full border-r border-gray-200 overflow-y-auto">
      <div className="flex justify-between items-center p-2 bg-gray-100 sticky top-0 z-10">
        <h2 className="text-sm font-bold truncate text-black">{pane.title}</h2>
        <button
          onClick={() => onClose(index)}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200 text-black"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div
        className="wikipedia-content"
        onClick={(e) => onClick(e, index)}
        dangerouslySetInnerHTML={{ __html: pane.content }}
        ref={(node) => {
          if (node) {
            node.querySelectorAll("a").forEach(a => {
              if (clickedLinks.has(a.href)) {
                a.classList.add("clicked-link");
              }
            });
          }
        }}
      />
    </div>
  );
});
PaneComponent.displayName = "PaneComponent";

const WikipediaBrowser: React.FC = () => {
  const [panes, setPanes] = useState<Pane[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePane, setActivePane] = useState(-1);
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWikipediaContent("Main Page", true);

    // use wikipedia's stylesheet
    const link = document.createElement("link");
    link.href = "https://en.wikipedia.org/w/load.php?lang=en&modules=site.styles&only=styles&skin=vector";
    link.rel = "stylesheet";
    link.type = "text/css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const fetchWikipediaContent = useCallback(async (title: string, isHomepage: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(title)}&prop=text&formatversion=2&origin=*`);
      const data = await response.json();
      if (data.parse) {
        const newPane = { title: data.parse.title, content: data.parse.text, isHomepage };
        if (panes.length === 0 || (activePane === 0 && panes[0].isHomepage) || isHomepage) {
          // For the first pane or updating the homepage, just set or update it
          setPanes([newPane]);
          setActivePane(0);
        } else {
          // for subsequent panes, add to the right of the active pane
          setPanes(prevPanes => [
            ...prevPanes.slice(0, activePane + 1),
            newPane,
          ]);
          setActivePane(prevActivePane => prevActivePane + 1);
        }
      }
    } catch (error) {
      console.error("Error fetching Wikipedia content:", error);
      window.alert("Error fetching Wikipedia content :(");
    }
    setIsLoading(false);
  }, [panes, activePane]);

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLDivElement>, paneIndex: number) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a");
    if (link instanceof HTMLAnchorElement && link.href && link.title) {
      e.preventDefault();
      setClickedLinks(prev => new Set(prev).add(link.href));
      setActivePane(paneIndex);
      fetchWikipediaContent(link.title);
    }
  }, [panes, fetchWikipediaContent]);

  const closePane = useCallback((index: number) => {
    setPanes(prevPanes => prevPanes.filter((_, i) => i !== index));
    setActivePane(prevActivePane => prevActivePane > index ? prevActivePane - 1 : prevActivePane);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white">
      <SearchBar onSearch={fetchWikipediaContent} />
      <div className="flex overflow-x-auto flex-grow">
        {panes.map((pane, index) => (
          <PaneComponent
            key={index}
            pane={pane}
            index={index}
            onClose={closePane}
            onClick={handleLinkClick}
            clickedLinks={clickedLinks}
          />
        ))}
        {isLoading && (
          <div className="flex-none w-[45rem] h-full border-r border-gray-200 flex items-center justify-center text">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WikipediaBrowser;
