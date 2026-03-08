const fs = require('fs');
const content = fs.readFileSync('src/modules/financials/components/BalanceOperations.vue', 'utf8');
const scriptMatch = content.match(/<script setup>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  try {
    // Use Function constructor to check if it's valid JS
    // We wrap it in an async function because of 'await'
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    new AsyncFunction(scriptMatch[1]);
    console.log('Script setup is syntactically valid JS.');
  } catch (e) {
    console.error('Syntax error in script setup:', e.message);
    console.error('At line:', e.lineNumber);
  }
} else {
  console.log('No script setup found.');
}
