import { useEffect, useState } from "react";


import { Book, BookShelfManager, BookViewer, PageLabelType } from "@magflip/core";
import { FlipView } from "@magflip/flipview";


export function Example2() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-[3vh] right-[2rem] z-9999">
        <button
          className="bg-[#444444] p-0 m-0 min-w-[4.6875rem] w-[4.6875rem] h-[4.6875rem] text-white"
          style={{ opacity: 1 }}
          onClick={() => setIsOpen(true)}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="text-[0.625rem] leading-[0.625rem] mt-[0.5rem] font-geologica font-regular">
              CATALOGUE
            </div>
          </div>
        </button>
        {isOpen && (
          <Catalogue onClose={() => setIsOpen(false)} />
        )}
    </div>
  )
}

const Catalogue = ({ onClose }: { onClose: () => void }) => {
  const [shelfManager, setShelfManager] = useState<BookShelfManager | null>(null);
  const [catalogue, setCatalogue] = useState<Book | null>(null);
  const [viewer, setViewer] = useState<BookViewer | null>(null);
  const [view, setView] = useState<FlipView | null>(null);
  const [pages, setPages] = useState<{ id: string, index: number, image: string }[]>([]);
  const pageCnt = 10;
  const onPrev = () => { 
    view?.prevPage(); 
  };
  const onNext = () => { 
    view?.nextPage(); 
  };
  const onMoveTo = (pageIndex:number) => {
    view?.moveTo(pageIndex);
  }


  useEffect(() => {
    if(shelfManager === null) {
      setShelfManager(new BookShelfManager({
        onViewerClose: onClose,
      }));
      return;
    }
    else {
  
      if(pages.length === 0) {
        const tempPages = [];
        for(let i = 0; i < pageCnt; i++) {
          tempPages.push({
            id: `page${i}`,
            index: i,
            image: `/resources/book2/page${i}.jpg`
          });
        }
        setPages(tempPages);
        return;
      }

      if(viewer === null) {
        setViewer(shelfManager.getBookViewer());
        return;
      }

      if(view === null) {
        const view = new FlipView({
          autoFlip: {
            forward: {
              offsetY: -100,
            },
            backward: {
              offsetY: 100,
            }
          }
        });
        setView(view);
        return;
      }

      if(catalogue === null) {
        setCatalogue(new Book({ 
          id: 'mybook1', 
          lastPageIndex: pages.length - 1,
          labels: {
            2: {
              index: 0,
              pageIndex: 2,
              type: PageLabelType.Default,
              content: 'A',
              backgroundColor: '#B74628',
              opacity: 0.5,
              onClick: onMoveTo
            },
            3: {
              index: 1,
              pageIndex: 3,
              type: PageLabelType.Default,
              content: 'B',
              backgroundColor: '#A6876D',
              opacity: 0.5,
              onClick: onMoveTo
            },
            4: {
              index: 2,
              pageIndex: 4,
              type: PageLabelType.Default,
              content: 'C',
              backgroundColor: '#92B53E',
              opacity: 0.5,
              onClick: onMoveTo
            },
            5: {
              index: 3,
              pageIndex: 5,
              type: PageLabelType.Default,
              content: 'D',
              backgroundColor: '#ECAD74',
              opacity: 0.5,
              onClick: onMoveTo
            },
            6: {
              index: 4,
              pageIndex: 6,
              type: PageLabelType.Default,
              content: 'E',
              backgroundColor: '#FBC33C',
              opacity: 0.5,
              onClick: onMoveTo
            },
            7: {
              index: 5,
              pageIndex: 7,
              type: PageLabelType.Default,
              content: 'F',
              backgroundColor: '#A95426',
              opacity: 0.5,
              onClick: onMoveTo
            },
            8: {
              index: 6,
              pageIndex: 8,
              type: PageLabelType.Default,
              content: 'G',
              backgroundColor: '#7C3795',
              opacity: 0.5,
              onClick: onMoveTo
            },
            9: {
              index: 7,
              pageIndex: 9,
              type: PageLabelType.Default,
              content: 'H',
              backgroundColor: '#DBBC99',
              opacity: 0.5,
              onClick: onMoveTo
            },
          },
          thumbnails: {
            spine: pages[0].image,
            small: pages[0].image,
            medium: pages[0].image,
            cover: {
              front: pages[0].image,
              back: pages[0].image,
            }
          }
        }))

        return;
      }

      catalogue.importPages(pages, { width: 700, height: 700 });
      shelfManager.importBookToShelf(catalogue);

      viewer.registerView(view);
      viewer.setCurView(view.id)
      // viewer.addPageChangeListener(onPageChange);
      shelfManager.pickupAndView(catalogue);
    }
  }, [shelfManager, catalogue, viewer, view, pages, onClose]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div id="bookShelf" style={{ display: 'none' }} />
      
      <div id="bookViewer">
        <button className="do-not-remove" onClick={onPrev}>Prev</button>
        <button className="do-not-remove" onClick={onNext}>Next</button>
      </div>
      <div style={{ position: 'absolute', bottom: '10%', left: '50%', display: 'flex', gap: '1rem' }}>
        <button onClick={onPrev}>Prev</button>
        <button onClick={onNext}>Next</button>
        <button onClick={() => onMoveTo(1)}>Move to 1</button>
        <button onClick={() => onMoveTo(2)}>Move to 2</button>
        <button onClick={() => onMoveTo(3)}>Move to 3</button>
        <button onClick={() => onMoveTo(4)}>Move to 4</button>
        <button onClick={() => onMoveTo(5)}>Move to 5</button>
        <button onClick={() => onMoveTo(6)}>Move to 6</button>
        <button onClick={() => onMoveTo(7)}>Move to 7</button>
        <button onClick={() => onMoveTo(8)}>Move to 8</button>
        <button onClick={() => onMoveTo(9)}>Move to 9</button>
        <button onClick={() => onMoveTo(10)}>Move to 10</button>
      </div>
    </div>
  )
}