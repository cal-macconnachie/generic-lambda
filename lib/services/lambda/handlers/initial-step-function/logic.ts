export async function logic({ count }: { count: number }): Promise<{ count: number }> {
  // Simulate some processing logic
  return {
    count: count - 1
  }
}
