const fs = require("fs");
const { FAST_INTL_CONFIG_FILE, FAST_INTL_CONFIG } = require("./constants");

function createConfigFile(dir) {
  const config = JSON.stringify(FAST_INTL_CONFIG, null, 2);

  fs.writeFile(FAST_INTL_CONFIG_FILE, config, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

function initProject(dir) {
  createConfigFile();
}

module.exports = {
  initProject,
};
