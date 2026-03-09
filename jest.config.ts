import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        jsx: "react-jsx",
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/src/__tests__/__mocks__/styleMock.ts",
    "^next/server$": "<rootDir>/src/__tests__/__mocks__/next-server.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "__mocks__", "setup.ts"],
};

export default config;
