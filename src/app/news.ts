import type { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewsItem[] | { error: string }>
) {
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
      if (item['content:encoded']) {
        const match = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
        if (match) {
          imageUrl = match[1];
        }
      }
      
      // Extract plain text from HTML description
      const description = item.description
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags
        .substring(0, 200) + '...'; // Limit to 200 chars
      
      return {
        id: item.guid._ || item.guid,
        title: item.title,
        summary: description,
        date: new Date(item.pubDate).toISOString().split('T')[0],
        source: 'The Hacker News',
        url: item.link,
        imageUrl: imageUrl
      };
    });
    
    // Set cache headers (cache for 10 minutes)
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json(latestNews);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    res.status(500).json({ error: 'Failed to fetch cybersecurity news' });
  }
}