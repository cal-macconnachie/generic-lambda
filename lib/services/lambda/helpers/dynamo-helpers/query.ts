import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const dynamo = new DynamoDBClient({})

export async function query<T>({
  tableName,
  keyConditionExpression,
  expressionAttributeValues,
  expressionAttributeNames,
  filterExpression,
  indexName,
  limit,
  scanIndexForward = true,
  exclusiveStartKey
}: {
  tableName: string
  keyConditionExpression: string
  expressionAttributeValues: Record<string, unknown>
  expressionAttributeNames?: Record<string, string>
  filterExpression?: string
  indexName?: string
  limit?: number
  scanIndexForward?: boolean
  exclusiveStartKey?: Record<string, unknown>
}): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, unknown> }> {
  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
    ExpressionAttributeNames: expressionAttributeNames,
    FilterExpression: filterExpression,
    IndexName: indexName,
    Limit: limit,
    ScanIndexForward: scanIndexForward,
    ExclusiveStartKey: exclusiveStartKey ? marshall(exclusiveStartKey) : undefined
  })
  const result = await dynamo.send(command)
  const items = (result.Items || []).map((item) => unmarshall(item) as T)
  const lastEvaluatedKey = result.LastEvaluatedKey ? unmarshall(result.LastEvaluatedKey) : undefined
  return { items, lastEvaluatedKey }
}

export async function queryAll<T>(params: {
  tableName: string
  keyConditionExpression: string
  expressionAttributeValues: Record<string, unknown>
  expressionAttributeNames?: Record<string, string>
  filterExpression?: string
  indexName?: string
  scanIndexForward?: boolean
}): Promise<T[]> {
  let items: T[] = []
  let lastEvaluatedKey: Record<string, unknown> | undefined = undefined
  do {
    const result: { items: T[]; lastEvaluatedKey?: Record<string, unknown> } = await query<T>({
      ...params,
      exclusiveStartKey: lastEvaluatedKey
    })
    items = items.concat(result.items)
    lastEvaluatedKey = result.lastEvaluatedKey
  } while (lastEvaluatedKey)
  return items
}
