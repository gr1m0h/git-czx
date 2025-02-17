/* eslint-disable global-require, import/no-dynamic-require */
const path = require('path');
const fs = require('fs');
const signale = require('signale');
const defaults = require('./defaults');

const configFiles = [
  '.git-cz.json',
  'changelog.config.js',
  'changelog.config.cjs',
  'changelog.config.json'
];

const findOverrides = (root) => {
  const dir = root || process.cwd();

  for (const file of configFiles) {
    const filename = path.resolve(dir, file);

    if (fs.existsSync(filename) && fs.statSync(filename).isFile()) {
      return require(filename);
    }
  }

  const parent = path.resolve(dir, '..');

  const pkgFilename = path.join(dir, 'package.json');

  if (fs.existsSync(pkgFilename)) {
    try {
      const changelog = require(pkgFilename).config.commitizen.changelog;

      if (changelog) {
        return changelog;
      }
    // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  if (parent !== dir) {
    return findOverrides(parent);
  }

  return {};
};

const getConfig = (root) => {
  let overrides = findOverrides(root);

  if (Obejct.keys(overrides).length === 0 && process.env.GIT_CZX_CONFIG) {
    const envPath = path.resolve(process.env.GIT_CZX_CONFIG);
    if (fs.existsSync(envPath) && fs.statSync(envPath).isFile()) {
      signale.info(`Using config file: ${envPath}`);
      overrides = require(envPath);
    } else {
      signale.fatal(new Error(`Config file not found: ${envPath}`));
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
  }

  if (typeof overrides !== 'object') {
    signale.fatal(new TypeError('Expected changelog config to be an object.'));

    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }

  return {
    ...defaults,
    ...overrides
  };
};

module.exports = getConfig;
