import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '~api': path.resolve(__dirname, 'src/api'),
      '~repositories': path.resolve(__dirname, 'src/services/repositories'),
      '~src': path.resolve(__dirname, 'src'),
      '~templates': path.resolve(__dirname, 'src/templates'),
      '~utils': path.resolve(__dirname, 'src/utils')
    }
  }
});
