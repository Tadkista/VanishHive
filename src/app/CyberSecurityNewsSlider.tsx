"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  imageUrl?: string;
}

const CyberSecurityNewsSlider = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // Call API route
        const response = await fetch('/api/cyber-news');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setNews(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError("Failed to fetch cybersecurity news");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === news.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? news.length - 1 : prev - 1));
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);
    
    return () => clearInterval(interval);
  }, [news, currentSlide]);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 flex items-center justify-center h-64 rounded-lg">
        <div className="text-gray-500">Loading cybersecurity news...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-gray-500">No cybersecurity news available</div>
      </div>
    );
  }

  return (
    <div className='w-4/5 flex justify-center'>
        <div className="w-4/5 relative mt-15 mb-5">
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-96">
              {news.map((item, index) => (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-500 p-6 ${
                    index === currentSlide ? 'opacity-100 z-1' : 'opacity-0 z-0'
                  }`}
                >
                  <div className="flex flex-col h-full justify-around">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-amber-500 font-semibold">{item.source}</span>
                      <span className="text-sm text-gray-200">{item.date}</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4 text-gray-200">{item.title}</h2>
                    
                    {/* Article content with image */}
                    <div className="flex gap-4">
                      {item.imageUrl && !imageErrors[item.id] ? (
                        <div className="flex-shrink-0 relative w-40 h-32">
                          <Image 
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover rounded-lg"
                            onError={() => handleImageError(item.id)}
                            unoptimized={true}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 bg-gray-200 w-40 h-32 rounded-md flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image available</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-gray-200">{item.summary}</p>
                      </div>
                    </div>
                    
                    <a
                      href={item.url}
                      className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-3xl hover:bg-amber-700 transition-all self-end"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read full article
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between p-4 bg-gray-700 border-t ">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full hover:bg-gray-600 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex items-center space-x-2">
                {news.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentSlide ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className="p-2 rounded-full hover:bg-gray-600 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default CyberSecurityNewsSlider;