import { useState, useEffect } from 'react';

// Shared types
interface ScanStats {
  harmless: number;
  malicious: number;
  suspicious: number;
  undetected: number;
  timeout: number;
}

interface ScanResult {
  engine_name: string;
  category: string;
  result: string | null;
  method: string;
  engine_update: string;
}

// Response interfaces for different scan types
interface FileResponse {
  data: {
    attributes: {
      last_analysis_results: Record<string, ScanResult>;
      last_analysis_stats: ScanStats;
      meaningful_name: string;
      md5: string;
      sha1: string;
      sha256: string;
    };
  };
}

interface UrlResponse {
  data: {
    attributes: {
      last_analysis_results: Record<string, ScanResult>;
      last_analysis_stats: ScanStats;
      url: string;
      last_final_url: string;
      title: string;
      last_http_response_code: number;
      last_http_response_content_length: number;
      last_analysis_date: number;
    };
  };
}

interface DomainResponse {
  data: {
    attributes: {
      last_analysis_results: Record<string, ScanResult>;
      last_analysis_stats: ScanStats;
      last_dns_records: Record<string, any>[];
      creation_date: number;
      last_update_date: number;
      registrar: string;
      reputation: number;
      last_analysis_date: number;
    };
  };
}

type ScanType = 'file' | 'url' | 'domain';
type ScanResponse = FileResponse | UrlResponse | DomainResponse;

const VirusTotalScanner: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [results, setResults] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanType, setScanType] = useState<ScanType>('url');

  // Load API key from .env.local
  useEffect(() => {
    const savedApiKey = process.env.NEXT_PUBLIC_VIRUSTOTAL_API_KEY || '';
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const fetchVirusTotalData = async (): Promise<void> => {
    if (!input.trim() || !apiKey.trim()) {
      setError('API key and input are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      switch (scanType) {
        case 'file':
          endpoint = `https://www.virustotal.com/api/v3/files/${input}`;
          break;
        case 'url':
          const urlId = btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;
          break;
        case 'domain':
          endpoint = `https://www.virustotal.com/api/v3/domains/${input}`;
          break;
      }

      const response = await fetch(endpoint, {
        headers: {
          'x-apikey': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to fetch data from VirusTotal');
    } finally {
      setLoading(false);
    }
  };

  const renderPlaceholderText = (): string => {
    switch (scanType) {
      case 'file':
        return 'Enter a file hash (MD5, SHA-1, or SHA-256)';
      case 'url':
        return 'Enter a URL to scan (include http:// or https://)';
      case 'domain':
        return 'Enter a domain name (e.g., example.com)';
      default:
        return 'Enter value to scan';
    }
  };

  const renderResultsContent = () => {
    if (!results) return null;

    let resultContent = null;
    if ('data' in results && 'attributes' in results.data) {
      if (scanType === 'file' && 'md5' in results.data.attributes) {
        resultContent = (
          <div>
            <h3>File Analysis Results</h3>
            <p>MD5: {results.data.attributes.md5}</p>
            <p>SHA-1: {results.data.attributes.sha1}</p>
            <p>SHA-256: {results.data.attributes.sha256}</p>
          </div>
        );
      } else if (scanType === 'url' && 'url' in results.data.attributes) {
        resultContent = (
          <div>
            <h3>URL Analysis Results</h3>
            <p>URL: {results.data.attributes.url}</p>
            <p>Final URL: {results.data.attributes.last_final_url}</p>
          </div>
        );
      } else if (scanType === 'domain' && 'registrar' in results.data.attributes) {
        resultContent = (
          <div>
            <h3>Domain Analysis Results</h3>
            <p>Registrar: {results.data.attributes.registrar}</p>
            <p>Creation Date: {new Date(results.data.attributes.creation_date * 1000).toLocaleDateString()}</p>
          </div>
        );
      }
    }

    return resultContent;
  };

  return (
    <div>
      <h1>VirusTotal Scanner</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={renderPlaceholderText()}
      />
      <select value={scanType} onChange={(e) => setScanType(e.target.value)}>
        <option value="url">URL</option>
        <option value="file">File</option>
        <option value="domain">Domain</option>
      </select>
      <button onClick={fetchVirusTotalData} disabled={loading}>
        {loading ? 'Loading...' : 'Scan'}
      </button>

      {error && <p>Error: {error}</p>}
      {renderResultsContent()}
    </div>
  );
};

export default VirusTotalScanner;
