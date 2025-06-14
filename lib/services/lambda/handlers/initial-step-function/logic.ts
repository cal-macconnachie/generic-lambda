export async function handler({ count }: { count: number }): Promise<{ count: number }> {
  // Simulate some processing logic
  return {
    count: count - 1
  }
}
