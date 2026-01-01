# Extendo

Extendo is a Vision-Driven, Self-Healing Extension Generator. It uses AI to generate and inject "Micro-Extensions" into web pages at runtime.

## Documentation

- [Architecture Overview](docs/index.md)

## Development Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    This will start the Vite HMR server.

3.  **Load Extension in Chrome**:
    - Go to `chrome://extensions`.
    - Enable **Developer Mode**.
    - Click **Load unpacked**.
    - Select the `dist` directory.

## Testing

The project uses [Playwright](https://playwright.dev/) for both Unit and E2E testing.

### Running Tests

Run all tests:
```bash
npx playwright test
```

Run specific test file:
```bash
npx playwright test src/tests/unit/harvester.spec.ts
```

### Writing Tests
- **Unit Tests** (`src/tests/unit`): Use `jsdom` for DOM-dependent logic.
- **E2E Tests** (`src/tests/e2e`): Use the custom `test` fixture from `src/tests/fixtures.ts` which loads the extension.
