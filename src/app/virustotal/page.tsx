"use client";
import React, { useState } from "react";
import Navbar from "../navbar";

type ScanType = "file" | "url" | "domain";

const VirusTotalScanner: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [scanType, setScanType] = useState<ScanType>("file");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateInput = (): boolean => {
    if (!apiKey.trim()) {
      setError("API key is required");
      return false;
    }
    if (!input.trim()) {
      setError("Input is required");
      return false;
    }
    return true;
  };

  const fetchVirusTotalData = async (): Promise<void> => {
    if (!validateInput()) return;

    setLoading(true);
    setError(null);

    try {
      let endpoint = "";
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
        method: "GET",
        headers: {
          "x-apikey": apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data from VirusTotal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">VirusTotal Scanner</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">API Key</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter your API Key"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Input</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter URL, domain, or file hash"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Scan Type</label>
        <select value={scanType} onChange={(e) => setScanType(e.target.value as ScanType)} className="w-full p-2 border rounded">
          <option value="file">File Hash</option>
          <option value="url">URL</option>
          <option value="domain">Domain</option>
        </select>
      </div>

      <button onClick={fetchVirusTotalData} className="bg-blue-500 text-white p-2 rounded">
        Scan
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {loading && <p>Loading...</p>}

      {results && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h2 className="text-lg font-bold">Results</h2>
          <pre className="text-sm">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default VirusTotalScanner;
