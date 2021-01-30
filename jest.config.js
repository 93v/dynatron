"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 93,
      functions: 100,
      lines: 99,
      statements: 99,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
