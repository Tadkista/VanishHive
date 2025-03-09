"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  date: string;
}

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Note: This is a mock implementation - in a real app, you'd need a server-side 
        // component or API that can fetch and parse the content from The Hacker News
        // as direct web scraping from the client side isn't possible due to CORS restrictions
        
        // Simulated response with placeholder data
        const mockData: NewsItem[] = [
          {
            id: '1',
            title: 'New Critical Vulnerability Found in Popular Software',
            summary: 'Security researchers have discovered a zero-day vulnerability affecting millions of users. Patches are being developed urgently.',
            url: 'https://thehackernews.com/article1',
            imageUrl: '/api/placeholder/600/300',
            date: 'March 7, 2025'
          },
          {
            id: '2',
            title: 'Major Data Breach Exposes User Credentials',
            summary: 'A prominent online service reported unauthorized access to their database containing user information. Users are advised to change passwords immediately.',
            url: 'https://thehackernews.com/article2',
            imageUrl: '/api/placeholder/600/300',
            date: 'March 6, 2025'
          },
          {
            id: '3',
            title: 'New Ransomware Campaign Targets Healthcare Organizations',
            summary: 'Cybersecurity experts warn of sophisticated attacks specifically targeting hospitals and medical facilities with encrypted malware.',
            url: 'https://thehackernews.com/article3',
            imageUrl: '/api/placeholder/600/300',
            date: 'March 5, 2025'
          },
        ];
        
        setNews(mockData);
      } catch (err) {
        setError('Failed to fetch news. Please try again later.');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + news.length) % news.length);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading latest security news...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>;
  }

  if (news.length === 0) {
    return <div className="p-4">No news available at the moment.</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      <h2 className="text-2xl font-bold mb-4">Latest from The Hacker News</h2>
      
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <div className="relative h-64 bg-gray-100">
          <img 
            src={news[currentIndex].imageUrl}
            alt={news[currentIndex].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-4 text-white">
            <h3 className="text-lg font-semibold">{news[currentIndex].title}</h3>
            <p className="text-sm mt-1">{news[currentIndex].summary}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs">{news[currentIndex].date}</span>
              <a 
                href={news[currentIndex].url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white"
              >
                Read More
              </a>
            </div>
          </div>
        </div>
        
        <button 
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full hover:bg-opacity-100 transition"
          aria-label="Previous article"
        >
          <ChevronLeft className="h-6 w-6 text-gray-800" />
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full hover:bg-opacity-100 transition"
          aria-label="Next article"
        >
          <ChevronRight className="h-6 w-6 text-gray-800" />
        </button>
      </div>
      
      <div className="flex justify-center mt-4">
        {news.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full mx-1 ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default News;