// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/src/usage.ts"],
  coverageThreshold: {
    global: {
      branches: 73,
      functions: 98,
      lines: 95,
      statements: 95,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
