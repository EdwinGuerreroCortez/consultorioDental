
export const testEnvironment = "jsdom";
export const transform = {
    "^.+\\.[jt]sx?$": "babel-jest",
};
export const moduleNameMapper = {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
};
export const setupFilesAfterEnv = [
    "<rootDir>/jest.setup.js"
];
