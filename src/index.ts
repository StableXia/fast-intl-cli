#!/usr/bin/env node

import commander from "commander";
import packageJson from "../package.json";
import { canInitiate, initProject } from "./init";
import { spining, log } from "./view";

commander
  .version(packageJson.version, "-v, --version")
  .name("ftintl")
  .usage("国际化工具");

commander
  .command("init")
  .description("初始化项目")
  .action(async () => {
    if (canInitiate()) {
      spining("项目初始化", () => {
        initProject();
      });
      return;
    }

    log.error("初始化失败，ftintl相关吧配置已存在");
  });

commander.parse(process.argv);
