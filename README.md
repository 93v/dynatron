# ⚡️ Dynatron

![David](https://img.shields.io/david/93v/dynatron.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/93v/dynatron.svg)
![GitHub repo size](https://img.shields.io/github/repo-size/93v/dynatron.svg)
![npm](https://img.shields.io/npm/dw/dynatron.svg)
![npm](https://img.shields.io/npm/dm/dynatron.svg)
![npm](https://img.shields.io/npm/dy/dynatron.svg)
![npm](https://img.shields.io/npm/dt/dynatron.svg)
![npm](https://img.shields.io/npm/l/dynatron.svg)
![npm](https://img.shields.io/npm/v/dynatron.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/93v/dynatron.svg)
![npm collaborators](https://img.shields.io/npm/collaborators/dynatron.svg)

Bridge between AWS DynamoDB Document Client and Real World usage.

## Installation

```bash
npm install dynatron
```

## Introduction

This library provides a number of abstractions, tools and functions designed to
make dealing with Amazon DynamoDB easier and more natural for developers.

Works with both `node` and `browser` code.

This library provides utilities for automatically submitting arbitrarily-sized
batches of reads and writes to DynamoDB using well-formed BatchGetItem and
BatchWriteItem operations, correct and reliable Scan and Query operations.

The library has built-in defaults and mechanisms based on real-world applications
making the requests to Amazon DynamoDB more reliable, adding exponential reties
for applicable requests, optimizing API calls and more.

## Components

### Attribute Path

The paths passed into functions are parsed and serialized to best represent the
DynamoDB document paths. The paths are parses by scanning for dots (`.`), which
designate map property dereferencing and left brackets (`[`), which designate
list attribute dereferencing. For example, `ProductReviews.FiveStar[0].reviewer.username`
would be understood as referring to the `username` property of the `reviewer`
property of the `first` element of the list stored at the `FiveStar` property of
the top-level `ProductReviews` document attribute.

If a property name contains a left bracket or dot, it may be escaped with a
backslash `\`. For example, `Product\\.Reviews` would be interpreted as a single
top-level document attribute rather than as a map property access.

### Sets of Values

AWS DynamoDB has special attribute types called Sets. They are unique arrays of
values. The following function returns a correct Set that can be assigned to a
DB entry property.

```typescript
setOfValues(["A", "B", "C"]);
```

#### Pre-process before JSON.stringify

The Sets returned from the DB when stringified are converted to arrays. This is
fine in most of the cases, but that loses the info that the property used to be
a set. To not loose that info `preStringify` function can be used, that converts
the Set to an object which passed into `put` or similar functions gets written
into the db correctly as a Set.

```typescript
preStringify(attributeMap);
```

### Condition Expression Builders

Dynatron provides quite a few utility functions to help build Condition
Expressions that can be used in `if` and `where` functions of the requests.

#### Boolean Functions

```typescript
// Joins conditions into an AND condition expression
and(condition1, condition2, ...[]);
and([condition1, condition2, ...[]]);

// Joins conditions into an OR condition expression
or(condition1, condition2, ...[]);
or([condition1, condition2, ...[]]);

// Negates the result of the condition passed in
not(condition);
```

#### Attributes Functions

```typescript
// Check if the attribute exists on the item
attributeExists("tags");
// Check if the attribute does not exist on the item
attributeNotExists("tags");
// Check if the attribute type matches to the provided value
attributeType("tags", AttributeType);

// where
type AttributeType =
  | "binary"
  | "binarySet"
  | "boolean"
  | "list"
  | "map"
  | "null"
  | "number"
  | "numberSet"
  | "string"
  | "stringSet";
```

#### Size Function

Returns a number representing an attribute's size: for strings returns the
length of the string; for binary returns the number of bytes; for sets and lists
returns the number of elements in them.

```typescript
size("name");
```

`size` is used with other comparison functions, without them it does make much sense.

```typescript
// The string value stored in the "name" attribute has more than 20 characters
gt(size("name"), 20);
```

#### Comparison Functions

`eq` is an alias of `equals` and generates an expression like `a = b`

```typescript
eq("name", "John");
equals("age", 40);
```

`gt` is an alias of `greaterThan` and generates an expression like `a > b`

```typescript
gt(size("name"), 10);
greaterThan("age", 40);
```

`gte` is an alias of `greaterThanOrEquals` and generates an expression like `a >= b`

```typescript
gte(size("name"), 10);
greaterThanOrEquals("age", 40);
```

`lt` is an alias of `lessThan` and generates an expression like `a < b`

```typescript
lt(size("name"), 10);
lessThan("age", 40);
```

`lte` is an alias of `lessThanOrEquals` and generates an expression like `a <= b`

```typescript
lte(size("name"), 10);
lessThanOrEquals("age", 40);
```

`ne` is an alias of `notEquals` and generates an expression like `a <> b`

```typescript
ne("name", "John");
notEquals("age", 40);
```

#### Range Check Functions

`between` generates an expression like `a BETWEEN b AND c`

```typescript
between("age", [30, 40]);
```

`isIn` generates and expression like `a IN (b, c, d)`

```typescript
isIn("stage", ["paused", "inactive", "blocked"]);
```

#### String Functions

`beginsWith` returns true if the attribute begins with a specified substring.

```typescript
beginsWith("timezone", "US");
```

`contains` return true if the attribute that is string contains a specified
substring or if the attribute that is a set contains a particular element

```typescript
contains("tags", "a");
contains("name", "ohn");
```

### Key Condition Expression Builders

Key Condition Expressions are a subset of Condition Expressions and support only
the following list of functions:

`beginsWith`, `between`, `eq`, `gt`, `gte`, `lt`, `lte`

### Configuration Options

The library can work in 3 modes `local`, `direct` and `normal` mode.

#### `Normal` mode

This mode is the default for your server code. When deployed to AWS and specifically
to AWS Lambda the necessary configs are inherited automatically.

#### `local` mode

This mode allows connecting to the local instance of the DynamoDB server

#### `direct` mode

This mode allows to directly connect to the AWS DynamoDB service with an IAM profile
or credentials.

## Usage

### Initialization

We suggest initializing the Dynatron class in a separate function where you
could have a logic to check with which mode it should run and probably pass
in the table name. In serverless applications you can pass in env variables and
do the configuration based on them.

```typescript
export const db = (table: string) => {
  let clientConfigs: DynatronDocumentClientParams;

  if (process.env.IS_OFFLINE) {
    clientConfigs = {
      mode: "local",
      port: 8888, // optional - defaults to 8000
      accessKeyId: "localhost", // optional - defaults to "localAwsAccessKeyId"
      secretAccessKey: "localhost", // optional - defaults to "localAwsSecretAccessKey"
    };
  } else if (process.env.IS_DIRECT) {
    // Usually used within node.js code. Cannot be used in the browsers
    clientConfigs = {
      mode: "direct",
      profile: "default",
      region: "us-east-1",
    };

    // or
    // Usually used withing browser code. Can also be used in node.js code.
    clientConfigs = {
      mode: "direct",
      region: "us-east-1",
      accessKeyId: "AKISIWVFZTIYONFVTXTQ",
      secretAccessKey: "LYGqgVXDfOT8EfdSAj189TLfC79lge6HNJnagjNHB",
    };
  }

  // For normal connections the client configuration most of the time should not
  // be defined.

  return new Dynatron({ table, ...(clientConfigs ? { clientConfigs } : {}) });
};
```

`Dynatron` initializer has a second optional parameter called `instanceId` which
defaults to `"default"`. As Dynatron tries to optimize the connection pool to the
database it uses a static map to store DynamoDBClient instances and reuse them.
In most of the cases you don't need to pass in the `instanceId` as most of the
applications will be connecting through the same DynamoDB region and profile.
But in cases when you need to connect to multiple regions via multiple profiles
Dynatron gives you an option to provide an instance identificator and with that
effectively have multiple connections during the initialization process as shown
below.

```typescript
export const db1 = (table: string) => {
  let clientConfigs = {
    mode: "direct",
    profile: "dev",
    region: "us-east-1",
  };

  return new Dynatron(
    { table, ...(clientConfigs ? { clientConfigs } : {}) },
    "dev",
  );
};

export const db2 = (table: string) => {
  let clientConfigs = {
    mode: "direct",
    profile: "staging",
    region: "us-east-2",
  };

  return new Dynatron(
    { table, ...(clientConfigs ? { clientConfigs } : {}) },
    "staging",
  );
};
```

The rest of the examples will assume that you have followed the initialization step.

### Put

#### Full usage of `put`

```typescript
const user = await db("users-table")
  // Pass in the item to store in the DB
  .put({
    id: "613243ec-04db-450b-b654-108231637ca5",
    firstName: "John",
    lastName: "Smith",
    email: "john@smith.com",
    createdAt: Date.now(),
    updatedAt: null,
    pending: true,
    metaList: ["a", null, 1], // An array of mixed values
    tags: setOfValues(["A", "B", "C"]), // A set of unique string values
    age: 40,
  })
  // The put function can overwrite existing entries in the DB entirely.
  // If you want to avoid overwriting existing values you can use a condition
  // like this
  .if(attributeNotExists("id")) // optional
  // Returns the consumed capacity in the raw response
  // Possible options are "INDEXES" | "TOTAL" | "NONE"
  // Defaults to "TOTAL"
  .returnConsumedCapacity() // optional
  // Multiplies the default max latency values for the requests timeout logic
  .relaxLatencies(1) // optional
  // Returns the collection metrics in the raw response
  // Possible options are "SIZE" | "NONE"
  // Defaults to "SIZE"
  .returnItemCollectionMetrics() // optional
  // Defines which values to return
  // Possible options are "ALL_OLD" | "NONE"
  // Defaults to "ALL_OLD"
  .returnValues() // optional
  // Can receive a type as an input and will return the data with that type
  // Can receive a boolean which if set to true returns the raw response instead
  // of the data item only
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$execute(true); // If you pass true to this function it will set the return type to PutItemOutput
```

#### Usual usage of `put`

```typescript
const user = await db("users-table")
  .put({
    id: "613243ec-04db-450b-b654-108231637ca5",
    firstName: "John",
    lastName: "Smith",
    email: "john@smith.com",
    createdAt: Date.now(),
    updatedAt: null,
    pending: true,
    metaList: ["a", null, 1],
    tags: setOfValues(["A", "B", "C"]),
    age: 40,
  })
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$<User>(); // If you don't pass true and don't set the type the function will set the return type to DynamoDB.AttributeMap
```

### Get

#### Full usage of `get`

```typescript
const user = await db("users-table")
  // Pass in the key of the item to read
  .get({ id: "613243ec-04db-450b-b654-108231637ca5" })
  // Properties (Attribute Paths) to get back from the DB
  // There can be multiple select function calls and they will be joined into
  // one expression
  .select("id") // optional
  // The select function can receive multiple arguments and will join them into
  // one expression
  .select("firstName", "lastName") // optional
  // The function can also receive an array of properties and will join them
  // into one expression
  .select(["pending", "age"]) // optional
  // Specifies whether to return a consistent read result
  // Receives a boolean as an argument which defaults to true if not provided
  .consistentRead() // optional
  // Returns the consumed capacity in the raw response
  // Possible options are "INDEXES" | "TOTAL" | "NONE"
  // Defaults to "TOTAL"
  .returnConsumedCapacity() // optional
  // Multiplies the default max latency values for the requests timeout logic
  .relaxLatencies(1) // optional
  // Can receive a type as an input and will return the data with that type
  // Can receive a boolean which if set to true returns the raw response instead
  // of the data item only
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$execute(true); // If you pass true to this function it will set the return type to GetItemOutput
```

#### Usual usage of `get`

```typescript
const user = await db("users-table")
  .get({ id: "613243ec-04db-450b-b654-108231637ca5" })
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$<User>(); // If you don't pass true and don't set the type the function will set the return type to DynamoDB.AttributeMap
```

### Update

#### Full usage of `update`

```typescript
// NOTE: At least one update function must exist on an update request
const user = await db("users-table")
  // Pass in the key of the item to update
  .update({ id: "613243ec-04db-450b-b654-108231637ca5" })
  // Receives a Condition Expression built with functions provided by the library
  .if(/* Condition Expression */) // optional
  // There can be multiple if functions and they will be merged into one "and"
  // statement
  .if(/* Condition Expression */) // optional
  // Merges the object into the DB entry
  // For each property a separate SET expression is serialized
  // As a second optional parameter can receive a boolean whether to apply only
  // if the attribute does not exist and not overwrite a value by accident
  .assign({ age: 35, type: "admin" }, true) // optional

  // VERY IMPORTANT TO REMEMBER THAT WHEN USING THE add FUNCTION IF THE ENTRY
  // WITH THE PROVIDED KEY DOES NOT EXIST IN THE DB IT WILL BE CREATED
  // If a number is provided and the value in the DB is a number their sum will
  // be stored.
  // The add function can only be used on top-level attributes
  .add("age", 2) // optional
  // If an array is provided the attribute will be updated as a set of the array
  // All values in the array should be of the same type without duplicates
  // The add function can only be used on top-level attributes
  .add("hobbies", ["h", "i", "j"]) // optional - either a string array
  .add("hobbies", [0, 1, 6]) // optional - or a numeric array
  // If a set of strings is provided it will be added to the property on the
  // item or if missing a new property will be created
  // The add function can only be used on top-level attributes
  .add("tags", setOfValues(["D", "E"])) // optional

  // With only one parameter the drop function will remove the property from
  // the item
  .drop("firstName") // optional
  // It can also remove items from a list property
  .drop("metaList[1]") // optional
  // If an array is provided it will be considered as a set and deleted from the
  // string set property
  .drop("tags", ["b", "c"]) // optional
  // If an set is provided it will be considered as a set and deleted from the
  // string set property
  .drop("tags", setOfValues("a")) // optional

  // Increment the value of the property by the value provided
  // The function may receive an optional third argument which defines whether
  // to check if the property exists or not. If defaults to true. If the check
  // is explicitly set to false the function will create the property with the
  // value
  .increment("age", 2, true) // optional
  // Decrement the value of the property by the value provided
  // The function may receive an optional third argument which defines whether
  // to check if the property exists or not. If defaults to true. If the check
  // is explicitly set to false the function will create the property with the
  // negative of the value
  .decrement("age", 2, true) // optional

  // Append (add to the end) the value to the property
  .append("metaList", "x") // optional
  // Append (add to the end) the array of values to the property
  .append("metaList", ["x", null, 10]) // optional
  // Prepend (add to the beginning) the value to the property
  .prepend("metaList", "x") // optional
  // Prepend (add to the beginning) the array of values to the property
  .prepend("metaList", ["x", null, 10]) // optional
  // Returns the consumed capacity in the raw response
  // Possible options are "INDEXES" | "TOTAL" | "NONE"
  // Defaults to "TOTAL"
  .returnConsumedCapacity() // optional
  // Multiplies the default max latency values for the requests timeout logic
  .relaxLatencies(1) // optional
  // Returns the collection metrics in the raw response
  // Possible options are "SIZE" | "NONE"
  // Defaults to "SIZE"
  .returnItemCollectionMetrics() // optional
  // Defines which values to return
  // Possible options are "ALL_OLD" | "NONE"
  // Defaults to "ALL_OLD"
  .returnValues() // optional
  // Can receive a type as an input and will return the data with that type
  // Can receive a boolean which if set to true returns the raw response instead
  // of the data item only
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$execute(true); // If you pass true to this function it will set the return type to UpdateItemOutput
```

#### Usual usage of `update`

```typescript
const user = await db("users-table")
  .update({ id: "613243ec-04db-450b-b654-108231637ca5" })
  .assign({ age: 35, type: "admin" })
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$<User>(); // If you don't pass true and don't set the type the function will set the return type to DynamoDB.AttributeMap
```

### Delete

#### Full usage of `delete`

```typescript
await db("users-table")
  // Pass in the key of the item to delete
  .delete({ id: "613243ec-04db-450b-b654-108231637ca5" })
  // Receives a Condition Expression built with functions provided by the library
  .if(/* Condition Expression */) // optional
  // There can be multiple if functions and they will be merged into one "and"
  // statement
  .if(/* Condition Expression */) // optional
  // Returns the consumed capacity in the raw response
  // Possible options are "INDEXES" | "TOTAL" | "NONE"
  // Defaults to "TOTAL"
  .returnConsumedCapacity() // optional
  // Multiplies the default max latency values for the requests timeout logic
  .relaxLatencies(1) // optional
  // Returns the collection metrics in the raw response
  // Possible options are "SIZE" | "NONE"
  // Defaults to "SIZE"
  .returnItemCollectionMetrics() // optional
  // Defines which values to return
  // Possible options are "ALL_OLD" | "NONE"
  // Defaults to "ALL_OLD"
  .returnValues() // optional
  // Can receive a boolean which if set to true returns the raw response instead
  // of the data item only
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$execute(true); // If you pass true to this function it will set the return type to DeleteItemOutput
```

#### Usual usage of `delete`

```typescript
await db("users-table")
  .delete({ id: "613243ec-04db-450b-b654-108231637ca5" })
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$(); // If you don't pass true and don't set the type the function will set the return type to DynamoDB.AttributeMap
```

### Query

#### Full usage of `query`

```typescript
const users = await db("users-table")
  // Pass in the partition key property name and the value
  .query("id", "613243ec-04db-450b-b654-108231637ca5")
  // or Alternatively pass in the partition key (this method may be deprecated)
  .query({ id: "613243ec-04db-450b-b654-108231637ca5" })
  // Receives a Condition Expression built with functions provided by the library
  // This is applied to the sort key for
  .having(/* Key Condition Expression */) // optional
  // The index name which should be scanned
  .indexName("names-index") // optional
  // Limit the count of the items returned by the request
  .limit(20) // optional
  // Provide the start key
  .start({ id: "502132ec-04db-450b-b654-108231637ca5" }) // optional
  // Set the sorting direction for the sort key
  // The default value is "ASC" (ascending)
  .sort("DSC") // optional
  // Receives a Condition Expression built with functions provided by the library
  .where(/* Condition Expression */) // optional
  // There can be multiple where functions and they will be merged into one "and"
  // statement
  .where(/* Condition Expression */) // optional
  // Properties (Attribute Paths) to get back from the DB
  // There can be multiple select function calls and they will be joined into
  // one expression
  .select("id") // optional
  // The select function can receive multiple arguments and will join them into
  // one expression
  .select("firstName", "lastName") // optional
  // The function can also receive an array of properties and will join them
  // into one expression
  .select(["pending", "age"]) // optional
  // Specifies whether to return a consistent read result
  // Receives a boolean as an argument which defaults to true if not provided
  .consistentRead() // optional
  // Returns the consumed capacity in the raw response
  // Possible options are "INDEXES" | "TOTAL" | "NONE"
  // Defaults to "TOTAL"
  .returnConsumedCapacity() // optional
  // Multiplies the default max latency values for the requests timeout logic
  .relaxLatencies(1) // optional
  // Can receive a type as an input and will return the data with that type
  // Can receive a boolean for the first property which if set to true returns the raw response instead of the data item only
  // Can receive a boolean for the second property which if set to true disables recursion and returns the last evaluated key
  // You cannot pass in true to the first param and set the type at the same time. The typescript will complain about the parameter type.
  .$execute(true, true); // If you pass true to the first param to this function it will set the return type to QueryOutput
```

#### Usual usage of `query`

```typescript
const users = await db("users-table")
  .query("id", "613243ec-04db-450b-b654-108231637ca5")
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  // Pay attention to the fact that your type must state that it is an array
  .$<User[]>(); // If you don't pass true and don't set the type the function will set the return type to DynamoDB.ItemList
```

### Scan

#### Full usage of `scan`

```typescript
const users = await db("users-table")
  .scan()
  // The index name which should be scanned
  .indexName("names-index") // optional
  // Limit the count of the items returned by the request
  .limit(20) // optional
  // Provide the start key
  .start({ id: "502132ec-04db-450b-b654-108231637ca5" }) // optional
  // Set the number of segments to use while scanning the table
  // Should be a positive integer, the default number of segments is 100
  .totalSegments(50) // optional
  // Set the segment to get
  // Should be a positive integer up to the total number of segments provided
  .segment(0) // optional
  // Disables segments and forces to scan the table with one segment
  // For smaller tables this can be more beneficial than scanning with segments
  .disableSegments() // optional
  // Receives a Condition Expression built with functions provided by the library
  .where(/* Condition Expression */) // optional
  // There can be multiple where functions and they will be merged into one "and"
  // statement
  .where(/* Condition Expression */) // optional
  // Properties (Attribute Paths) to get back from the DB
  // There can be multiple select function calls and they will be joined into
  // one expression
  .select("id") // optional
  // The select function can receive multiple arguments and will join them into
  // one expression
  .select("firstName", "lastName") // optional
  // The function can also receive an array of properties and will join them
  // into one expression
  .select(["pending", "age"]) // optional
  // Specifies whether to return a consistent read result
  // Receives a boolean as an argument which defaults to true if not provided
  .consistentRead() // optional
  // Returns the consumed capacity in the raw response
  // Possible options are "INDEXES" | "TOTAL" | "NONE"
  // Defaults to "TOTAL"
  .returnConsumedCapacity() // optional
  // Multiplies the default max latency values for the requests timeout logic
  .relaxLatencies(1) // optional
  // Can receive a type as an input and will return the data with that type
  // Can receive a boolean for the first property which if set to true returns the raw response instead of the data item only
  // Can receive a boolean for the second property which if set to true disables recursion and returns the last evaluated key
  // You cannot pass in true to the first param and set the type at the same time. The typescript will complain about the parameter type.
  .$execute(true, true); // If you pass true to this function it will set the return type to ScanOutput
```

#### Usual usage of `scan`

```typescript
const users = await db("users-table")
  .scan()
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  // Pay attention to the fact that your type must state that it is an array
  .$<User[]>(); // If you don't pass true and don't set the type the function will set the return type to DynamoDB.ItemList
```

## Batch Operations

> NOTE: THE BATCH OPERATIONS DO NOT GUARANTEE THE ORDER OF EXECUTED AND RETURNED
> OPERATIONS. A `batchGet` CAN AND WILL MOST PROBABLY RETURN AN ARRAY WHERE THE
> POSITIONS OF THE ITEMS DO NOT MATCH WITH THE POSITIONS IN THE INPUT ARRAY.
> THIS IS NOT A LIMITATION OF THIS LIBRARY. THIS IS HOW AWS DYNAMODB WORKS.

### BatchPut

#### Full usage of `batchPut`

```typescript
const users = await db("users-table")
  // Pass in the array of items to store in the DB
  .batchPut([
    {
      id: "613243ec-04db-450b-b654-108231637ca5",
      firstName: "John",
      lastName: "Smith",
      email: "john@smith.com",
      createdAt: Date.now(),
      updatedAt: null,
      pending: true,
      metaList: ["a", null, 1], // An array of mixed values
      tags: setOfValues(["A", "B", "C"]), // A set of unique string values
      age: 40,
    },
    {
      id: "502132ec-04db-450b-b654-108231637ca5",
      firstName: "John",
      lastName: "Smith",
      email: "jane@smith.com",
      createdAt: Date.now(),
      updatedAt: null,
      pending: true,
      metaList: ["b", null, 2], // An array of mixed values
      tags: setOfValues(["D", "E", "F"]), // A set of unique string values
      age: 35,
    },
  ])
  // Returns the consumed capacity in the raw response
  // Possible options are "INDEXES" | "TOTAL" | "NONE"
  // Defaults to "TOTAL"
  .returnConsumedCapacity() // optional
  // Multiplies the default max latency values for the requests timeout logic
  .relaxLatencies(1) // optional
  // Returns the collection metrics in the raw response
  // Possible options are "SIZE" | "NONE"
  // Defaults to "SIZE"
  .returnItemCollectionMetrics() // optional
  // Can receive a type as an input and will return the data with that type
  // Can receive a boolean which if set to true returns the raw response instead
  // of the data item only
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$execute(true); // If you pass true to this function it will set the return type to BatchWriteItemOutput
```

#### Usual usage of `batchPut`

```typescript
const users = await db("users-table")
  .batchPut([
    {
      id: "613243ec-04db-450b-b654-108231637ca5",
      firstName: "John",
      lastName: "Smith",
      email: "john@smith.com",
      createdAt: Date.now(),
      updatedAt: null,
      pending: true,
      metaList: ["a", null, 1], // An array of mixed values
      tags: setOfValues(["A", "B", "C"]), // A set of unique string values
      age: 40,
    },
    {
      id: "502132ec-04db-450b-b654-108231637ca5",
      firstName: "John",
      lastName: "Smith",
      email: "jane@smith.com",
      createdAt: Date.now(),
      updatedAt: null,
      pending: true,
      metaList: ["b", null, 2], // An array of mixed values
      tags: setOfValues(["D", "E", "F"]), // A set of unique string values
      age: 35,
    },
  ])
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  // Pay attention to the fact that your type must state that it is an array
  .$<User[]>(); // If you don't pass true and don't set the type the function will set the return type to DynamoDB.ItemList
```

### BatchGet

#### Full usage of `batchGet`

```typescript
const users = await db("users-table")
  // Pass in the array of key to read
  .batchGet([
    { id: "613243ec-04db-450b-b654-108231637ca5" },
    { id: "502132ec-04db-450b-b654-108231637ca5" },
  ])
  // Properties (Attribute Paths) to get back from the DB
  // There can be multiple select function calls and they will be joined into
  // one expression
  .select("id") // optional
  // The select function can receive multiple arguments and will join them into
  // one expression
  .select("firstName", "lastName") // optional
  // The function can also receive an array of properties and will join them
  // into one expression
  .select(["pending", "age"]) // optional
  // Specifies whether to return a consistent read result
  // Receives a boolean as an argument which defaults to true if not provided
  .consistentRead() // optional
  // Returns the consumed capacity in the raw response
  // Possible options are "INDEXES" | "TOTAL" | "NONE"
  // Defaults to "TOTAL"
  .returnConsumedCapacity() // optional
  // Multiplies the default max latency values for the requests timeout logic
  .relaxLatencies(1) // optional
  // Can receive a type as an input and will return the data with that type
  // Can receive a boolean which if set to true returns the raw response instead
  // of the data item only
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$execute(true); // If you pass true to this function it will set the return type to BatchGetItemOutput
```

#### Usual usage of `batchGet`

```typescript
const users = await db("users-table")
  .batchGet([
    { id: "613243ec-04db-450b-b654-108231637ca5" },
    { id: "502132ec-04db-450b-b654-108231637ca5" },
  ])
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  // Pay attention to the fact that your type must state that it is an array
  .$<User[]>(); // If you don't pass true and don't set the type the function will set the return type to DynamoDB.ItemList
```

### BatchDelete

#### Full usage of `batchDelete`

```typescript
await db("users-table")
  // Pass in the array of key to delete
  .batchDelete([
    { id: "613243ec-04db-450b-b654-108231637ca5" },
    { id: "502132ec-04db-450b-b654-108231637ca5" },
  ])
  // Returns the consumed capacity in the raw response
  // Possible options are "INDEXES" | "TOTAL" | "NONE"
  // Defaults to "TOTAL"
  .returnConsumedCapacity() // optional
  // Multiplies the default max latency values for the requests timeout logic
  .relaxLatencies(1) // optional
  // Returns the collection metrics in the raw response
  // Possible options are "SIZE" | "NONE"
  // Defaults to "SIZE"
  .returnItemCollectionMetrics() // optional
  // Can receive a boolean which if set to true returns the raw response instead
  // of the data item only
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$execute(true); // If you pass true to this function it will set the return type to BatchWriteItemOutput
```

#### Usual usage of `batchDelete`

```typescript
await db("users-table")
  .batchDelete([
    { id: "613243ec-04db-450b-b654-108231637ca5" },
    { id: "502132ec-04db-450b-b654-108231637ca5" },
  ])
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  // Pay attention to the fact that your type must state that it is an array
  .$<User[]>(); // If you don't pass true and don't set the type the function will set the return type to DynamoDB.ItemList
```

## Transactional Operations

There are two transactional functions `transactGet` and `transactWrite`. These
functions are a special type of function which receive other classes from
Dynatron.

### `Checker` class

The `Checker` is a special non-executable class (doesn't have the `$execute` and
the `$` functions) and can only used as an item in the input array for the
`transactWrite` function.

### TransactWrite

The `transactWrite` function receives an array of non-executed instances of the
`Checker`, `Deleter`, `Putter` and/or `Updater` classes.

#### Full usage of `transactWrite`

```typescript
const result = await db("") // The table name passed in here is not important and can be an empty string
  .transactWrite([
    db("users-table")
      .check({ id: "A" })
      .if(gt("age", 0))
      .returnConsumedCapacity()
      .returnItemCollectionMetrics()
      .returnValues(),
    db("users-table")
      .delete({ id: "C" })
      .returnConsumedCapacity()
      .returnItemCollectionMetrics()
      .returnValues(),
    db("users-table")
      .put({ id: "D" })
      .returnConsumedCapacity()
      .returnItemCollectionMetrics()
      .returnValues(),
    db("users-table")
      .update({ id: "B" })
      .add("age", 2)
      .increment("age", 1)
      .prepend("tags", 1)
      .drop("timezone")
      .decrement("counter", 1)
      .assign({ name: "Bob" })
      .append("links", "local")
      .returnConsumedCapacity()
      .returnItemCollectionMetrics()
      .returnValues(),
  ])
  .returnConsumedCapacity()
  .$execute(); // This function will set the return type to TransactWriteItemsOutput
```

#### Usual usage of `transactWrite`

```typescript
const result = await db("") // The table name passed in here is not important and can be an empty string
  .transactWrite([
    db("users-table").check({ id: "A" }).if(gt("age", 0)),
    db("users-table").delete({ id: "C" }),
    db("users-table").put({ id: "D" }),
    db("users-table").update({ id: "B" }).assign({ name: "Bob" }),
  ])
  .$(); // This function will set the return type to TransactWriteItemsOutput
```

### TransactGet

The `transactGet` function receives an array of non-executed instances of the
`Getter` class.

#### Full usage of `transactGet`

```typescript
const result = await db("") // The table name passed in here is not important and can be an empty string
  .transactGet([
    db("users-table")
      .get({ id: "613243ec-04db-450b-b654-108231637ca5" })
      .select("age")
      .consistentRead()
      .returnConsumedCapacity(),
    db("users-table")
      .get({ id: "502132ec-04db-450b-b654-108231637ca5" })
      .select("tags")
      .consistentRead()
      .returnConsumedCapacity(),
    db("games-table")
      .get({ id: "491021ec-04db-450b-b654-108231637ca5" })
      .select("players")
      .consistentRead()
      .returnConsumedCapacity(),
  ])
  .returnConsumedCapacity()
  // Can receive a boolean which if set to true returns the raw response instead
  // of the data item only
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  .$execute(true); // If you pass true to this function it will set the return type to TransactGetItemsOutput
```

#### Usual usage of `transactGet`

```typescript
const result = await db("") // The table name passed in here is not important and can be an empty string
  .transactGet([
    db("users-table").get({ id: "613243ec-04db-450b-b654-108231637ca5" }),
    db("users-table").get({ id: "502132ec-04db-450b-b654-108231637ca5" }),
    db("games-table").get({ id: "491021ec-04db-450b-b654-108231637ca5" }),
  ])
  // You cannot pass in true and set the type at the same time. The typescript will complain about the parameter type.
  // Pay attention to the fact that your type must state that it is an array
  .$<[User, User, Game]>(); // If you don't pass true and don't set the type the function will set the return type to DynamoDB.ItemList
```

## ADVANCED USAGE

### Getting the count of items in the table

For the rarest cases when you want to get the count of the element in the table
the most optimal approach is using a `scan` function and selecting a
non-existing property like `_` or similar to return empty values for the items.
That will allow the database to return far more many items in one call round in
under the 1 MB limit of the request.

### Pagination

Pagination is quite easy using the `limit` function on the `scan` and `query`
requests. If you don't pass the `exclusiveStartKey` property to the `limit`
function, the request will return the "1st page" of the request. All the
subsequent requests can receive the last element's key from the previous page.
The database will return another array of items right after the
`exclusiveStartKey`.

### Versioning

Many applications need to maintain a history of item-level revisions for audit
or compliance purposes and to be able to retrieve the most recent version
easily. There is an effective design pattern that accomplishes this using sort
keys:

- For each new item, create two copies of the item: One copy should have a
  version-number of zero (such as v0) in the sort key, and should have a
  version-number of one (such as v1).
- Every time the item is updated, use the next higher version in the sort key of
  the updated version, and copy the updated contents into the item with version
  zero. This means that the latest version of any item can be located easily using
  the zero version.

For example the user profile edits can be updated using this pattern.

Let's assume the user profile is stored in a single table pattern with `pk`
partition key and `sk` sort key as the primary key as such.

```typescript
interface TableEntry {
  pk: string;
  sk: string;
}

interface User {
  name: string;
}

interface VersionControlled {
  version: number;
  author: string;
}
```

Getting the user's latest version of the profile is as simple as doing the following

```typescript
const userProfile = await db("users-table")
  .get({
    pk: "USER#de91c1fd-3d32-4d85-b4f3-2d78fa4940c0",
    sk: "PROFILE#v0",
  })
  .$<User & VersionControlled & TableEntry>();
```

Getting the full history of all the changes is also very simple as shown below

```typescript
const userProfileHistory = await db("users-table")
  .query("pk", "USER#de91c1fd-3d32-4d85-b4f3-2d78fa4940c0")
  .having(beginsWith("sk", "PROFILE#v"))
  .where(ne("sk", "PROFILE#v0")) // Here we are filtering out the v0 as it is a special case and not a part of the history
  .$<(User & VersionControlled & TableEntry)[]>();
```

Now how do you update the version or add a new one. This is a multi step process
involving reading the latest version and writing new items with transactions.

The most complete approach would be the following:

```typescript
const newProfile: User = {
  name: "John",
};

const userProfile = await db(SINGLE_TABLE)
  .get({ pk, sk: `${skPrefix}${HASHTAG}v0` })
  // On the next line we are only getting the "version" and the attributes we
  // want to update
  .select(["version", ...Object.keys(newProfile)])
  .$<User & VersionControlled & TableEntry>();
```

In the code above we are getting the attributes that we are trying to update to
compare with the new item and update if there are actual changes

```typescript
let doUpdate = true;
if (userProfile != null) {
  const { version, ...pureProfile } = userProfile;

  if (deepEqual(pureProfile, newProfile)) {
    // The new item matches with the data in the DB so no update is necessary
    doUpdate = false;
  }
}

if (doUpdate) {
  const version = userProfile?.version || 0;

  // This is some sort of a reference to an entity in the system, like an admin
  const author = "ADMIN#b9539195-845f-48b4-9ad0-da8c83a6256e";

  await db("")
    .transactWrite([
      db(SINGLE_TABLE)
        .put({
          ...newProfile,

          pk,
          sk: `${skPrefix}${HASHTAG}v0`,

          version: version + 1,
          author,
        })
        // These checks make sure you always work with the latest version and don't overwrite an existing one
        .if(or(attributeNotExists("sk"), eq("version", version))),
      db(SINGLE_TABLE)
        .put({
          ...newProfile,

          pk,
          sk: `${skPrefix}${HASHTAG}v${version + 1}`,

          version: version + 1,
          author,
        })
        // These checks make sure you always work with the latest version and don't overwrite an existing one
        .if(or(attributeNotExists("sk"), eq("version", version))),
    ])
    .$();
}
```
