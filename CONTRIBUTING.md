# Contributing to FreshKeeper

Thank you for your interest in contributing to FreshKeeper! This document provides guidelines and steps for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Style Guide](#style-guide)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold a respectful and inclusive environment.

## Getting Started

### Prerequisites

- [WeChat Developer Tools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- WeChat base library 3.3.4+
- Git

### Setup

```bash
# Clone your fork
git clone https://github.com/<your-username>/freshkeeper.git
cd freshkeeper

# Open in WeChat Developer Tools
# Import the project directory and compile
```

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes** following the style guide below.

3. **Test your changes** in WeChat Developer Tools:
   - Verify the app compiles without errors
   - Test affected pages manually
   - Run the test suite via console: `require('./tests/test-cases')`

4. **Commit** using Conventional Commits (see below).

5. **Push** and open a Pull Request.

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). All commit messages must use this format:

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, or auxiliary changes |
| `ci` | CI/CD configuration changes |

### Examples

```
feat(recipes): add calorie filter to recipe recommendations
fix(expiry): correct timezone issue in expiry date calculation
docs: update README with new installation steps
test(food-service): add edge cases for date boundary tests
```

## Pull Request Process

1. **Update documentation** if your change affects user-facing behavior.
2. **Ensure CI passes** -- the CI pipeline validates `app.json` and page file completeness.
3. **Fill in the PR template** completely.
4. **Request review** from a maintainer.
5. **Address review feedback** promptly.

### PR Title Format

Use the same Conventional Commits format as commit messages:

```
feat(shopping): add category filter toggle
```

## Reporting Issues

Use the [GitHub issue tracker](https://github.com/WuSuBuDuoMing/freshkeeper/issues) to report bugs or request features.

- **Bug reports**: Use the "Bug Report" template. Include steps to reproduce, expected behavior, and screenshots if possible.
- **Feature requests**: Use the "Feature Request" template. Describe the use case and proposed solution.

## Style Guide

### JavaScript

- Use `const` by default, `let` when reassignment is needed. Avoid `var`.
- Use camelCase for variables and functions, UPPER_SNAKE_CASE for constants.
- Add JSDoc comments for all exported functions.
- Keep functions focused and under 50 lines when possible.

### WXML / WXSS

- Use semantic component names.
- Prefer CSS variables for theming.
- Keep styles scoped to components.

### File Naming

- Pages: `pages/<name>/<name>.{js,json,wxml,wxss}`
- Components: `components/<name>/<name>.{js,json,wxml,wxss}`
- Services: `services/<name>-service.js`
- Utils: `utils/<name>-utils.js`

## Questions?

If you have questions about contributing, feel free to open an issue with the "question" label or reach out to the maintainers.
