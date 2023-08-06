#!/usr/bin/env node
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Exit early if no JSON recieved through pipe
if (process.stdin.isTTY) {
  process.exit(-1);
}
process.stdin.on("data", async (d) => checkRushProjects(d));
// The meat of the script
// Check the files found in 'apps' and 'pkg' folders against rush 'projects'
function checkRushProjects(d) {
  const { projects } = JSON.parse(d.toString());
  // Get projects listed in rush.json
  const allowedPaths = projects.reduce(
    (acc, { fullPath: fp }) => ({
      ...acc,
      [fp]: fp,
    }),
    {}
  );
  const unlistedPackages = [];
  // Get all folders (full path) inside 'apps' and 'pkg' folders
  const allPackages = getPackages(process.cwd(), ["apps", "pkg"]);
  // Find folders not accounted for in 'rush.json'
  allPackages.forEach((p) => {
    if (!allowedPaths[p]) {
      unlistedPackages.push(p);
    }
  });
  if (!unlistedPackages.length) {
    exitSuccess();
  } else {
    exitError(unlistedPackages);
  }
}
// Get all folders (full path) in given directories, prepended with 'basepath'
function getPackages(basepath, dirnames) {
  return dirnames.reduce((acc, dn) => {
    const dirpath = path_1.default.join(basepath, dn);
    return [...acc, ...getContents(dirpath)];
  }, []);
}
// Get contents of a directory with full path prepended to each entry
function getContents(dirpath) {
  return fs_1.default.readdirSync(dirpath).map((c) => dirpath + "/" + c);
}
// #region outputMessages
const colours = {
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};
// Write success message and exit
function exitSuccess() {
  const successMessage = `${colours.green}Project folders check successful
${colours.reset}
`;
  console.log(successMessage);
  process.exit(0);
}
// Write error message and exit
function exitError(unlistedPackages) {
  const unlistedPackagesString = unlistedPackages.reduce(
    (acc, p) => acc + p + "\n",
    ""
  );
  const errMessage = `${colours.bright}Not all artifacts in 'pkg' and 'app' folders are listed as 'projects' in 'rush.json'. 
${colours.reset}
Those folders are reserved for rush projects only.
Please add the packages to 'projects' in 'rush.json' (at the root of the monorepo) or store the artifacts somewhere else. 
${colours.bright}
Unlisted artifacts (files and folders):

${colours.red}${unlistedPackagesString}${colours.reset}`;
  console.log(errMessage);
  process.exit(-1);
}
// #endregion outputMessages
//# sourceMappingURL=pipe.js.map
