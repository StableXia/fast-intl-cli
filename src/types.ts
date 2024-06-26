export interface IFastIntlConfig {
  langExt: 'json' | 'ts';
  mode: 'single' | 'multi';
  langDir: string;
  defaultLang: string;
  langs: string[];
  ignoreFile: ((basename: string) => boolean) | RegExp;
  ignoreDir: ((basename: string) => boolean) | RegExp;
}
