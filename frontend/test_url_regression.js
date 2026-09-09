const fs = require('fs');
const path = require('path');

function checkFileForLeadingSlash(filePath, functionNames, searchPattern) {
  const content = fs.readFileSync(filePath, 'utf8');
  let hasError = false;
  
  if (content.match(searchPattern)) {
    console.error(`FAIL: Found leading slash in ${filePath}`);
    hasError = true;
  }
  
  if (!hasError) {
    console.log(`PASS: No leading slashes found in ${filePath} for backend API calls.`);
  }
  return hasError;
}

function runTests() {
  console.log("Running Frontend URL Regression Tests...");
  let failed = false;

  const threatIntelPath = path.join(__dirname, 'services/threat-intel.ts');
  const reportsPath = path.join(__dirname, 'services/reports.ts');

  if (checkFileForLeadingSlash(threatIntelPath, [], /fetchApi\(['"`]\/threat-intel/)) {
    failed = true;
  }
  if (checkFileForLeadingSlash(reportsPath, [], /fetchApi\(['"`]\/reports/)) {
    failed = true;
  }

  if (failed) {
    process.exit(1);
  } else {
    console.log("All Frontend URL Regression Tests PASSED.");
  }
}

runTests();
