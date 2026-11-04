export default {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{ts,tsx}': () => 'npm run typecheck',
  '*.{html,json,css,scss,md,mdx}': ['prettier -w'],
};
