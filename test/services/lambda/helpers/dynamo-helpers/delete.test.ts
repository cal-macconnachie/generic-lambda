import { deleteItem as deleteFn } from '../../../../../lib/services/lambda/helpers/dynamo-helpers/delete'

describe('delete', () => {
  it('should delete an item from DynamoDB', async () => {
    // TODO: mock DynamoDBClient and test delete logic
    expect(typeof deleteFn).toBe('function')
  })
})
