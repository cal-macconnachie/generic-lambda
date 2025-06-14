export async function end({ count }: { count: number }): Promise<{ status: string }> {
  // This function is called at the end of the step function
  // Here you can perform any final actions, like cleaning up resources or logging
  // For example, you might want to log the completion of the step function
  // or update a database record to indicate that the process is complete.
  // In this case, we just log a success message
  console.log('End of step function reached with count:', count)
  // You can also return a status or result if needed
  // For example, returning a success status
  if (count !== 0) {
    throw new Error(`Expected count to be 0, but got ${count}`)
  }
  console.log('success')
  return { status: 'success' }
}
