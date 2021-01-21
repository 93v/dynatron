"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
