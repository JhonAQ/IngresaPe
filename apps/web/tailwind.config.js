const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    // ESTA es la nueva forma oficial en monorepos Nx para que Turbopack vuele
    join(__dirname, '../../libs/**/src/**/*!(*.stories|*.spec).{ts,tsx,html}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
