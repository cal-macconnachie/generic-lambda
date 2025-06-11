import { aws_dynamodb as dynamodb, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { ddbTableDefinitions } from './ddb-table-definitions'

// Add DdbTablesStackProps interface
export interface DdbTablesStackProps extends StackProps {
  appName: string
  envName: string
}

// Helper to map string type to CDK AttributeType
function toAttributeType(type: 'S' | 'N' | 'B'): dynamodb.AttributeType {
  switch (type) {
    case 'S':
      return dynamodb.AttributeType.STRING
    case 'N':
      return dynamodb.AttributeType.NUMBER
    case 'B':
      return dynamodb.AttributeType.BINARY
    default:
      throw new Error(`Unknown attribute type: ${type}`)
  }
}

// Helper to map string projection type to CDK ProjectionType
function toProjectionType(type?: 'ALL' | 'KEYS_ONLY' | 'INCLUDE'): dynamodb.ProjectionType {
  switch (type) {
    case 'KEYS_ONLY':
      return dynamodb.ProjectionType.KEYS_ONLY
    case 'INCLUDE':
      return dynamodb.ProjectionType.INCLUDE
    case 'ALL':
    default:
      return dynamodb.ProjectionType.ALL
  }
}

export class DdbTablesStack extends Stack {
  public readonly tables: Record<string, dynamodb.Table>

  constructor(scope: Construct, id: string, props: DdbTablesStackProps) {
    super(scope, id, props)
    this.tables = {}

    const { appName, envName } = props

    for (const def of ddbTableDefinitions) {
      const table = new dynamodb.Table(this, def.tableName, {
        tableName: `${def.tableName}-${appName}-${envName}`,
        partitionKey: {
          name: def.partitionKey.name,
          type: toAttributeType(def.partitionKey.type)
        },
        billingMode:
          def.billingMode === 'PAY_PER_REQUEST'
            ? dynamodb.BillingMode.PAY_PER_REQUEST
            : dynamodb.BillingMode.PROVISIONED,
        ...(def.sortKey && {
          sortKey: {
            name: def.sortKey.name,
            type: toAttributeType(def.sortKey.type)
          }
        })
      })
      if (def.globalSecondaryIndexes) {
        for (const gsi of def.globalSecondaryIndexes) {
          table.addGlobalSecondaryIndex({
            indexName: gsi.indexName,
            partitionKey: {
              name: gsi.partitionKey.name,
              type: toAttributeType(gsi.partitionKey.type)
            },
            ...(gsi.sortKey && {
              sortKey: {
                name: gsi.sortKey.name,
                type: toAttributeType(gsi.sortKey.type)
              }
            }),
            projectionType: toProjectionType(gsi.projectionType),
            nonKeyAttributes: gsi.nonKeyAttributes
          })
        }
      }
      this.tables[def.tableName] = table
    }
  }
}
