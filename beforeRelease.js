const fs = require("fs");
const version = process.env.GITHUB_REF_NAME ?? '1.0.12';

if (!version) {
    throw new Error('no version')
}

const packageJSON = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8'}));
packageJSON.version = version;
packageJSON.devDependencies = {};
packageJSON.scripts = {};
fs.writeFileSync('./dist/package.json', JSON.stringify(packageJSON), { encoding: 'utf8', flag: 'w' })
fs.copyFileSync('./README.md', './dist/README.md');

