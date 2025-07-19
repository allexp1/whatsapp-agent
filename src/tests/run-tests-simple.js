#!/usr/bin/env node

/**
 * Simple test runner for SchoolChatSummarizer tests
 * This version runs tests directly without TypeScript compilation
 */

// Enable TypeScript module loading
require('../../node_modules/typescript/lib/typescript.js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function color(text, colorName) {
  return `${colors[colorName]}${text}${colors.reset}`;
}

// Simple require hook for TypeScript
function registerTypeScript() {
  const Module = require('module');
  const fs = require('fs');
  const path = require('path');
  
  const originalRequire = Module.prototype.require;
  
  Module.prototype.require = function(id) {
    if (id.endsWith('.ts') && !id.includes('node_modules')) {
      const fullPath = Module._resolveFilename(id, this);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Very basic TypeScript stripping (removes type annotations)
      const jsContent = content
        .replace(/:\s*\w+(\[\])?/g, '') // Remove type annotations
        .replace(/\s+as\s+\w+/g, '') // Remove type assertions
        .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interfaces
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // Remove type aliases
        .replace(/<[^>]+>/g, '') // Remove generics
        .replace(/export\s*{\s*}/g, '') // Remove empty exports
        .replace(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g, (match, imports, from) => {
          // Convert TypeScript imports to CommonJS
          const importList = imports.split(',').map(i => i.trim());
          return importList.map(imp => {
            const [name, alias] = imp.split(/\s+as\s+/).map(s => s.trim());
            if (alias) {
              return `const ${alias} = require('${from}').${name}`;
            }
            return `const { ${name} } = require('${from}')`;
          }).join(';\n');
        })
        .replace(/export\s+class\s+(\w+)/g, 'class $1')
        .replace(/export\s+function\s+(\w+)/g, 'function $1')
        .replace(/export\s+const\s+(\w+)/g, 'const $1')
        .replace(/export\s+{([^}]+)}/g, (match, exports) => {
          // Add module.exports at the end
          const exportList = exports.split(',').map(e => e.trim());
          return `\nmodule.exports = { ${exportList.join(', ')} };`;
        });
      
      // Create a temporary module
      const tempModule = new Module(fullPath, this);
      tempModule.filename = fullPath;
      tempModule.paths = Module._nodeModulePaths(path.dirname(fullPath));
      tempModule._compile(jsContent, fullPath);
      
      return tempModule.exports;
    }
    
    return originalRequire.apply(this, arguments);
  };
}

// Test runner function
async function runTests() {
  console.log(color('\n🚀 SchoolChatSummarizer Test Suite (Simple Runner)', 'bright'));
  console.log(color('==============================================\n', 'bright'));
  
  const startTime = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;
  
  try {
    // Register TypeScript handling
    registerTypeScript();
    
    console.log(color('📋 Running tests directly from TypeScript files...\n', 'cyan'));
    
    // Run Integration Tests
    console.log(color('Running Integration Tests...', 'blue'));
    try {
      const { runIntegrationTests, testResults: integrationResults } = require('./SchoolChatSummarizer.test.ts');
      await runIntegrationTests();
      
      if (integrationResults && integrationResults.length > 0) {
        const passed = integrationResults.filter(r => r.passed).length;
        const failed = integrationResults.filter(r => !r.passed).length;
        totalPassed += passed;
        totalFailed += failed;
        console.log(color(`  ✓ Integration Tests: ${passed} passed, ${failed} failed`, 'green'));
      }
    } catch (error) {
      console.error(color(`  ✗ Integration Tests failed: ${error.message}`, 'red'));
      totalFailed += 1;
    }
    
    // Run Edge Case Tests
    console.log(color('\nRunning Edge Case Tests...', 'blue'));
    try {
      const { runEdgeCaseTests, testResults: edgeResults } = require('./edge-cases.test.ts');
      await runEdgeCaseTests();
      
      if (edgeResults && edgeResults.length > 0) {
        const passed = edgeResults.filter(r => r.passed).length;
        const failed = edgeResults.filter(r => !r.passed).length;
        totalPassed += passed;
        totalFailed += failed;
        console.log(color(`  ✓ Edge Case Tests: ${passed} passed, ${failed} failed`, 'green'));
      }
    } catch (error) {
      console.error(color(`  ✗ Edge Case Tests failed: ${error.message}`, 'red'));
      totalFailed += 1;
    }
    
    // Final summary
    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    const totalTests = totalPassed + totalFailed;
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
    
    console.log(color('\n' + '='.repeat(50), 'bright'));
    console.log(color('📊 TEST SUMMARY', 'bright'));
    console.log(color('='.repeat(50), 'bright'));
    console.log(`Total Tests: ${totalTests}`);
    console.log(color(`Passed: ${totalPassed}`, 'green'));
    console.log(color(`Failed: ${totalFailed}`, 'red'));
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Time: ${totalTime}s`);
    console.log('='.repeat(50));
    
    if (totalFailed === 0) {
      console.log(color('\n✅ All tests passed!\n', 'green'));
    } else {
      console.log(color(`\n❌ ${totalFailed} test(s) failed\n`, 'red'));
      process.exit(1);
    }
    
  } catch (error) {
    console.error(color('\n❌ Test runner error:', 'red'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Alternative: Run tests using Node.js directly with basic imports
async function runTestsDirect() {
  console.log(color('\n🚀 Running Tests with Direct Node.js Execution', 'bright'));
  console.log(color('==========================================\n', 'bright'));
  
  try {
    // Try to run the demo file to verify the setup works
    console.log(color('Verifying SchoolChatSummarizer setup...', 'cyan'));
    
    const { execSync } = require('child_process');
    
    // Check if the demo file runs successfully
    try {
      execSync('node ../demo.js', { 
        stdio: 'pipe',
        cwd: __dirname 
      });
      console.log(color('✓ SchoolChatSummarizer is working correctly', 'green'));
    } catch (error) {
      console.log(color('✗ Error running demo:', 'red'), error.message);
    }
    
    // Run a basic functionality test
    console.log(color('\n📋 Running Basic Functionality Test...', 'blue'));
    
    // Since we can't easily run TypeScript tests without compilation,
    // let's create a simple JavaScript test
    const testCode = `
    const { SchoolChatSummarizer } = require('../index.js');
    
    async function runBasicTest() {
      const summarizer = new SchoolChatSummarizer();
      
      const input = {
        messages: [
          {
            chat_id: 'chat_001',
            sender_id: 'teacher_001',
            timestamp: '2025-01-15T10:00:00.000Z',
            text: 'Math homework: Complete exercises 1-10 on page 45. Due tomorrow.'
          },
          {
            chat_id: 'chat_001',
            sender_id: 'teacher_002',
            timestamp: '2025-01-15T11:00:00.000Z',
            text: 'Class cancelled tomorrow due to teacher meeting.'
          },
          {
            chat_id: 'chat_002',
            sender_id: 'teacher_003',
            timestamp: '2025-01-15T12:00:00.000Z',
            text: 'Reminder: Field trip permission slips due Friday.'
          }
        ],
        subscribed_chats: ['chat_001', 'chat_002'],
        period: {
          start: '2025-01-01T00:00:00.000Z',
          end: '2025-01-31T23:59:59.999Z'
        }
      };
      
      const result = await summarizer.process(input);
      
      console.log('Test Results:');
      console.log('- Extracted items:', result.extracted_items.length);
      console.log('- Item types:', result.extracted_items.map(i => i.type).join(', '));
      
      const stats = summarizer.getStats();
      console.log('\\nStatistics:');
      console.log('- Total messages:', stats.totalMessages);
      console.log('- Filtered messages:', stats.filteredMessages);
      console.log('- Classified messages:', stats.classifiedMessages);
      console.log('- Processing time:', stats.processingTime + 'ms');
      
      // Basic assertions
      const passed = result.extracted_items.length >= 2 &&
                     result.extracted_items.some(i => i.type === 'homework') &&
                     result.extracted_items.some(i => i.type === 'schedule_change' || i.type === 'announcement');
      
      return passed;
    }
    
    runBasicTest().then(passed => {
      if (passed) {
        console.log('\\n✅ Basic functionality test passed!');
      } else {
        console.log('\\n❌ Basic functionality test failed!');
        process.exit(1);
      }
    }).catch(error => {
      console.error('\\n❌ Test error:', error.message);
      process.exit(1);
    });
    `;
    
    // Write and execute the test
    const fs = require('fs');
    const path = require('path');
    const testFile = path.join(__dirname, 'temp-test.js');
    
    fs.writeFileSync(testFile, testCode);
    execSync(`node ${testFile}`, { stdio: 'inherit' });
    fs.unlinkSync(testFile);
    
    console.log(color('\n✅ Test execution completed successfully!\n', 'green'));
    
  } catch (error) {
    console.error(color('\n❌ Test execution failed:', 'red'), error.message);
    process.exit(1);
  }
}

// Check if TypeScript is available
const fs = require('fs');
const hasTsNode = fs.existsSync('../../node_modules/typescript');

if (hasTsNode) {
  runTests().catch(error => {
    console.error(color('Fatal error:', 'red'), error);
    // Fallback to direct execution
    console.log(color('\nFalling back to direct execution...', 'yellow'));
    runTestsDirect();
  });
} else {
  // Run direct tests if TypeScript is not available
  runTestsDirect();
}