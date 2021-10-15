export interface IFastIntlConfig {
  langDir: string;
  defaultLang: string;
  langs: string[];
  ignoreFile: ((basename: string) => boolean) | RegExp;
  ignoreDir: ((basename: string) => boolean) | RegExp;
}
