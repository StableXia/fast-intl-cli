import commander from "commander";
import packageJson from "../package.json";

commander.version(packageJson.version, "-v, --version");

commander
  .command("init <name>")
  .description("初始化项目")
  .action((source, destination) => {
    console.log(source, destination);
  });

commander.parse(process.argv);
