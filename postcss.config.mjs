const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      features: {
        "oklab-function": false, // Desabilita oklch/oklab
      },
    },
  },
};

export default config;
