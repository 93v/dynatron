"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 58,
      functions: 89,
      lines: 84,
      statements: 84,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
