"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 48,
      functions: 82,
      lines: 77,
      statements: 77,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
