<!--
  SYNC IMPACT REPORT
  ==================
  Version Change: 0.0.0 → 1.0.0
  
  Modified Principles:
  - NEW: I. Do Less, Get Works
  - NEW: II. Playground Over Tests
  - NEW: III. Declarative Style
  - NEW: IV. Consistent Code Style
  - NEW: V. Readability First
  
  Added Sections:
  - Core Principles (5 principles)
  - Code Quality Standards
  - Development Workflow
  - Governance
  
  Removed Sections: None (initial constitution)
  
  Templates Status:
  ✅ .specify/templates/plan-template.md - Updated with constitution check for 5 principles
  ✅ .specify/templates/spec-template.md - Added playground validation section
  ✅ .specify/templates/tasks-template.md - Replaced test tasks with playground tasks
  ⚠ .specify/templates/checklist-template.md - Manual review recommended
  ⚠ .specify/templates/agent-file-template.md - Manual review recommended
  
  Follow-up TODOs:
  - Review checklist-template.md and agent-file-template.md for alignment
  - Add language-specific formatter configurations (Prettier, Black, gofmt, etc.)
  - Create playground/demo guidelines document in docs/
  - Update any command prompt files in .github/prompts/ that reference testing
-->

# CF Boardgames Constitution

## Core Principles

### I. Do Less, Get Works

Code MUST solve the immediate problem with minimal complexity. Every line of code is a liability - write only what is necessary to deliver working functionality.

**Rules:**
- Build the simplest thing that works
- No speculative features or premature abstractions
- Delete code aggressively - if unused, remove it
- Each feature MUST have a clear, immediate use case
- Reject complexity that doesn't directly serve current needs

**Rationale:** Complexity accumulates rapidly. By ruthlessly prioritizing working solutions over comprehensive ones, we maintain velocity and reduce maintenance burden. Simple code is debuggable, modifiable, and understandable.

### II. Playground Over Tests

Working demonstrations MUST validate functionality. Create interactive playgrounds, examples, or demo pages that prove features work - not test suites.

**Rules:**
- Every feature MUST include a working playground/demo
- Playgrounds MUST be runnable and demonstrate actual usage
- Manual verification through playgrounds is acceptable
- Tests are OPTIONAL and only added if explicitly required
- Documentation MUST show working examples, not theoretical APIs

**Rationale:** Playgrounds serve dual purposes: they validate functionality AND provide clear usage examples for developers. They demonstrate real-world integration rather than isolated unit behavior. Users can see and interact with working code immediately.

### III. Declarative Style

Code MUST express intent clearly through declarative patterns. Favor configuration, data-driven approaches, and functional composition over imperative procedural logic.

**Rules:**
- Prefer declarative APIs that describe "what" over imperative "how"
- Use data structures to drive behavior (maps, configs, schemas)
- Favor pure functions and immutable data where practical
- Minimize state mutations and side effects
- Express business logic as transformations, not procedures

**Rationale:** Declarative code is self-documenting. The structure reveals intent without requiring readers to trace execution paths. Data-driven approaches centralize complexity and make behavior changes trivial.

### IV. Consistent Code Style

All code MUST follow uniform formatting, naming, and structural conventions. Consistency is non-negotiable.

**Rules:**
- Use automated formatters (Prettier, Black, gofmt, etc.) - no manual formatting
- Follow established language idioms and community standards
- Naming conventions MUST be consistent: camelCase vs snake_case per language
- File organization MUST follow predictable patterns
- Code structure MUST be uniform across the codebase
- Configuration files MUST use consistent formats (prefer YAML/JSON)

**Rationale:** Inconsistency creates cognitive friction. Developers spend mental energy decoding style variations rather than understanding logic. Automated tools eliminate debates and enforce uniformity effortlessly.

### V. Readability First

Code MUST prioritize human comprehension over cleverness, brevity, or performance optimizations (unless performance is the explicit requirement).

**Rules:**
- Choose clarity over cleverness - obvious code beats "smart" code
- Variable and function names MUST be descriptive and unambiguous
- Break complex expressions into named intermediate steps
- Add comments ONLY when code cannot be made self-explanatory
- Avoid nested logic beyond 2-3 levels - extract functions instead
- Magic numbers/strings MUST be named constants

**Rationale:** Code is read 10x more than written. Readable code reduces onboarding time, prevents bugs, and enables confident refactoring. Future maintainers (including yourself) will thank you.

## Code Quality Standards

### Mandatory Quality Gates

Before considering any feature complete, it MUST meet these criteria:

1. **Working Playground**: A runnable example/demo that proves the feature works
2. **Consistent Style**: Passes automated formatter checks
3. **Readable**: Can be understood by a developer unfamiliar with the feature in under 5 minutes
4. **Minimal**: Contains no unused code, speculative features, or unnecessary abstractions
5. **Declarative**: Logic is expressed through data and transformations where applicable

### Complexity Justification

If any of these complexity indicators appear, they MUST be explicitly justified:

- More than 3 levels of abstraction
- Custom design patterns beyond language standards
- Framework abstractions over direct implementation
- Code generation or metaprogramming
- Performance optimizations that reduce readability

Justification format: "This complexity is required because [specific problem], simpler approach [X] was rejected because [concrete reason]."

## Development Workflow

### Feature Development Process

1. **Define**: Write clear feature spec with user scenarios and acceptance criteria
2. **Plan**: Identify minimal implementation path
3. **Build**: Implement simplest working solution
4. **Demonstrate**: Create playground showing feature works
5. **Polish**: Format code, improve readability, remove dead code
6. **Document**: Add working examples to documentation

### Code Review Focus

Reviews MUST verify:
- ✅ Playground demonstrates feature works
- ✅ Code is formatted consistently
- ✅ Logic is readable and declarative where applicable
- ✅ No unnecessary complexity or speculative code
- ✅ Naming is clear and unambiguous

Reviews should NOT focus on:
- ❌ Test coverage (unless tests explicitly requested)
- ❌ Theoretical edge cases without real-world justification
- ❌ Performance optimization without measured need

## Governance

### Authority

This constitution supersedes all other development practices, style guides, and conventions. When in doubt, these principles take precedence.

### Amendments

Constitution changes require:
1. Documented rationale for the change
2. Version increment following semantic versioning:
   - **MAJOR**: Principle removal or incompatible redefinition
   - **MINOR**: New principle or substantial expansion
   - **PATCH**: Clarifications, wording improvements, examples
3. Update to all dependent template files (plan, spec, tasks, etc.)
4. Sync Impact Report prepended to constitution file

### Compliance

- All feature specifications MUST reference constitution compliance
- All implementation plans MUST include Constitution Check section
- Code reviews MUST verify adherence to core principles
- Complexity violations MUST be tracked and justified in plan.md

### Template Consistency

Templates in `.specify/templates/` MUST align with these principles:
- `plan-template.md`: Constitution Check reflects current principles
- `spec-template.md`: User scenarios emphasize demonstrable functionality
- `tasks-template.md`: Task structure reflects playground-first approach
- Agent guidance files MUST reference this constitution for runtime decisions

**Version**: 1.0.0 | **Ratified**: 2025-10-24 | **Last Amended**: 2025-10-24
