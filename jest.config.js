module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  transformIgnorePatterns: [
    // This pattern attempts to transform problematic ESM modules from node_modules.
    // It says: ignore node_modules EXCEPT for these specific packages.
    // Make sure this list includes all ESM packages that need transformation.
    "/node_modules/(?!(@lit-protocol|jose|@walletconnect|@web3modal|wagmi|@wagmi|@tanstack|@stytch)/)",
    "\\.pnp\\.[^\\/]+$",
  ],
  // other configurations if any...
};
