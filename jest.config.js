"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 70,
      lines: 65,
      statements: 65,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};
