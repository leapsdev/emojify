const GATEWAYS = [
  process.env.NEXT_PUBLIC_GATEWAY_URL
    ? `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/`
    : null,
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
].filter(Boolean) as string[];

export async function fetchFromIpfsGateways(
  ipfsUrl: string,
): Promise<Response> {
  const hash = ipfsUrl.replace('ipfs://', '');
  for (const gateway of GATEWAYS) {
    try {
      const url = gateway + hash;
      const res = await fetch(url);
      if (res.ok) return res;
    } catch {
      // 次のゲートウェイを試す
    }
  }
  throw new Error('All IPFS gateways failed');
}

export function ipfsToHttp(ipfsUrl: string): string {
  const hash = ipfsUrl.replace('ipfs://', '');
  // public gateway（ipfs.io）をデフォルトに
  return `https://ipfs.io/ipfs/${hash}`;
}
