# Contributing to Project Library

Thank you for your interest in contributing to Project Library! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Documentation](#documentation)

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We are committed to providing a welcoming and harassment-free experience for everyone.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then:
   git clone https://github.com/your-username/project-library.git
   cd project-library
   ```

2. **Set up your development environment**
   ```bash
   npm install
   cd backend && npm run db:generate && npm run db:migrate && cd ..
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Make your changes**

5. **Test your changes**
   ```bash
   npm run type-check
   npm run lint
   npm run dev  # Test manually
   ```

## 🔄 Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

Examples:
- `feature/user-dashboard`
- `fix/login-authentication`
- `docs/api-documentation`

### Workflow Steps

1. **Update your fork**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create your feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add user dashboard feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**

## 💻 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type - use proper types or `unknown`
- Use interfaces for object shapes
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names

```typescript
// ✅ Good
interface UserProfile {
  id: string
  name: string
  email: string
}

const getUserProfile = async (userId: string): Promise<UserProfile> => {
  // implementation
}

// ❌ Bad
const getUser = async (id: any): Promise<any> => {
  // implementation
}
```

### React/Next.js

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for props
- Follow Next.js App Router conventions

```typescript
// ✅ Good
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={variant}>
      {label}
    </button>
  )
}

// ❌ Bad
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>
}
```

### Backend (Fastify)

- Use async/await for asynchronous operations
- Validate all inputs with Zod schemas
- Handle errors properly
- Use proper HTTP status codes

```typescript
// ✅ Good
server.post('/api/users', async (request, reply) => {
  try {
    const data = UserSchema.parse(request.body)
    const user = await userService.create(data)
    return reply.code(201).send(user)
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: error.errors })
    }
    throw error
  }
})
```

### File Organization

- One component per file
- Use PascalCase for components
- Use camelCase for utilities and functions
- Group related files in folders

```
components/
  ├── ui/
  │   ├── button.tsx
  │   └── card.tsx
  └── project-card.tsx
```

### Code Formatting

We use ESLint and Prettier (via Next.js defaults). Run:

```bash
npm run lint
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
feat(auth): add phone number validation

Add E.164 format validation for phone numbers during registration.
Includes regex pattern matching and error messages.

Closes #123

fix(enrollment): resolve progress sync issue

Group enrollments were not syncing progress correctly.
Fixed by updating the sync logic in enrollment service.

refactor(api): improve error handling

- Standardize error response format
- Add proper error types
- Update error middleware
```

### Commit Message Best Practices

- Use imperative mood ("add" not "added" or "adds")
- Keep subject line under 50 characters
- Capitalize first letter of subject
- No period at end of subject
- Reference issues/PRs in footer

## 🔀 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run type checking**: `npm run type-check`
4. **Run linter**: `npm run lint`
5. **Test manually** in development
6. **Update CHANGELOG.md** if applicable

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Type checking passes
- [ ] Linting passes

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, your PR will be merged
4. Thank you for contributing! 🎉

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Try to reproduce the bug
3. Check if it's a known issue

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other relevant information.
```

## 📚 Documentation

### Code Comments

- Comment complex logic
- Use JSDoc for functions
- Keep comments up-to-date

```typescript
/**
 * Creates a new user enrollment in a project.
 * 
 * @param userId - The ID of the user enrolling
 * @param projectId - The ID of the project to enroll in
 * @returns The created enrollment object
 * @throws {Error} If user or project not found
 */
async function createEnrollment(userId: string, projectId: string): Promise<Enrollment> {
  // implementation
}
```

### Documentation Updates

- Update README.md for major changes
- Update API.md for API changes
- Add examples for new features
- Keep documentation in sync with code

## 🧪 Testing

### Writing Tests

- Write tests for new features
- Test edge cases
- Test error handling
- Keep tests simple and focused

### Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Manual testing
npm run dev
```

## 🎯 Priority Areas

We especially welcome contributions in:

- **Documentation**: Improving docs, adding examples
- **Testing**: Adding test coverage
- **Accessibility**: Improving a11y
- **Performance**: Optimizations
- **UI/UX**: Design improvements
- **Internationalization**: Multi-language support

## ❓ Questions?

- Open a [GitHub Discussion](https://github.com/your-org/project-library/discussions)
- Check existing [Issues](https://github.com/your-org/project-library/issues)
- Review [Documentation](./docs/)

## 🙏 Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute!

---

**Happy Coding! 🚀**

