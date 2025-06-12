import { get } from '../../../../../lib/services/lambda/helpers/dynamo-helpers/get'

describe('get', () => {
  it('should get an item from DynamoDB', async () => {
    // TODO: mock DynamoDBClient and test get logic
    expect(typeof get).toBe('function')
  })
})
