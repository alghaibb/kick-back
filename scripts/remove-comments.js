#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Comments to keep (important ones)
const KEEP_PATTERNS = [
  /^\/\/ TODO:/i,
  /^\/\/ FIXME:/i,
  /^\/\/ NOTE:/i,
  /^\/\/ HACK:/i,
  /^\/\/ WARNING:/i,
  /^\/\/ @ts-/,
  /^\/\/ eslint-/,
  /^\/\/ prettier-/,
  /^\/\/\/ <reference/,
  /^#!/,
];

// Comments that are definitely unnecessary
const REMOVE_PATTERNS = [
  /^\s*\/\/ Cancel any outgoing/,
  /^\s*\/\/ Snapshot the previous/,
  /^\s*\/\/ Optimistically update/,
  /^\s*\/\/ Return a context/,
  /^\s*\/\/ If the mutation fails/,
  /^\s*\/\/ Always refetch after/,
  /^\s*\/\/ When mutate is called/,
  /^\s*\/\/ Fire and forget/,
  /^\s*\/\/ Removed suppression/,
  /^\s*\/\/ No suppression needed/,
  /^\s*\/\/ Helper function/,
  /^\s*\/\/ Helper to/,
  /^\s*\/\/ Check if/,
  /^\s*\/\/ Update/,
  /^\s*\/\/ Create/,
  /^\s*\/\/ Get/,
  /^\s*\/\/ Set/,
  /^\s*\/\/ Add/,
  /^\s*\/\/ Remove/,
  /^\s*\/\/ Delete/,
  /^\s*\/\/ Initialize/,
  /^\s*\/\/ Clean up/,
  /^\s*\/\/ Delay/,
  /^\s*\/\/ Only/,
  /^\s*\/\/ Also/,
  /^\s*\/\/ First/,
  /^\s*\/\/ Then/,
  /^\s*\/\/ Now/,
  /^\s*\/\/ Finally/,
  /^\s*\/\/ Simple/,
  /^\s*\/\/ Basic/,
  /^\s*\/\/ Default/,
  /^\s*\/\/ Standard/,
  /^\s*\/\/ Normal/,
  /^\s*\/\/ Regular/,
  /^\s*\/\/ Validate/,
  /^\s*\/\/ Ensure/,
  /^\s*\/\/ Make sure/,
  /^\s*\/\/ Check that/,
  /^\s*\/\/ Verify/,
  /^\s*\/\/ Import/,
  /^\s*\/\/ Export/,
  /^\s*\/\/ Define/,
  /^\s*\/\/ Declare/,
  /^\s*\/\/ Setup/,
  /^\s*\/\/ Configure/,
  /^\s*\/\/ Load/,
  /^\s*\/\/ Save/,
  /^\s*\/\/ Store/,
  /^\s*\/\/ Fetch/,
  /^\s*\/\/ Send/,
  /^\s*\/\/ Handle/,
  /^\s*\/\/ Process/,
  /^\s*\/\/ Execute/,
  /^\s*\/\/ Run/,
  /^\s*\/\/ Call/,
  /^\s*\/\/ Invoke/,
  /^\s*\/\/ Trigger/,
  /^\s*\/\/ Emit/,
  /^\s*\/\/ Listen/,
  /^\s*\/\/ Subscribe/,
  /^\s*\/\/ Unsubscribe/,
  /^\s*\/\/ Connect/,
  /^\s*\/\/ Disconnect/,
  /^\s*\/\/ Open/,
  /^\s*\/\/ Close/,
  /^\s*\/\/ Start/,
  /^\s*\/\/ Stop/,
  /^\s*\/\/ Begin/,
  /^\s*\/\/ End/,
  /^\s*\/\/ Continue/,
  /^\s*\/\/ Break/,
  /^\s*\/\/ Return/,
  /^\s*\/\/ Exit/,
  /^\s*\/\/ Throw/,
  /^\s*\/\/ Catch/,
  /^\s*\/\/ Try/,
  /^\s*\/\/ Log/,
  /^\s*\/\/ Debug/,
  /^\s*\/\/ Info/,
  /^\s*\/\/ Warn/,
  /^\s*\/\/ Error/,
];

function shouldKeepComment(line) {
  const trimmed = line.trim();
  
  // Keep important comments
  for (const pattern of KEEP_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  
  // Keep JSDoc comments
  if (trimmed.startsWith('/**') || trimmed.startsWith('*')) return true;
  
  // Remove obvious comments
  for (const pattern of REMOVE_PATTERNS) {
    if (pattern.test(line)) return false;
  }
  
  // Keep comments that are more than just a few words (likely important)
  const words = trimmed.replace(/^\/\/\s*/, '').split(' ');
  if (words.length > 8) return true;
  
  // Remove short obvious comments
  if (words.length <= 3) return false;
  
  return true; // When in doubt, keep it
}

function cleanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const cleanedLines = [];
  let inMultiLineComment = false;
  let removedCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Handle multi-line comments
    if (trimmed.startsWith('/*')) {
      inMultiLineComment = true;
      // Keep JSDoc
      if (trimmed.startsWith('/**')) {
        cleanedLines.push(line);
        continue;
      }
    }
    
    if (inMultiLineComment) {
      cleanedLines.push(line);
      if (trimmed.endsWith('*/')) {
        inMultiLineComment = false;
      }
      continue;
    }
    
    // Handle single-line comments
    if (trimmed.startsWith('//')) {
      if (shouldKeepComment(line)) {
        cleanedLines.push(line);
      } else {
        removedCount++;
        // If the next line is empty and we removed a comment, remove the empty line too
        if (i + 1 < lines.length && lines[i + 1].trim() === '') {
          i++; // Skip the empty line
          removedCount++;
        }
      }
    } else {
      cleanedLines.push(line);
    }
  }
  
  if (removedCount > 0) {
    // Clean up multiple consecutive empty lines
    const finalContent = cleanedLines.join('\n')
      .replace(/\n\n\n+/g, '\n\n');
    
    fs.writeFileSync(filePath, finalContent);
    console.log(`✓ ${path.relative(process.cwd(), filePath)} - removed ${removedCount} lines`);
    return removedCount;
  }
  
  return 0;
}

// Main execution
const srcFiles = glob.sync('src/**/*.{ts,tsx}', {
  ignore: [
    'src/generated/**/*',
    'src/**/*.d.ts',
    'node_modules/**/*',
  ]
});

console.log(`Found ${srcFiles.length} files to process...\n`);

let totalRemoved = 0;
for (const file of srcFiles) {
  totalRemoved += cleanFile(file);
}

console.log(`\n✅ Complete! Removed ${totalRemoved} unnecessary comment lines.`);
