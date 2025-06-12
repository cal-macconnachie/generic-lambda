import { create } from '../../../../../lib/services/lambda/helpers/dynamo-helpers/create'

describe('create', () => {
  it('should create an item in DynamoDB', async () => {
    // TODO: mock DynamoDBClient and test create logic
    expect(typeof create).toBe('function')
  })
})
