/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  semi: false,
  singleQuote: true,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cva", "cn", "clsx", "twMerge"],
};

export default config;
