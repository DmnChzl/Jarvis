import { defineNitroConfig } from 'nitropack/config';
import path from 'node:path';

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: 'latest',
  srcDir: 'src',
  imports: false,
  alias: {
    '~api': path.resolve(__dirname, 'src/api'),
    '~repositories': path.resolve(__dirname, 'src/services/repositories'),
    '~src': path.resolve(__dirname, 'src'),
    '~templates': path.resolve(__dirname, 'src/templates'),
    '~utils': path.resolve(__dirname, 'src/utils')
  }
});
