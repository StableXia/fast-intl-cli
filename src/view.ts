import ora from "ora";
import prettier from "prettier";
import chalk from "chalk";

/**
 * 进度条加载
 */
export function spining(msg: string, callback: () => void) {
  const spinner = ora(`${msg}中...`).start();
  if (callback) {
    callback();
  }
  spinner.succeed(`${msg}成功`);
}

class Log {
  error(msg: string) {
    console.log(chalk.red(msg));
  }

  warn(msg: string) {
    console.log(chalk.yellow(msg));
  }

  primary(msg: string) {
    console.log(msg);
  }

  get chalk() {
    return chalk;
  }
}

export const log = new Log();

/**
 * 使用 Prettier 格式化文件
 * @param fileContent
 */
export function prettierFile(fileContent: string, options?: prettier.Options) {
  try {
    return prettier.format(fileContent, options);
  } catch (e) {
    log.error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`);
    return fileContent;
  }
}
