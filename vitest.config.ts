/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react() as any],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: [], // Add setup file if needed
        include: ['src/tests/unit/**/*.spec.ts'],
    },
});
