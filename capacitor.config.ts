import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seals.app',
  appName: 'seals-app',
  webDir: 'www',
  server: {
    url: 'https://usingvercel-muz2.vercel.app/inventory',
    cleartext: true
  }
};

export default config;
