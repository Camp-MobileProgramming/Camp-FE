import { setupWorker } from 'msw'
import { handlers } from './handlers'

// Export the worker so the app can start it in development only.
export const worker = setupWorker(...handlers)
