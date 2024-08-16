'use client'

import React, { useState, useEffect } from 'react';
import './WikipediaBrowser.css';

interface Pane {
  title: string;
  content: string;
  isHomepage: boolean;
}

const WikipediaBrowser: React.FC = () => {
  const [panes, setPanes] = useState<Pane[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePane, setActivePane] = useState(-1);

  useEffect(() => {
    fetchWikipediaContent('Main Page', true);

    // use wikipedia's stylesheet
    const link = document.createElement('link');
    link.href = 'https://en.wikipedia.org/w/load.php?lang=en&modules=site.styles&only=styles&skin=vector';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const fetchWikipediaContent = async (title: string, isHomepage: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(title)}&prop=text&formatversion=2&origin=*`);
      const data = await response.json();
      if (data.parse) {
        const newPane = { title: data.parse.title, content: data.parse.text, isHomepage };
        if (panes.length === 0 || (activePane === 0 && panes[0].isHomepage)) {
          // For the first pane or updating the homepage, just set or update it
          setPanes([newPane]);
          setActivePane(0);
        } else {
          // for subsequent panes, add to the right of the active pane
          setPanes(prevPanes => [
            ...prevPanes.slice(0, activePane + 1),
            newPane
          ]);
          setActivePane(prevActivePane => prevActivePane + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching Wikipedia content:', error);
    }
    setIsLoading(false);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>, paneIndex: number) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (link instanceof HTMLAnchorElement && link.href && link.title) {
      e.preventDefault();
      if (panes[paneIndex].isHomepage) {
        // if it's the homepage, update the current pane
        fetchWikipediaContent(link.title);
      } else {
        // otherwise, open in a new pane to the right
        setActivePane(paneIndex);
        fetchWikipediaContent(link.title);
      }
    }
  };

  const closePane = (index: number) => {
    setPanes(prevPanes => prevPanes.filter((_, i) => i !== index));
    setActivePane(prevActivePane => prevActivePane > index ? prevActivePane - 1 : prevActivePane);
  };

  return (
    <div className="flex overflow-x-auto h-screen bg-white">
      {panes.map((pane, index) => (
        <div key={index} className="flex-none w-[45rem] h-full border-r border-gray-200 overflow-y-auto">
          <div className="flex justify-between items-center p-2 bg-gray-100 sticky top-0 z-10">
            <h2 className="text-sm font-bold truncate text-black">{pane.title}</h2>
            {index > 0 && (
              <button
                onClick={() => closePane(index)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200 text-black"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <div
            className="wikipedia-content"
            onClick={(e) => handleLinkClick(e, index)}
            dangerouslySetInnerHTML={{ __html: pane.content }}
          />
        </div>
      ))}
      {isLoading && (
        <div className="flex-none w-[45rem] h-full border-r border-gray-200 flex items-center justify-center text">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default WikipediaBrowser;
