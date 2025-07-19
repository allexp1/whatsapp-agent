#!/usr/bin/env node

/**
 * Simple test runner for SchoolChatSummarizer tests
 * Runs integration and edge case tests, then provides a summary report
 */

const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function for colored output
function color(text, colorName) {
  return `${colors[colorName]}${text}${colors.reset}`;
}

// Create TypeScript compilation command
async function compileTypeScript() {
  console.log(color('\n🔧 Compiling TypeScript files...', 'cyan'));
  
  const { execSync } = require('child_process');
  
  try {
    // Check if TypeScript is installed
    try {
      execSync('npx tsc --version', { stdio: 'ignore' });
    } catch {
      console.log(color('TypeScript not found. Installing...', 'yellow'));
      execSync('npm install -D typescript @types/node', { stdio: 'inherit' });
    }
    
    // Create a temporary tsconfig for compilation
    const tsconfigContent = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: '../',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        moduleResolution: 'node',
      },
      include: ['../**/*.ts'],
      exclude: ['node_modules', 'dist'],
    };
    
    const tsconfigPath = path.join(__dirname, 'tsconfig.test.json');
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigContent, null, 2));
    
    // Compile TypeScript files
    execSync(`npx tsc -p ${tsconfigPath}`, { stdio: 'inherit' });
    
    // Clean up temporary tsconfig
    fs.unlinkSync(tsconfigPath);
    
    console.log(color('✅ TypeScript compilation complete', 'green'));
    return true;
  } catch (error) {
    console.error(color('❌ TypeScript compilation failed:', 'red'), error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log(color('\n🚀 SchoolChatSummarizer Test Suite', 'bright'));
  console.log(color('================================\n', 'bright'));
  
  const startTime = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;
  let testSuites = [];
  
  try {
    // Compile TypeScript first
    const compiled = await compileTypeScript();
    if (!compiled) {
      console.error(color('\n❌ Cannot run tests without successful compilation', 'red'));
      process.exit(1);
    }
    
    // Clear module cache to ensure fresh imports
    Object.keys(require.cache).forEach(key => {
      if (key.includes('dist/tests') || key.includes('dist/src')) {
        delete require.cache[key];
      }
    });
    
    // Run Integration Tests
    console.log(color('\n📋 Running Integration Tests...', 'blue'));
    console.log(color('-'.repeat(50), 'blue'));
    
    try {
      const integrationTests = require('../../dist/tests/SchoolChatSummarizer.test.js');
      await integrationTests.runIntegrationTests();
      
      const integrationResults = integrationTests.testResults || [];
      const integrationPassed = integrationResults.filter(r => r.passed).length;
      const integrationFailed = integrationResults.filter(r => !r.passed).length;
      
      totalPassed += integrationPassed;
      totalFailed += integrationFailed;
      
      testSuites.push({
        name: 'Integration Tests',
        total: integrationResults.length,
        passed: integrationPassed,
        failed: integrationFailed,
        results: integrationResults,
      });
    } catch (error) {
      console.error(color('\n❌ Integration tests failed to run:', 'red'), error.message);
      testSuites.push({
        name: 'Integration Tests',
        total: 0,
        passed: 0,
        failed: 1,
        error: error.message,
      });
      totalFailed += 1;
    }
    
    // Run Edge Case Tests
    console.log(color('\n📋 Running Edge Case Tests...', 'blue'));
    console.log(color('-'.repeat(50), 'blue'));
    
    try {
      const edgeCaseTests = require('../../dist/tests/edge-cases.test.js');
      await edgeCaseTests.runEdgeCaseTests();
      
      const edgeCaseResults = edgeCaseTests.testResults || [];
      const edgeCasePassed = edgeCaseResults.filter(r => r.passed).length;
      const edgeCaseFailed = edgeCaseResults.filter(r => !r.passed).length;
      
      totalPassed += edgeCasePassed;
      totalFailed += edgeCaseFailed;
      
      testSuites.push({
        name: 'Edge Case Tests',
        total: edgeCaseResults.length,
        passed: edgeCasePassed,
        failed: edgeCaseFailed,
        results: edgeCaseResults,
      });
    } catch (error) {
      console.error(color('\n❌ Edge case tests failed to run:', 'red'), error.message);
      testSuites.push({
        name: 'Edge Case Tests',
        total: 0,
        passed: 0,
        failed: 1,
        error: error.message,
      });
      totalFailed += 1;
    }
    
    // Performance Test Summary
    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    
    // Print Final Summary
    console.log(color('\n' + '='.repeat(60), 'bright'));
    console.log(color('📊 FINAL TEST SUMMARY', 'bright'));
    console.log(color('='.repeat(60), 'bright'));
    
    // Suite breakdown
    console.log(color('\nTest Suites:', 'cyan'));
    testSuites.forEach(suite => {
      const status = suite.failed === 0 ? color('PASS', 'green') : color('FAIL', 'red');
      console.log(`  ${status} ${suite.name}: ${suite.passed}/${suite.total} passed`);
      
      if (suite.error) {
        console.log(color(`    Error: ${suite.error}`, 'red'));
      }
    });
    
    // Overall statistics
    const totalTests = totalPassed + totalFailed;
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
    
    console.log(color('\nOverall Results:', 'cyan'));
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  ${color(`Passed: ${totalPassed}`, 'green')}`);
    console.log(`  ${color(`Failed: ${totalFailed}`, 'red')}`);
    console.log(`  Success Rate: ${successRate}%`);
    console.log(`  Time: ${totalTime}s`);
    
    // Failed test details
    if (totalFailed > 0) {
      console.log(color('\n❌ Failed Tests:', 'red'));
      testSuites.forEach(suite => {
        if (suite.results) {
          suite.results
            .filter(r => !r.passed)
            .forEach(result => {
              console.log(color(`\n  ${suite.name} > ${result.name}`, 'red'));
              console.log(`    ${result.error}`);
            });
        }
      });
    }
    
    // Final status
    console.log('\n' + '='.repeat(60));
    if (totalFailed === 0) {
      console.log(color('✅ All tests passed!', 'green'));
      console.log('='.repeat(60) + '\n');
    } else {
      console.log(color(`❌ ${totalFailed} test(s) failed`, 'red'));
      console.log('='.repeat(60) + '\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error(color('\n❌ Test runner error:', 'red'), error);
    process.exit(1);
  }
}

// Check if running directly
if (require.main === module) {
  runTests().catch(error => {
    console.error(color('Fatal error:', 'red'), error);
    process.exit(1);
  });
}

// Export for programmatic use
module.exports = { runTests };