export default {
  '*.{ts,tsx,js,jsx,json,css}': ['eslint --fix', 'prettier --write'],
  '*.{ts,tsx}': () => 'tsc --noEmit',
};
