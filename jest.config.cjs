
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {},
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
    },
  },
};