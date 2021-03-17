#!/usr/bin/env node

import commander from "commander";
import inquirer from "inquirer";
import packageJson from "../package.json";
import { initCLI, initLangs } from "./init";
import { exportUntranslatedMessages, exportUnusedMessages } from "./exports";
import { checkUndefinedMessages } from "./checkUndefinedMessages";

commander
  .version(packageJson.version, "-v, --version")
  .name("ftintl")
  .usage("国际化工具");

commander
  .command("init")
  .option("-y", "使用默认配置")
  .description("初始化项目")
  .action(async (args) => {
    if (args.y) {
      initCLI();
      initLangs();
      return;
    }

    const res = await inquirer.prompt({
      type: "confirm",
      name: "confirm",
      default: false,
      message: "是否初始化CLI相关配置？",
    });

    if (res.confirm) {
      initCLI();
    }
  });

commander
  .command("untranslated")
  .option("--export <export>", "导出目录")
  .option("--lang <lang>", "要检查的语言")
  .description("导出未翻译的文案")
  .action((options) => {
    exportUntranslatedMessages(options.export, options.lang);
  });

commander
  .command("unused")
  .requiredOption("--file <filePath>", "必须指定扫描的文件或文件夹")
  .option("--lang <lang>", "要检查的语言")
  .description("导出未使用文案")
  .action((options) => {
    exportUnusedMessages(options.file, options.lang);
  });

commander
  .command("undefined")
  .requiredOption("--file <filePath>", "必须指定扫描的文件或文件夹")
  .option("--lang <lang>", "要检查的语言")
  .description("校验未定义的文案")
  .action((options) => {
    checkUndefinedMessages(options.file, options.lang);
  });

commander.parseAsync(process.argv);
