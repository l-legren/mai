/** Conventional Commits, scoped to this repo's layers/features. See CLAUDE.md "Branching & commits". */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'refactor', 'docs', 'test', 'ci', 'perf', 'style', 'revert'],
    ],
    'scope-empty': [2, 'never'],
    'subject-case': [0],
  },
};
