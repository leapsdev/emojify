export function ipfsToHttp(ipfsUrl: string): string {
  if (!ipfsUrl) return '';
  const hash = ipfsUrl.replace('ipfs://', '');
  return `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${hash}`;
}
