import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const dynamo = new DynamoDBClient({})

export async function update<T>({
  tableName,
  key,
  updates,
  returnUpdated = false
}: {
  tableName: string
  key: Record<string, unknown>
  updates: Partial<T>
  returnUpdated?: boolean
}): Promise<void | T> {
  // Remove key attributes from updates

  Object.keys(updates).forEach(
    (k) =>
      (updates as Record<string, unknown>)[k] === undefined &&
      delete (updates as Record<string, unknown>)[k]
  )
  const updateKeys = Object.keys(updates).filter((k) => !Object.keys(key).includes(k))
  if (updateKeys.length === 0) return

  let UpdateExpression = ''
  const ExpressionAttributeNames: Record<string, string> = {}
  const ExpressionAttributeValues: Record<string, unknown> = {}
  const setExpr: string[] = []
  const removeExpr: string[] = []

  for (const k of updateKeys) {
    const v = (updates as Record<string, unknown>)[k]
    const nameKey = `#${k}`
    if (v === '') {
      removeExpr.push(nameKey)
    } else {
      setExpr.push(`${nameKey} = :${k}`)
      ExpressionAttributeValues[`:${k}`] = v
    }
    ExpressionAttributeNames[nameKey] = k
  }

  if (setExpr.length > 0) {
    UpdateExpression += 'SET ' + setExpr.join(', ')
  }
  if (removeExpr.length > 0) {
    if (UpdateExpression) UpdateExpression += ' '
    UpdateExpression += 'REMOVE ' + removeExpr.join(', ')
  }

  const command = new UpdateItemCommand({
    TableName: tableName,
    Key: marshall(key),
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues:
      Object.keys(ExpressionAttributeValues).length > 0
        ? marshall(ExpressionAttributeValues)
        : undefined,
    ReturnValues: returnUpdated ? 'ALL_NEW' : undefined
  })
  const result = await dynamo.send(command)
  if (returnUpdated && result.Attributes) {
    return unmarshall(result.Attributes) as T
  }
}
