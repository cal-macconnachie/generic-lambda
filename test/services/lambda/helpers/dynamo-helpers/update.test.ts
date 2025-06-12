import { update } from '../../../../../lib/services/lambda/helpers/dynamo-helpers/update'

describe('update', () => {
  it('should update an item in DynamoDB', async () => {
    // TODO: mock DynamoDBClient and test update logic
    expect(typeof update).toBe('function')
  })
})
