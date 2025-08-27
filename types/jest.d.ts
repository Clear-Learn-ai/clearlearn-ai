// Jest type definitions for educational testing
import '@types/jest'

declare global {
  function createMockStudentQuery(overrides?: Record<string, unknown>): any
  function createMockVideoContent(overrides?: Record<string, unknown>): any
}