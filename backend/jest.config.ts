import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',  // Usa el preset ESM de ts-jest
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',         // Resuelve extensiones .js a archivos reales
  },
  extensionsToTreatAsEsm: ['.ts'],        // Trata .ts como ESM
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,                       // Habilita ESM en ts-jest
    }],
  },               // Dejar vacío si no necesitas
};

export default config;