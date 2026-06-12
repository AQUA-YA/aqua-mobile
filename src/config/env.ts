import { Platform } from 'react-native';

const DEV_API_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api',
  default: 'http://localhost:3000/api',
});

const PROD_API_URL = 'https://api.aquaya.mx/api';

export const env = {
  API_URL: __DEV__ ? DEV_API_URL : PROD_API_URL,
  get WS_URL(): string {
    return this.API_URL.replace('/api', '').replace('http', 'ws');
  },
};
