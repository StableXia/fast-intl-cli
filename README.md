# fast-intl-cli

fast-intl-cli 是 [vscode-fast-intl](https://github.com/xiaotangdou/vscode-fast-intl/blob/master/README.md) 的一个 CLI 辅助工具

### 如何使用

#### ftintl init

```js
export default {
  // 多语言文件扩展名
  langExt: 'json',
  // 多语言文件组合方式
  mode: 'single',
  // 语言文件目录
  langDir: './.fastIntl/',
  // 默认语言
  defaultLang: 'zh-hans',
  // 多语言目录
  langs: ['zh-hans'],
  ignoreFile: (basename) => {
    return /.(json|md|png|jpg|jpeg|svg)$/.test(basename);
  },
  ignoreDir: (basename) => {
    return /.(node_modules|__tests__)$/.test(basename);
  },
};
```

#### ftintl untranslated

```sh
# 导出资源文件中未翻译的文案
# mode - 输出校验文案的方式，terminal、json，默认：terminal
# output-path - 指定文件导出目录
# lang - 指定检查语言
ftintl untranslated terminal --output-path=[path] --lang=[lang]
```

#### ftintl unused

```sh
# 校验资源文件中未使用文案
# file - 指定要校验的文件或文件夹
# lang - 指定校验语言
ftintl unused --file=<path> --lang=[lang]
```

#### ftintl undefined

```sh
# 校验已使用但未在资源文件定义的文案
# file - 指定要校验的文件或文件夹
# lang - 指定校验语言
ftintl undefined --file=<path> --lang=[lang]
```

#### ftintl zh

```sh
# 检查文件中的中文文案
# mode - 输出校验文案的方式，terminal、json，默认：terminal
# file - 指定要校验的文件或文件夹
# output-path - 以 json 模式输出校验文案的 path
ftintl zh terminal --file=<path>
```

### demo

![image](https://github.com/xiaotangdou/fast-intl-cli/blob/main/demo.gif)
