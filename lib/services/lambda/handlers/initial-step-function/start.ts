// This file is part of the "initial-step-function" service.
export async function start(event: { count: number }) {
  // Pass the count to logic
  if (event.count < 0) {
    throw new Error('Count must be a non-negative integer')
  }
  console.log('Start of step function reached with count:', event.count)
  return {
    count: event.count,
    stepCompleted: 'start'
  }
}
