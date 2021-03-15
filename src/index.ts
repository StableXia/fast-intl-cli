#!/usr/bin/env node

import commander from "commander";
import inquirer from "inquirer";
import packageJson from "../package.json";
import { initCLI, initLangs } from "./init";
import { exportUntranslatedMessages, exportUnusedMessages } from "./exports";
import { spining } from "./view";
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
  .description("导出未翻译的文案")
  .action((args) => {
    console.log("args", args);
    spining("导出未翻译的文案", () => {
      exportUntranslatedMessages();
    });
  });

commander
  .command("unused")
  .description("导出未使用文案")
  .action((args) => {
    console.log("args", args);
    spining("导出未使用文案", () => {
      exportUnusedMessages();
    });
  });

commander
  .command("undefined")
  .requiredOption("-f, --file <filePath>", "必须指定扫描的文件或文件夹")
  .option("-l, --lang <lang>", "要检查的语言")
  .description("校验未定义的文案")
  .action((args) => {
    checkUndefinedMessages(args.file, args.lang);
  });

commander.parseAsync(process.argv);
