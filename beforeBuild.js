const fs = require("fs");
const version = process.env.GITHUB_REF_NAME;

if (!version) {
    throw new Error('no version')
}

const packageJSON = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8'}));
packageJSON.version = version;
fs.writeFileSync('./package.json', JSON.stringify(packageJSON), { encoding: 'utf8', flag: 'w' })
console.log('set new version', version)
