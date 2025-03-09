import { NextResponse } from 'next/server';
import axios from 'axios';
import * as xml2js from 'xml2js';

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  imageUrl?: string;
};

export async function GET() {
  try {
    // The Hacker News RSS feed URL
    const rssUrl = 'https://feeds.feedburner.com/TheHackersNews';
    
    const response = await axios.get(rssUrl);
    const parser = new xml2js.Parser({ explicitArray: false });
    
    const result = await parser.parseStringPromise(response.data);
    
    // Extract the items from the RSS feed
    const items = result.rss.channel.item;
    
    // Take the 3 most recent news items
    const latestNews: NewsItem[] = items.slice(0, 3).map((item: any) => {
      // Extract image URL from the content if available
      let imageUrl = null;
      
      // First, try to get image from content:encoded (which usually contains the full article content)
      if (item['content:encoded']) {
        const contentMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
        if (contentMatch) {
          imageUrl = contentMatch[1];
        }
      }
      
      // If no image found in content:encoded, check for media:content
      if (!imageUrl && item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
        imageUrl = item['media:content'].$.url;
      }
      
      // If still no image found, check for enclosure (sometimes used for podcast/media thumbnails)
      if (!imageUrl && item.enclosure && item.enclosure.$ && item.enclosure.$.url && 
          item.enclosure.$.type && item.enclosure.$.type.startsWith('image/')) {
        imageUrl = item.enclosure.$.url;
      }
      
      // If still no image found, check if there's an image in the description
      if (!imageUrl && item.description) {
        const descMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (descMatch) {
          imageUrl = descMatch[1];
        }
      }
      
      // Extract plain text from HTML description
      const description = item.description
        ? item.description
            .replace(/<[^>]*>?/gm, '') // Remove HTML tags
            .substring(0, 200) + '...' // Limit to 200 chars
        : 'No description available';
      
      return {
        id: item.guid ? (item.guid._ || item.guid) : `news-${Math.random().toString(36).substring(2, 9)}`,
        title: item.title || 'No title',
        summary: description,
        date: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : 'Unknown date',
        source: 'The Hacker News',
        url: item.link || '#',
        imageUrl: imageUrl
      };
    });
    
    // Return the response
    return NextResponse.json(latestNews, {
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate'
      }
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return NextResponse.json({ error: 'Failed to fetch cybersecurity news' }, { status: 500 });
  }
}