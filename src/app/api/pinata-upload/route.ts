import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT || '',
  pinataGateway: process.env.PINATA_GATEWAY || '',
});

export async function POST(req: NextRequest) {
  // Content-Typeによって処理を分岐
  const contentType = req.headers.get('content-type') || '';

  try {
    if (contentType.includes('multipart/form-data')) {
      // ファイルアップロード
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 },
        );
      }
      const result = await pinata.upload.public.file(file);
      return NextResponse.json({ cid: result.cid });
    }
    if (contentType.includes('application/json')) {
      // メタデータアップロード
      const body = await req.json();
      if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
      const result = await pinata.upload.public.json(body);
      return NextResponse.json({ cid: result.cid });
    }
    return NextResponse.json(
      { error: 'Unsupported Content-Type' },
      { status: 415 },
    );
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || 'Upload failed' },
      { status: 500 },
    );
  }
}
