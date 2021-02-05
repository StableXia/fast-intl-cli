import ora from "ora";

/**
 * 进度条加载
 */
function spining(text: string, callback: () => void) {
  const spinner = ora(`${text}中...`).start();
  if (callback) {
    callback();
  }
  spinner.succeed(`${text}成功`);
}
