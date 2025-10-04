# Project Constitution Feature

## Overview
The constitution feature allows you to create or update the foundational principles and guidelines for your project through interactive input or provided principles, while ensuring all dependent templates remain synchronized.

## Purpose
- Establish core project principles and values
- Maintain consistency across all project documentation
- Provide a single source of truth for project governance
- Automatically propagate principle changes to dependent templates

## Key Capabilities

### 1. Constitution Creation
- Interactive mode: Guide users through defining project principles
- Declarative mode: Accept pre-defined principles as input
- Validation of principle completeness and clarity

### 2. Constitution Updates
- Modify existing principles while maintaining template consistency
- Track changes to constitutional principles over time
- Validate updates for conflicts with existing documentation

### 3. Template Synchronization
- Automatically update dependent templates when constitution changes
- Maintain consistency across:
  - `requirements.md`
  - `design.md`
  - `prep_tasks.md`
  - `master-tasks.md`
  - Other project documentation

## Structure

### Constitution Document Format
```markdown
# Project Constitution

## Core Principles
1. [Principle Name]
   - Description: [Clear description]
   - Rationale: [Why this principle matters]
   - Impact: [How this affects project decisions]

## Values
- [Value 1]: [Definition and application]
- [Value 2]: [Definition and application]

## Guidelines
- [Guideline 1]: [Specific implementation guidance]
- [Guideline 2]: [Specific implementation guidance]

## Constraints
- [Constraint 1]: [Limitation and justification]
- [Constraint 2]: [Limitation and justification]
```

## Usage

### Interactive Mode
```bash
/constitution
# Follow prompts to define:
# - Core principles
# - Project values
# - Development guidelines
# - Technical constraints
```

### Update Mode
```bash
/constitution --update
# Modify existing principles
# System automatically updates dependent templates
```

### Validation
```bash
/constitution --validate
# Check consistency across all documents
# Identify conflicts or gaps
```

## Template Dependencies

### Affected Documents
1. **requirements.md**
   - Aligns functional requirements with principles
   - Ensures non-functional requirements reflect values

2. **design.md**
   - Architecture decisions follow constitutional guidelines
   - Security and performance designs adhere to constraints

3. **prep_tasks.md**
   - Task definitions respect project principles
   - Implementation approach follows guidelines
   - Converted to `tasks.md` using agent-task-manager MCP's `analyze_tasks` function
   - Analyzes task dependencies and relationships between tasks

4. **master-tasks.md**
   - Integration strategy aligns with core values
   - Roadmap priorities reflect principles

## Synchronization Mechanism

### Update Propagation
1. Constitution change detected
2. Analyze impacted templates
3. Generate update recommendations
4. Apply changes maintaining context
5. Validate consistency across all documents

### Conflict Resolution
- Identify conflicting requirements
- Propose resolution options
- Update templates to resolve conflicts
- Document resolution decisions

## Best Practices

### Defining Principles
- **Specific**: Clear and unambiguous statements
- **Actionable**: Can be applied to concrete decisions
- **Measurable**: Success can be evaluated
- **Relevant**: Directly impacts project outcomes

### Maintaining Consistency
- Review constitution regularly
- Update templates immediately when principles change
- Validate all documents after constitutional updates
- Document rationale for principle changes

### Interactive Input Guidelines
- Answer thoughtfully and completely
- Consider long-term implications
- Align with organizational values
- Be realistic about constraints

## Example Constitution

```markdown
# SendErrorMessage Project Constitution

## Core Principles

1. **Reliability First**
   - Description: Error logging must never fail silently
   - Rationale: Missing error data compromises debugging capability
   - Impact: All error paths must have fallback mechanisms

2. **Privacy by Design**
   - Description: No sensitive user data in error logs
   - Rationale: Compliance and user trust requirements
   - Impact: Sanitization required before logging

## Values
- Simplicity: Minimal configuration required
- Performance: Low overhead on application
- Transparency: Clear error reporting

## Guidelines
- Use TypeScript for type safety
- Implement comprehensive error handling
- Write unit tests for all error scenarios
- Document all public APIs

## Constraints
- Must support Supabase backend
- Maximum 100ms latency per log operation
- Compatible with Node.js 18+
```

## Benefits

### For Development
- Clear decision-making framework
- Consistent coding standards
- Reduced architectural debates

### For Documentation
- Automated consistency maintenance
- Single source of truth
- Reduced manual synchronization effort

### For Team
- Shared understanding of priorities
- Aligned implementation approach
- Clear conflict resolution process

## Related Commands
- `/specify` - Create feature specifications aligned with constitution
- `/plan` - Generate implementation plans following principles
- `/analyze` - Validate consistency with constitutional guidelines
- `analyze_tasks` (agent-task-manager MCP) - Convert prep_tasks.md to tasks.md with dependency analysis

## File Location
- Constitution document: `docs/constitution.md`
- Template mappings: `.claude/constitution-templates.json`
- Change history: `docs/constitution-history.md`
