export default {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{ts,tsx}': () => 'tsc --noEmit',
  '*.{html,json,css,scss,md,mdx}': ['prettier -w'],
};
