"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../navbar";

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

type ScanType = "file" | "url" | "domain";
type ScanResponse = FileResponse | UrlResponse | DomainResponse;

const VirusTotalScanner: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [results, setResults] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanType, setScanType] = useState<ScanType>("file");

  // Load API key from localStorage if available
  useEffect(() => {
    const savedApiKey = "ebc3aa96b22e1cb1c1223acb0c72ddc09f766720cdfc580f0b514ec136161b5a";
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const isValidHash = (value: string): boolean => {
    // Check if the input is a valid MD5, SHA-1, or SHA-256 hash
    const md5Regex = /^[a-fA-F0-9]{32}$/;
    const sha1Regex = /^[a-fA-F0-9]{40}$/;
    const sha256Regex = /^[a-fA-F0-9]{64}$/;
    return md5Regex.test(value) || sha1Regex.test(value) || sha256Regex.test(value);
  };

  const isValidUrl = (value: string): boolean => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isValidDomain = (value: string): boolean => {
    // Basic domain validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(value);
  };

  const validateInput = (): boolean => {
    if (!apiKey.trim()) {
      setError("API key is required");
      return false;
    }

    if (!input.trim()) {
      setError("Input is required");
      return false;
    }

    switch (scanType) {
      case "file":
        if (!isValidHash(input)) {
          setError("Please enter a valid MD5, SHA-1, or SHA-256 hash");
          return false;
        }
        break;
      case "url":
        if (!isValidUrl(input)) {
          setError("Please enter a valid URL (including http:// or https://)");
          return false;
        }
        break;
      case "domain":
        if (!isValidDomain(input)) {
          setError("Please enter a valid domain name");
          return false;
        }
        break;
    }

    return true;
  };

  const fetchVirusTotalData = async (): Promise<void> => {
    if (!validateInput()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let endpoint = "";
      let method = "GET";
      let body = undefined;

      switch (scanType) {
        case "file":
          endpoint = `https://www.virustotal.com/api/v3/files/${input}`;
          break;
        case "url":
          const urlId = btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
          endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;
          break;
        case "domain":
          endpoint = `https://www.virustotal.com/api/v3/domains/${input}`;
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "x-apikey": apiKey,
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data from VirusTotal");
    } finally {
      setLoading(false);
    }
  };

  const renderResultsContent = () => {
    if (!results) return null;

    let resultContent = null;

    if ("data" in results && "attributes" in results.data) {
      if (scanType === "file" && "md5" in results.data.attributes) {
        resultContent = (
          <div>
            <p>MD5: {results.data.attributes.md5}</p>
            <p>SHA1: {results.data.attributes.sha1}</p>
            <p>SHA256: {results.data.attributes.sha256}</p>
            {/* Add more fields here */}
          </div>
        );
      } else if (scanType === "url" && "url" in results.data.attributes) {
        resultContent = (
          <div>
            <p>URL: {results.data.attributes.url}</p>
            <p>Title: {results.data.attributes.title}</p>
            {/* Add more fields here */}
          </div>
        );
      } else if (scanType === "domain" && "registrar" in results.data.attributes) {
        resultContent = (
          <div>
            <p>Registrar: {results.data.attributes.registrar}</p>
            {/* Add more fields here */}
          </div>
        );
      }
    }

    return <div>{resultContent}</div>;
  };

  return (
    <div>
      <Navbar />
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter ${scanType} to scan`}
        />
        <select onChange={(e) => setScanType(e.target.value)} value={scanType}>
          <option value="file">File</option>
          <option value="url">URL</option>
          <option value="domain">Domain</option>
        </select>
        <button onClick={fetchVirusTotalData} disabled={loading}>
          {loading ? "Loading..." : "Scan"}
        </button>
      </div>

      {error && <p>{error}</p>}
      {renderResultsContent()}
    </div>
  );
};

export default VirusTotalScanner;
