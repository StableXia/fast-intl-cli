import { existsSync, realpathSync } from 'fs';
import { winPath } from './utils';

class BabelRegister {
  only: Record<string, string[]> = {};

  setOnlyMap({ key, value }: { key: string; value: string[] }) {
    this.only[key] = value;
    this.register();
  }

  register() {
    const only = Object.keys(this.only)
      .reduce<string[]>((memo, key) => {
        return memo.concat(this.only[key]);
      }, [])
      .map(winPath)
      .map((path) => (existsSync(path) ? realpathSync(path) : path));

    require('@babel/register')({
      presets: [
        require.resolve('@babel/preset-env'),
        require.resolve('@babel/preset-typescript'),
      ],
      ignore: [/node_modules/],
      only,
      extensions: ['.jsx', '.js', '.ts', '.tsx'],
      babelrc: false,
      cache: false,
    });
  }
}

export default new BabelRegister();
