# Y8 App

## Overview

Y8 App is a Dapp-based decentralized application designed to [brief description of your app's purpose].

## Features

- Feature 1
- Feature 2
- Feature 3
- AI-Powered PR Review System (authContext conformance & security checks)
- [Add more features as needed]

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/y8-app.git

# Navigate to the project directory
cd y8-app

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

## Usage

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Smart Contracts

Smart contracts are located in the `contracts/` directory.

To deploy contracts:

```bash
npx hardhat deploy --network [network_name]
```

## Tech Stack

- Ethereum
- Solidity
- [Other technologies used in your project]
- [Frontend framework if applicable]

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Note**: All PRs are reviewed against authContext rules and security standards. See [.github/agents/README.md](.github/agents/README.md) for review guidelines.

## Code Review

This project uses an AI-powered PR review system to ensure:
- ✅ **authContext Conformance** - All authentication follows centralized patterns
- ✅ **Security Checks** - 10 critical vulnerability categories
- ✅ **Code Quality** - Anti-patterns and best practices

**For Developers**: Review [.github/agents/authcontext-rules-quick-reference.md](.github/agents/authcontext-rules-quick-reference.md) before coding
**For Reviewers**: Use [.github/agents/PR_REVIEW_CHECKLIST.md](.github/agents/PR_REVIEW_CHECKLIST.md) for manual reviews
**Documentation**: See [.github/agents/](.github/agents/) for complete AI agent documentation

## License

This project is licensed under the [LICENSE NAME] - see the LICENSE file for details.

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/y8-app](https://github.com/yourusername/y8-app)