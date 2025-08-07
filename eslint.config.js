// @ts-check
import { create } from 'eslint-config-expo';

export default create({
  ignores: ["node_modules", "android", "ios", ".expo", "build", "dist"]
}, [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    ignores: ["node_modules", "android", "ios", ".expo", "build", "dist"],
    rules: {
      // Code Quality
      "no-unused-vars": "error",
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
      
      // Naming conventions
      "camelcase": ["error", { "properties": "never" }],
      
      // Code complexity
      "complexity": ["warn", 15], // Increased for React components
      "max-lines-per-function": ["warn", 100], // Increased for React components
      "max-depth": ["error", 4],
      
      // Best practices
      "eqeqeq": ["error", "always"],
      "prefer-template": "error",
      "object-shorthand": "error",
      
      // React Native / Expo specific
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      
      // Disable some rules that might be too strict for development
      "no-magic-numbers": "off", // Can be too restrictive for styling
    },
  },
]);
