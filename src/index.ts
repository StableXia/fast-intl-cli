#!/usr/bin/env node

import commander from "commander";
import inquirer from "inquirer";
import packageJson from "../package.json";
import { initCLI } from "./init";

commander
  .version(packageJson.version, "-v, --version")
  .name("ftintl")
  .usage("国际化工具");

commander
  .command("init")
  .option("-y", "使用默认配置")
  .description("初始化项目")
  .action((args) => {
    if (args.y) {
      initCLI();
      return;
    }

    inquirer
      .prompt({
        type: "confirm",
        name: "confirm",
        default: false,
        message: "是否初始化CLI相关配置？",
      })
      .then((res) => {
        if (res.confirm) {
          initCLI();
        }
      });
  });

commander.parse(process.argv);
