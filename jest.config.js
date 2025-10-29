export default {
    testEnvironment: "node",

    testMatch: [
        "**/src/__tests__/**/*.test.js"
    ],

    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    }
};
