import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "src/generated/**"] },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
