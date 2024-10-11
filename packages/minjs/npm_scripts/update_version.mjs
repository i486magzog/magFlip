import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {execSync} from 'child_process';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//
// OTP
//
// const args = process.argv.slice(2);
// if (!args.length) {
//   console.log('-------------------------------------------');
//   console.log('Error: One-time password is missing');
//   console.log('-------------------------------------------');
//   process.exit(1);
// }
// const otpArg = args[0];
// const otpArgIndex = otpArg.indexOf('--otp');
// if (otpArgIndex === -1 || !args[otpArgIndex + 1]) {
//   console.log('-------------------------------------------');
//   console.error('Error: OTP is missing');
//   console.log('-------------------------------------------');
//   process.exit(1);
// }
// const otp = args[otpArgIndex + 1];
//
// Check version
//
const version = process.env.npm_package_version;
const versionPattern = /^\d+\.\d+\.\d+$/;
if (!versionPattern.test(version)) {
  console.log('-------------------------------------------');
  console.log(` [Error] '${version}' is not a valid version`);
  console.log('-------------------------------------------');
  process.exit(1);
}
//
// Update version in the example html file.
//
const exampleHtml = '../../docs/examples/prebuild/magflip.html'
fs.readFile(exampleHtml, 'utf8', (err, data) => {
  if (err) {
      console.log('-------------------------------------------');
      console.error('Error reading file:', err);
      console.log('-------------------------------------------');
      process.exit(1);
  }
  const updatedData = data.replace(/@magflip\/minjs@\d+\.\d+\.\d+/g, `@magflip/minjs@${version}`);
  fs.writeFile(exampleHtml, updatedData, 'utf8', (err) => {
      if (err) {
        console.log('-------------------------------------------');
        console.error('Error writing file:', err);
        console.log('-------------------------------------------');
        process.exit(1);
      }
      console.log('-------------------------------------------');
      console.log(`Version updated to ${version} in ${exampleHtml}`);
      console.log('-------------------------------------------');
  });
});
//
// Publish
//
// execSync('cd ' + __dirname + ' && npm publish --access public --otp=' + otp);
// execSync('npm publish --access public --otp=' + otp);