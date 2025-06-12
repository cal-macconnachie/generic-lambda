import { query } from '../../../../../lib/services/lambda/helpers/dynamo-helpers/query'

describe('query', () => {
  it('should query items from DynamoDB', async () => {
    // TODO: mock DynamoDBClient and test query logic
    expect(typeof query).toBe('function')
  })
})
