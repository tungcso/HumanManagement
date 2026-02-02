# Code Style Guide

## 📋 General Rules

### Imports

- External dependencies first
- Internal modules second
- Organized alphabetically within each group
- Separated by blank lines

```typescript
// ✅ Good
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UserService } from "./user.service";
import { AuthModule } from "./auth/auth.module";
```

### Naming Conventions

#### TypeScript/NestJS

- `classes`: PascalCase
- `interfaces`: PascalCase (prefix with `I` optional)
- `functions`: camelCase
- `constants`: UPPER_SNAKE_CASE
- `variables`: camelCase

#### React/TSX

- `components`: PascalCase (files match component name)
- `hooks`: camelCase (prefix with `use`)
- `props types`: ComponentNameProps
- `handlers`: camelCase (prefix with `handle`)

### Code Formatting

#### Line Length

- **Backend**: 80 characters
- **Frontend**: 100 characters

#### Indentation

- Use 2 spaces (never tabs)
- Consistent throughout the project

#### Spacing

```typescript
// ✅ Good
const obj = { key: value };
const arr = [1, 2, 3];
function myFunc(param1, param2) {}

// ❌ Bad
const obj = { key: value };
const arr = [1, 2, 3];
function myFunc(param1, param2) {}
```

### Comments

#### When to Comment

- Explain **why**, not **what**
- Document complex logic
- Add JSDoc for public APIs

```typescript
// ✅ Good
/**
 * Validates user credentials against database
 * @param username - Username to validate
 * @param password - Password to check
 * @returns User object if valid, null otherwise
 */
async validateUser(username: string, password: string): Promise<User | null>

// ❌ Bad
// This function validates the user
function validateUser(u, p)
```

## Backend (NestJS)

### Module Structure

```
module-name/
├── module-name.controller.ts
├── module-name.service.ts
├── module-name.module.ts
├── dto/
│   ├── create-module-name.dto.ts
│   └── update-module-name.dto.ts
└── schemas/
    └── module-name.schema.ts
```

### Service Pattern

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async findOne(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
}
```

### Error Handling

```typescript
// ✅ Good - Use NestJS exceptions
throw new NotFoundException(`User with ID ${id} not found`);
throw new BadRequestException("Invalid email format");
throw new UnauthorizedException("Invalid credentials");

// ❌ Bad
throw new Error("User not found");
```

## Frontend (React/Next.js)

### Component Structure

```typescript
// ✅ Good component structure
type ComponentProps = {
  title: string;
  onClose: () => void;
  isLoading?: boolean;
};

export default function MyComponent({
  title,
  onClose,
  isLoading = false,
}: ComponentProps) {
  return (
    <div>
      {isLoading ? <Spinner /> : <div>{title}</div>}
    </div>
  );
}
```

### Avoid

- Inline styles (use Tailwind CSS classes)
- Props drilling (use context or composition)
- Large components (split into smaller ones)
- Magic numbers (use constants)

```typescript
// ❌ Bad
<div style={{ marginTop: '20px' }}>

// ✅ Good
<div className="mt-5">
```

### Type Annotations

```typescript
// ✅ Good
type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function Layout({ children }: Props) {
  // component code
}

// ❌ Bad
export default function Layout({ children }: any) {
  // component code
}
```

## Git Commit Messages

Format: `<type>(<scope>): <subject>`

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, missing semicolons, etc)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests or correcting existing tests

### Examples

```
feat(auth): add JWT refresh token functionality
fix(user): resolve password validation issue
docs(readme): update installation instructions
refactor(api): reorganize middleware structure
```

## Tools

### Prettier

Run formatting:

```bash
npm run format
```

### ESLint

Run linting:

```bash
npm run lint
```

### Pre-commit Hooks

Consider adding husky + lint-staged for automatic formatting before commits.

## Common Mistakes to Avoid

1. ❌ Mixing tabs and spaces
2. ❌ Using `any` type in TypeScript
3. ❌ Unused imports
4. ❌ Console.log in production code
5. ❌ Magic numbers without constants
6. ❌ Empty catch blocks
7. ❌ Commented-out code (use git history instead)
8. ❌ Inconsistent naming conventions

---

**Last Updated**: February 2026
