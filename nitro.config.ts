import { defineNitroConfig } from 'nitropack/config';
import path from 'node:path';

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: 'latest',
  srcDir: 'server',
  imports: false,
  alias: {
    '@database': path.resolve(__dirname, 'database'),
    '@server': path.resolve(__dirname, 'server')
  }
});
