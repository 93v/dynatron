"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 62,
      functions: 92,
      lines: 87,
      statements: 87,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
