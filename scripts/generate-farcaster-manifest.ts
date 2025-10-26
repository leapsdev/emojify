import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// 環境変数が設定されていない場合は、NODE_ENVから判断
// NODE_ENVがproductionの場合はproduction、それ以外はdevelopment
const ENVIRONMENT =
  process.env.NEXT_PUBLIC_ENVIRONMENT ||
  (process.env.NODE_ENV === 'production' ? 'production' : 'development');

const PUBLIC_DIR = join(process.cwd(), 'public', '.well-known');
const TARGET_FILE = join(PUBLIC_DIR, 'farcaster.json');

function main() {
  if (ENVIRONMENT !== 'production' && ENVIRONMENT !== 'development') {
    console.error(
      `❌ Error: Invalid NEXT_PUBLIC_ENVIRONMENT value: "${ENVIRONMENT}"`,
    );
    console.error('   Expected "production" or "development".');
    process.exit(1);
  }

  const sourceFile = join(PUBLIC_DIR, `farcaster.${ENVIRONMENT}.json`);

  if (!existsSync(sourceFile)) {
    console.error(`❌ Error: Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  try {
    copyFileSync(sourceFile, TARGET_FILE);
    console.log(
      `✅ Generated Farcaster manifest for ${ENVIRONMENT} environment`,
    );
    console.log(`   Source: farcaster.${ENVIRONMENT}.json`);
    console.log('   Target: farcaster.json');
    console.log(
      `   (Using ${ENVIRONMENT} based on ${
        process.env.NEXT_PUBLIC_ENVIRONMENT
          ? 'NEXT_PUBLIC_ENVIRONMENT'
          : 'NODE_ENV'
      })`,
    );
  } catch (error) {
    console.error('❌ Error copying manifest file:', error);
    process.exit(1);
  }
}

main();
