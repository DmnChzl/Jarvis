import { defineNitroConfig } from 'nitropack/config';
import path from 'node:path';

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: 'latest',
  srcDir: 'server',
  imports: false,
  alias: {
    '@server': path.resolve(__dirname, 'server')
  }
});
