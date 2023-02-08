module.exports = {
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest", // <- transform JS files
  },
  testRegex: "/src/.*\\.spec.(ts|js)$",
  collectCoverageFrom: [
    "src/*.ts"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(ol)/)", // <- exclude the ol library from not being transformed
  ],
};
