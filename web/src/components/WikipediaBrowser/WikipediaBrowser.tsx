import React, { useCallback, useEffect, useState } from "react";
import "./WikipediaBrowser.css";
import SearchBar from "@/components/SearchBar/SearchBar";
import Pane from "@/components/Pane/types";
import PaneComponent from "@/components/Pane/Pane";

const WikipediaBrowser: React.FC = () => {
  const [panes, setPanes] = useState<Pane[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePane, setActivePane] = useState(-1);
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWikipediaContent("Main Page").catch(console.error);

    // use wikipedia's stylesheet
    const link = document.createElement("link");
    link.href = "https://en.wikipedia.org/w/load.php?lang=en&modules=site.styles&only=styles&skin=vector";
    link.rel = "stylesheet";
    link.type = "text/css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWikipediaContent = useCallback(async (title: string, isSearchResult: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(title)}&prop=text&formatversion=2&origin=*`);
      const data = await response.json();
      if (data.parse) {
        const newPane = { title: data.parse.title, content: data.parse.text, isSearchResult, width: 720 };
        if (panes.length === 0 || isSearchResult) {
          setPanes([newPane]);
          setActivePane(0);
        } else {
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
    const image = target.closest("img")
    if(image){
      e.preventDefault();
      e.stopPropagation();
      window.open(image.src, "_blank");
    }else{
      if (link instanceof HTMLAnchorElement && link.href && link.title) {
        e.preventDefault();
        e.stopPropagation()
        setClickedLinks(prev => new Set(prev).add(link.href));
        setActivePane(paneIndex);
        fetchWikipediaContent(link.title);
      }
    }
  }, [fetchWikipediaContent]);

  const closePane = useCallback((index: number) => {
    setPanes(prevPanes => prevPanes.filter((_, i) => i !== index));
    setActivePane(prevActivePane => {
      if (prevActivePane >= index) {
        return Math.max(0, prevActivePane - 1);
      }
      return prevActivePane;
    });
  }, []);

  const handleResize = useCallback((index: number, delta: number) => {
    setPanes(prevPanes => {
      const newPanes = [...prevPanes];
      newPanes[index] = { ...newPanes[index], width: Math.max(200, newPanes[index].width + delta) };
      if (index < newPanes.length - 1) {
        newPanes[index + 1] = { ...newPanes[index + 1], width: Math.max(200, newPanes[index + 1].width - delta) };
      }
      return newPanes;
    });
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
            onResize={handleResize}
            isFocused={index === activePane}
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
