#!/usr/bin/env node

/**
 * Authentication and Route Guard Validation Script
 * 
 * This script validates the implementation of authentication logic and route guard.
 * Run with: node validate-auth.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function test(name, fn) {
  try {
    const result = fn();
    if (result === true) {
      log(`✅ PASS: ${name}`, colors.green);
      results.passed++;
    } else if (result === null) {
      log(`⚠️  WARN: ${name}`, colors.yellow);
      results.warnings++;
    } else {
      log(`❌ FAIL: ${name}`, colors.red);
      results.failed++;
    }
  } catch (error) {
    log(`❌ FAIL: ${name} - ${error.message}`, colors.red);
    results.failed++;
  }
}

log('\n🔍 Starting Authentication and Route Guard Validation\n', colors.cyan);

// Test 1: RouteGuard file exists and has correct structure
test('RouteGuard component file exists', () => {
  return checkFileExists(path.join(__dirname, 'components', 'RouteGuard.tsx'));
});

test('RouteGuard uses isPublicOrAuthPath helper', () => {
  const content = readFile(path.join(__dirname, 'components', 'RouteGuard.tsx'));
  return content.includes('isPublicOrAuthPath') && 
         content.includes('pathname.startsWith(\'/auth\')');
});

test('RouteGuard handles auth callback paths dynamically', () => {
  const content = readFile(path.join(__dirname, 'components', 'RouteGuard.tsx'));
  // Should NOT have hardcoded callback paths like '/auth/callback/google'
  const hasHardcodedCallbacks = content.includes('\'/auth/callback/google\'') || 
                                 content.includes('\'/auth/callback/discord\'');
  return !hasHardcodedCallbacks;
});

test('RouteGuard shows loading state', () => {
  const content = readFile(path.join(__dirname, 'components', 'RouteGuard.tsx'));
  return content.includes('animate-spin') || content.includes('loading');
});

// Test 2: AuthContext file exists and has correct structure
test('AuthContext component file exists', () => {
  return checkFileExists(path.join(__dirname, 'context', 'AuthContext.tsx'));
});

test('AuthContext has updateSession with shouldRedirect parameter', () => {
  const content = readFile(path.join(__dirname, 'context', 'AuthContext.tsx'));
  return content.includes('shouldRedirect') && 
         content.includes('updateSession');
});

test('AuthContext login methods check pathname for redirect', () => {
  const content = readFile(path.join(__dirname, 'context', 'AuthContext.tsx'));
  const hasCallbackCheck = content.includes('isCallbackPage') && 
                           content.includes('pathname.startsWith(\'/auth/callback\')');
  return hasCallbackCheck;
});

test('AuthContext redirects to /space after successful login', () => {
  const content = readFile(path.join(__dirname, 'context', 'AuthContext.tsx'));
  return content.includes('router.push(\'/space\')') || 
         content.includes('router.push("/space")');
});

test('AuthContext stores auth data in localStorage', () => {
  const content = readFile(path.join(__dirname, 'context', 'AuthContext.tsx'));
  return content.includes('localStorage.setItem(\'lit-auth-method\'') &&
         content.includes('localStorage.setItem(\'lit-pkp\'') &&
         content.includes('localStorage.setItem(\'lit-session-sigs\'');
});

test('AuthContext loads auth data from localStorage on init', () => {
  const content = readFile(path.join(__dirname, 'context', 'AuthContext.tsx'));
  return content.includes('localStorage.getItem(\'lit-auth-method\'') &&
         content.includes('localStorage.getItem(\'lit-pkp\'') &&
         content.includes('localStorage.getItem(\'lit-session-sigs\'');
});

test('AuthContext logOut clears localStorage', () => {
  const content = readFile(path.join(__dirname, 'context', 'AuthContext.tsx'));
  return content.includes('localStorage.removeItem(\'lit-auth-method\'') &&
         content.includes('localStorage.removeItem(\'lit-pkp\'') &&
         content.includes('localStorage.removeItem(\'lit-session-sigs\'');
});

test('AuthContext logOut redirects to landing page', () => {
  const content = readFile(path.join(__dirname, 'context', 'AuthContext.tsx'));
  const logOutSection = content.match(/const logOut[\s\S]*?}/m);
  if (!logOutSection) return false;
  return logOutSection[0].includes('router.push(\'/\')') || 
         logOutSection[0].includes('router.push("/")');
});

// Test 3: OAuth callback pages
test('Google callback page exists', () => {
  return checkFileExists(path.join(__dirname, 'app', 'auth', 'callback', 'google', 'page.tsx'));
});

test('Discord callback page exists', () => {
  return checkFileExists(path.join(__dirname, 'app', 'auth', 'callback', 'discord', 'page.tsx'));
});

test('Google callback prevents multiple auth attempts', () => {
  const filePath = path.join(__dirname, 'app', 'auth', 'callback', 'google', 'page.tsx');
  if (!checkFileExists(filePath)) return null;
  const content = readFile(filePath);
  return content.includes('hasAttemptedAuth');
});

test('Google callback redirects to /space on success', () => {
  const filePath = path.join(__dirname, 'app', 'auth', 'callback', 'google', 'page.tsx');
  if (!checkFileExists(filePath)) return null;
  const content = readFile(filePath);
  return content.includes('router.push(\'/space\')') || 
         content.includes('router.push("/space")');
});

// Test 4: Application structure
test('App has root layout with Providers', () => {
  const content = readFile(path.join(__dirname, 'app', 'layout.tsx'));
  return content.includes('Providers') && content.includes('RouteGuard');
});

test('Providers includes AuthProvider', () => {
  const content = readFile(path.join(__dirname, 'components', 'Providers.tsx'));
  return content.includes('AuthProvider');
});

test('Main page (/) uses useAuth hook', () => {
  const content = readFile(path.join(__dirname, 'app', 'page.tsx'));
  return content.includes('useAuth');
});

test('Main page shows AuthLogin for unauthenticated users', () => {
  const content = readFile(path.join(__dirname, 'app', 'page.tsx'));
  return content.includes('AuthLogin') && content.includes('isAuthenticated');
});

// Test 5: Documentation
test('Testing guide exists', () => {
  return checkFileExists(path.join(__dirname, 'TESTING_GUIDE.md'));
});

test('Validation tests documentation exists', () => {
  return checkFileExists(path.join(__dirname, 'VALIDATION_TESTS.md'));
});

// Print summary
log('\n' + '='.repeat(50), colors.blue);
log('VALIDATION SUMMARY', colors.cyan);
log('='.repeat(50), colors.blue);
log(`✅ Passed: ${results.passed}`, colors.green);
log(`❌ Failed: ${results.failed}`, colors.red);
log(`⚠️  Warnings: ${results.warnings}`, colors.yellow);
log('='.repeat(50) + '\n', colors.blue);

// Exit with appropriate code
if (results.failed > 0) {
  log('❌ Validation FAILED - Please review the failed tests above.\n', colors.red);
  process.exit(1);
} else if (results.warnings > 0) {
  log('⚠️  Validation completed with warnings.\n', colors.yellow);
  process.exit(0);
} else {
  log('✅ All validations PASSED!\n', colors.green);
  process.exit(0);
}
