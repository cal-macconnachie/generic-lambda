export interface DdbTableDefinition {
  tableName: string
  partitionKey: { name: string; type: 'S' | 'N' | 'B' }
  sortKey?: { name: string; type: 'S' | 'N' | 'B' }
  billingMode?: 'PAY_PER_REQUEST' | 'PROVISIONED'
  globalSecondaryIndexes?: Array<{
    indexName: string
    partitionKey: { name: string; type: 'S' | 'N' | 'B' }
    sortKey?: { name: string; type: 'S' | 'N' | 'B' }
    projectionType?: 'ALL' | 'KEYS_ONLY' | 'INCLUDE'
    nonKeyAttributes?: string[]
  }>
  // Add other properties as needed
}

export const ddbTableDefinitions: DdbTableDefinition[] = [
  {
    tableName: 'authed-users',
    partitionKey: { name: 'cognito_id', type: 'S' },
    billingMode: 'PAY_PER_REQUEST',
    globalSecondaryIndexes: [
      {
        indexName: 'email-gsi',
        partitionKey: { name: 'email', type: 'S' },
        projectionType: 'ALL'
      }
    ]
  }
]
