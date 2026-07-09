import React from 'react';

interface NewsData {
  _id: string;
  title: string;
  date: string;
  summary?: string;
  link?: string;
  image?: string;
}

interface NewsItemProps {
  news: NewsData;
  isOpen: boolean;
  onToggle: () => void;
}

export default function NewsItem({ news, isOpen, onToggle }: NewsItemProps) {
  const formattedDate = new Date(news.date).toLocaleDateString('no-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="cursor-pointer pb-[37px] w-full min-w-0" onClick={onToggle}>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-fm w-full min-w-0">
        
        {/* Gjennomgående, hel linje. Mobil: rad 1, spenn 4. Desktop: rad 1, start 3, spenn 6. */}
        <div className="col-start-1 col-span-4 row-start-1 md:col-start-3 md:col-span-6 border-t border-black md:row-start-1 min-w-0" />
        
        {/* Dato. Mobil: rad 2, start 1, spenn 1. Desktop: rad 1, start 3. */}
        <div className="col-start-1 col-span-1 row-start-2 md:col-start-3 md:row-start-1 min-w-0">
          <span className="block leading-[37px] break-all">{formattedDate}</span>
        </div>
        
        {/* Tittel. Mobil: rad 2, start 2, spenn 3. Desktop: rad 1, start 4, spenn 5. */}
        <div className="col-start-2 col-span-3 row-start-2 md:col-start-4 md:col-span-5 md:row-start-1 text-black min-w-0">
          <span className="block leading-[37px] break-all">{news.title}</span>
        </div>

        {/* Bilde. Mobil: rad 3, start 1, spenn 4, relative. Desktop: rad 1, start 1, spenn 2, h-0, absolute. */}
        {isOpen && (
          <div className="col-start-1 col-span-4 row-start-3 md:col-start-1 md:col-span-2 md:row-span-3 md:row-start-1 min-w-0 w-full relative mt-[17px] md:mt-0 md:h-0 z-10">
             {news.image && (
               /* eslint-disable-next-line @next/next/no-img-element */
               <img src={news.image} alt={news.title} className="w-full relative md:absolute md:top-0 md:left-0 md:w-[calc(100%+6.25rem)] md:max-w-none h-auto block md:ml-[-6.25rem] ml-0" />
             )}
          </div>
        )}
        
        {/* Oppsummering og lenke. Mobil: rad 4, start 1, spenn 4. Desktop: rad 2, start 3, spenn 4. */}
        {isOpen && (
          <div className="col-start-1 col-span-4 row-start-4 md:col-start-3 md:col-span-4 flex flex-col md:row-start-2 pt-[17px] min-w-0">
            <p className="m-0 text-black whitespace-pre-line leading-[37px] break-all">
              {news.summary?.trim()}
            </p>
            
            {news.link && (
              <a href={news.link} target="_blank" rel="noopener noreferrer" className="block mt-[37px] text-black hover:opacity-70 leading-[37px]">
                Link to event
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
