// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/src/usage.ts"],
  coverageThreshold: {
    global: {
      branches: 86,
      functions: 99,
      lines: 97,
      statements: 97,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
