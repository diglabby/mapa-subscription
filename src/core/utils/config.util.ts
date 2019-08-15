export function getConfigByEnv(configs: any) {
  const env: string = process.env.NODE_ENV || 'development';
  return configs[env];
}
