#!/usr/bin/env node

const commander = require("commander");
const ora = require("ora");
const packageJson = require("../package.json");
const { initProject } = require("../src/init");

/**
 * 进度条加载
 * @param text
 * @param callback
 */
function spining(text, callback) {
  const spinner = ora(`${text}中...`).start();
  if (callback) {
    callback();
  }
  spinner.succeed(`${text}成功`);
}

commander.version(packageJson.version, "-v, --version");

commander
  .command("init <name>")
  .description("初始化项目")
  .action((source, destination) => {
    console.log(source, destination);
    initProject();
  });

commander.parse(process.argv);
