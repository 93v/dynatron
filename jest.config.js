"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/src/usage.ts"],
  coverageThreshold: {
    global: {
      branches: 91,
      functions: 100,
      lines: 99,
      statements: 98,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
