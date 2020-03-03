module.exports = {
    // The root of your source code, typically /src
    // `<rootDir>` is a token Jest substitutes
    // MY-CUSTOM: I put the root of the test code, since we will have all tests there.
    roots: ["<rootDir>/test"],
  
    // Jest transformations -- this adds support for TypeScript
    // using ts-jest
    transform: {
      "^.+\\.tsx?$": "ts-jest"
    },

    moduleNameMapper: {
      '^FunBlocks/(.*)$' : "<rootDir>/src/$1"
    },

    preset: 'ts-jest/presets/js-with-babel',

    moduleDirectories: ['node_modules', 'src'],
  
    // Runs special logic, such as cleaning up components
    // when using React Testing Library and adds special
    // extended assertions to Jest
    setupFilesAfterEnv: [
      "@testing-library/react/cleanup-after-each",
      "@testing-library/jest-dom/extend-expect"
    ],
  
    // Test spec file resolution pattern
    // Matches parent folder `__tests__` and filename
    // should contain `test` or `spec`.
    // testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    // Custom : Accepts any ts, tsx file
    testRegex: ".*\\.tsx?$",
  
    // Module file extensions for importing
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
  };