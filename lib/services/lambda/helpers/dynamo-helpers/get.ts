import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const dynamo = new DynamoDBClient({})

export async function get<T>({
  tableName,
  key
}: {
  tableName: string
  key: Record<string, unknown>
}): Promise<T | undefined> {
  const command = new GetItemCommand({
    TableName: tableName,
    Key: marshall(key)
  })
  const result = await dynamo.send(command)
  if (!result.Item) return undefined
  return unmarshall(result.Item) as T
}
