import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

const dynamo = new DynamoDBClient({})

export async function create<T>({
  tableName,
  key,
  record,
  returnCreated = false
}: {
  tableName: string
  key: Record<string, unknown>
  record: Partial<T>
  returnCreated?: boolean
}): Promise<void | T> {
  // Merge key and updates into a single item
  const item = { ...record, ...key }
  // delete any undefined values to avoid issues with DynamoDB
  Object.keys(item).forEach((k) => item[k] === undefined && delete item[k])
  const command = new PutItemCommand({
    TableName: tableName,
    Item: marshall(item),
    ReturnValues: returnCreated ? 'ALL_OLD' : undefined // DynamoDB only supports 'ALL_OLD' for PutItem
  })
  await dynamo.send(command)
  if (returnCreated) {
    // Since PutItem does not return the new item, return the input item
    return item as T
  }
}
