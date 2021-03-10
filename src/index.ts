#!/usr/bin/env node

import commander from "commander";
import inquirer from "inquirer";
import packageJson from "../package.json";
import { initCLI, initLangs } from "./init";

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

commander.parseAsync(process.argv);
