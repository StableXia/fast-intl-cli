#!/usr/bin/env node

import commander from "commander";
import inquirer from "inquirer";
import packageJson from "../package.json";
import { initCLI, initLangs } from "./init";
import { exportUntranslatedMessages, exportUnusedMessages } from "./exports";
import { checkUndefinedMessages } from "./checkUndefinedMessages";
import { checkChineseText } from "./checkChineseText";
import { spining } from "./view";

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

/**
 * 导出资源文件中未翻译的文案
 */
commander
  .command("untranslated")
  .option("--output-path <outputPath>", "输出目录")
  .option("--lang <lang>", "要检查的语言")
  .description("导出资源文件中未翻译的文案")
  .action((options) => {
    spining("导出资源文件中未翻译的文案", () => {
      exportUntranslatedMessages(options.outputPath, options.lang);
    });
  });

/**
 * 校验资源文件中未使用文案
 */
commander
  .command("unused")
  .requiredOption("--file <filePath>", "必须指定扫描的文件或文件夹")
  .option("--lang <lang>", "要检查的语言")
  .description("校验资源文件中未使用文案")
  .action((options) => {
    spining("校验资源文件中未使用文案", () => {
      exportUnusedMessages(options.file, options.lang);
    });
  });

/**
 * 校验已使用但未在资源文件定义的文案
 */
commander
  .command("undefined")
  .requiredOption("--file <filePath>", "必须指定扫描的文件或文件夹")
  .option("--lang <lang>", "要检查的语言")
  .description("校验已使用但未在资源文件定义的文案")
  .action((options) => {
    spining("校验已使用但未在资源文件定义的文案", () => {
      checkUndefinedMessages(options.file, options.lang);
    });
  });

/**
 * 检查文件中的中文文案
 */
commander
  .command("zh [mode]")
  .requiredOption("--file <filePath>", "必须指定扫描的文件或文件夹")
  .option("--output-path <outputPath>", "输出目录")
  .description("检查文件中的中文文案")
  .action((mode = "terminal", options) => {
    spining("检查文件中的中文文案", () => {
      checkChineseText(mode, {
        filePath: options.file,
        outputPath: options.outputPath,
      });
    });
  });

commander.parseAsync(process.argv);
