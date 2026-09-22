import type { CapacitorConfig } from '@capacitor/cli';

// appId — obrnut format domena, koristi se kao jedinstveni ID aplikacije
// na App Store i Google Play. Ne menjaj ga posle prve objave (identitet appa).
const config: CapacitorConfig = {
  appId: 'rs.lumen.klijent',
  appName: 'Lumen',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;