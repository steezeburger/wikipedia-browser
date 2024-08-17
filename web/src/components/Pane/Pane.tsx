import React, { memo, useEffect, useRef } from "react";
import Pane from "@/components/Pane/types";

const Resizer = memo(({ onResize }: { onResize: (delta: number) => void }) => {
  const startResizeX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startResizeX.current = e.clientX;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const delta = e.clientX - startResizeX.current;
    onResize(delta);
    startResizeX.current = e.clientX;
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="resizer w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 transition-colors absolute top-0 right-0 bottom-0"
      onMouseDown={handleMouseDown}
    />
  );
});
Resizer.displayName = "Resizer";

const PaneComponent = memo(({ pane, index, onClose, onClick, clickedLinks, onResize, isFocused }: {
  pane: Pane;
  index: number;
  onClose: (index: number) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>, index: number) => void;
  clickedLinks: Set<string>;
  onResize: (index: number, delta: number) => void;
  isFocused: boolean;
}) => {
  const paneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && paneRef.current) {
      paneRef.current.focus();
      paneRef.current.scrollIntoView({ behavior: 'smooth', inline: 'start' });
    }
  }, [isFocused]);

  return (
    <div
      ref={paneRef}
      className={`pane-container relative flex-none h-full ${isFocused ? 'focused' : ''}`}
      style={{ width: pane.width }}
      tabIndex={0}
    >
      <div className="h-full border-r border-gray-200 overflow-y-auto">
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
      <Resizer onResize={(delta) => onResize(index, delta)} />
    </div>
  );
});
PaneComponent.displayName = "PaneComponent";

export default PaneComponent;
