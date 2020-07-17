#!/usr/bin/env node
var Git = require('nodegit');

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd) {
  const exec = require('child_process').exec;
  return new Promise((resolve, reject) => {
   exec(cmd, (error, stdout, stderr) => {
    if (error) {
     console.warn(error);
    }
    resolve(stdout? stdout : stderr);
   });
  });
 }

 async function generatePackageVersionInfo() {
  const output = await execShellCommand('npm ls --depth 0');
  return output.split('\n').flatMap((line) => {
    if (!line.includes('─')) {
      return [];
    }
    const [lines, package, info] = line.split(' ');
    return [package];
  });
 }

function generateGitStats() {
  const gitStats = [];

  // Open the repository directory.
  return (
    Git.Repository.open('.')
      // Open the master branch.
      .then(function (repo) {
        return repo.getMasterCommit();
      })
      // Display information about commits on master.
      .then(function (firstCommitOnMaster) {
        return new Promise((resolve, reject) => {
          // Create a new history event emitter.
          var history = firstCommitOnMaster.history();

          // Create a counter to only show up to 9 entries.
          var count = 0;

          history.on('error', reject);
          history.on('end', () => resolve(gitStats));

          // Listen for commit events from the history.
          history.on('commit', function (commit) {
            // Disregard commits past 9.
            if (++count >= 9) {
              resolve(gitStats);
              return;
            }

            gitStats.push({
              commit: commit.sha(),
              author: {
                name: commit.author().name(),
                email: commit.author().email(),
              },
              date: commit.date(),
              message: commit.message(),
            });
          });

          // Start emitting events.
          history.start();
        });
      })
  );
}

async function makeStats() {
  console.log(JSON.stringify({
    gitStats: await generateGitStats(),
    packages: await generatePackageVersionInfo(),
    buildDate: new Date(),
  }));
}

makeStats();
