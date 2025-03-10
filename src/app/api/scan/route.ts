// pages/api/scan.ts (dla Next.js 12) lub app/api/scan/route.ts (dla Next.js 13+)
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get('input');
  const scanType = searchParams.get('scanType');

  if (!input || !scanType) {
    return NextResponse.json({ error: 'Missing input or scanType' }, { status: 400 });
  }

  let endpoint = '';
  if (scanType === 'file') {
    endpoint = `https://www.virustotal.com/api/v3/files/${input}`;
  } else if (scanType === 'url') {
    const urlId = btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;
  } else if (scanType === 'domain') {
    endpoint = `https://www.virustotal.com/api/v3/domains/${input}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'x-apikey': process.env.VIRUSTOTAL_API_KEY || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Error: ${response.status} - ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch data from VirusTotal' }, { status: 500 });
  }
}
