export interface ICLIConfig {
  langDir: string;
  ZHHans: string;
  langs: string[];
  ignoreFile: ((basename: string) => boolean) | RegExp;
  ignoreDir: ((basename: string) => boolean) | RegExp;
}
