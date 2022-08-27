// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/src/usage.ts"],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
