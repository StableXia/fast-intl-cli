import ora from "ora";

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
    console.log(msg);
  }
}

export const log = new Log();
