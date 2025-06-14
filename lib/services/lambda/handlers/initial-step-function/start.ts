// This file is part of the "initial-step-function" service.
export async function handler({ count = 0 }: { count?: number }) {
  // Pass the count to logic
  if (count < 0) {
    throw new Error('Count must be a non-negative integer')
  }
  console.log('Start of step function reached with count:', count)
  return {
    count: count,
    stepCompleted: 'start'
  }
}
