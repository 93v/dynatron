"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
