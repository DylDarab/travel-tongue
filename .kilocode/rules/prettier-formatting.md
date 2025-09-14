## Brief overview

This rule enforces automatic Prettier formatting for all code files in the Travel Tongue project to maintain consistent code style and formatting across the codebase.

## Prettier formatting requirements

- **Always run Prettier** on any newly created or edited files before considering the task complete
- **Use the project's Prettier configuration** defined in [`prettier.config.js`](prettier.config.js:1)
- **Format TypeScript/JavaScript files** (.ts, .tsx, .js, .jsx)
- **Format CSS files** (.css)
- **Format JSON files** (.json)
- **Format markdown files** (.md)

## Implementation workflow

- After creating or editing any file, run `pnpm prettier --write <file-path>` before proceeding
- For multiple files, use `pnpm prettier --write "src/**/*.{ts,tsx,js,jsx,css,json,md}"`
- Verify formatting was applied by checking the file contents
- If Prettier makes changes, review them to ensure they align with the intended code structure

## Code style consistency

- **Follow project's existing patterns** for imports, spacing, and structure
- **Maintain consistent indentation** (2 spaces based on project configuration)
- **Preserve trailing commas** where appropriate
- **Use single quotes** for strings as configured
- **Apply consistent semicolon usage** throughout files

## Quality assurance

- **Check formatting before commits** by running `pnpm check` which includes Prettier validation
- **Fix any formatting issues** identified by the linter before marking tasks as complete
- **Ensure no formatting conflicts** exist between manual edits and Prettier's automatic formatting
