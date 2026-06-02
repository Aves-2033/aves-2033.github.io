import { execSync } from 'child_process';

console.log('Starting safe build process...');

try {
  console.log('Running version update...');
  execSync('node scripts/update-version.js', { stdio: 'inherit' });
  
  console.log('Hiding admin & API routes...');
  execSync('node scripts/hide-admin.js', { stdio: 'inherit' });
  
  console.log('Running astro build...');
  execSync('npx astro build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build process failed:', error.message);
  process.exitCode = 1;
} finally {
  console.log('Restoring admin & API routes (ensuring files are back)...');
  try {
    execSync('node scripts/restore-admin.js', { stdio: 'inherit' });
  } catch (restoreError) {
    console.error('Failed to restore admin & API routes:', restoreError.message);
  }
}
