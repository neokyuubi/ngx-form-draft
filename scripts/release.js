const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: npm run release <version>');
  console.error('Example: npm run release 2.2.9');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const rootPkgPath = path.join(root, 'package.json');
const demoPkgPath = path.join(root, 'demo', 'package.json');

const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
rootPkg.version = version;
fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');
console.log('Updated root package.json to', version);

const demoPkg = JSON.parse(fs.readFileSync(demoPkgPath, 'utf8'));
demoPkg.version = version;
demoPkg.dependencies['ngx-form-draft'] = `^${version}`;
fs.writeFileSync(demoPkgPath, JSON.stringify(demoPkg, null, 2) + '\n');
console.log('Updated demo/package.json to', version);

const tag = `v${version}`;
execSync('git add package.json demo/package.json', { cwd: root, stdio: 'inherit' });
execSync(`git commit -m "chore: release ${tag}"`, { cwd: root, stdio: 'inherit' });
execSync('git push origin main', { cwd: root, stdio: 'inherit' });
execSync(`gh release create ${tag} --title "${tag}" --notes "${tag}"`, { cwd: root, stdio: 'inherit' });

console.log('Done. Release', tag, 'created.');
