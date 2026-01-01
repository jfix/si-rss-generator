import { execSync } from 'child_process';

/**
 * Git Handler: Commit changes to the repository
 * Uses GITHUB_TOKEN environment variable in GitHub Actions
 */

export function configureGit(): void {
  console.log('Configuring git...');
  
  try {
    // Configure git user for commits
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'pipe' });
    execSync('git config user.name "github-actions[bot]"', { stdio: 'pipe' });
    console.log('✓ Git configured');
  } catch (error) {
    console.error('✗ Error configuring git:', error);
    throw error;
  }
}

export function stageFiles(files: string[]): void {
  console.log(`Staging ${files.length} files...`);
  
  try {
    for (const file of files) {
      execSync(`git add "${file}"`, { stdio: 'pipe' });
      console.log(`  ✓ Staged ${file}`);
    }
  } catch (error) {
    console.error('✗ Error staging files:', error);
    throw error;
  }
}

export function commitChanges(message: string): boolean {
  try {
    console.log(`Committing with message: "${message}"`);
    execSync(`git commit -m "${message}"`, { stdio: 'pipe' });
    console.log('✓ Changes committed');
    return true;
  } catch (error: any) {
    // If nothing to commit, return false (not an error)
    if (error.message?.includes('nothing to commit')) {
      console.log('✓ No changes to commit');
      return false;
    }
    console.error('✗ Error committing changes:', error);
    throw error;
  }
}

export function pushChanges(): void {
  try {
    console.log('Pushing changes to remote...');
    execSync('git push', { stdio: 'pipe' });
    console.log('✓ Changes pushed');
  } catch (error) {
    console.error('✗ Error pushing changes:', error);
    throw error;
  }
}

export function commitAndPush(files: string[], message: string): void {
  try {
    stageFiles(files);
    const committed = commitChanges(message);
    
    if (committed) {
      pushChanges();
    } else {
      console.log('No changes to push');
    }
  } catch (error) {
    console.error('✗ Error in commit and push:', error);
    throw error;
  }
}
