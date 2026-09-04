import next from 'eslint-config-next/core-web-vitals';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**'] },
  ...next,
  {
    rules: {
      // R3F props (args, position, intensity…) are not DOM attributes
      'react/no-unknown-property': 'off',

      // These components read browser-only state (matchMedia, hardwareConcurrency,
      // element geometry) that does not exist during render, so the first paint
      // has to be corrected from an effect. The cascade is one extra render, once,
      // on mount — deliberate, not an oversight.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;
