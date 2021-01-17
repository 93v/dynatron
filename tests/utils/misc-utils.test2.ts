// import { marshall } from "@aws-sdk/util-dynamodb";
// import { TAKING_TOO_LONG_EXCEPTION } from "../../src/utils/constants";
// import {
//   assertNever,
//   isRetryableError,
//   serializeExpressionValue,
//   //   validateKey,
// } from "../../src/utils/misc-utils";

// describe("Misc utils serialization", () => {
//   test("should serialize expression value", () => {
//     const value = marshall({ key: "hello" });
//     const serializedExpressionValue = serializeExpressionValue(value.key);
//     expect(serializedExpressionValue.value).toEqual(value.key);
//     expect(serializedExpressionValue.name).toHaveLength(2);
//   });
// });

// // describe("Misc utils validation", () => {
// //   test("should fail validation if key is an empty object", () => {
// //     expect(() => {
// //       validateKey({
// //         key: marshall({}),
// //       });
// //     }).toThrowError("At least 1 property must be present in the key");
// //   });

// //   test("should fail validation with 2 keys if single", () => {
// //     expect(() => {
// //       validateKey({
// //         key: marshall({
// //           id: 1,
// //           name: "hello",
// //         }),
// //         singlePropertyKey: true,
// //       });
// //     }).toThrowError("At most 1 property must be present in the key");
// //   });

// //   test("should fail validation with 3 keys", () => {
// //     expect(() => {
// //       validateKey({
// //         key: marshall({
// //           id: 1,
// //           name: "hello",
// //           age: 30,
// //         }),
// //       });
// //     }).toThrowError("At most 2 properties must be present in the key");
// //   });

// //   test("should pass the validation with 1 key", () => {
// //     expect(() => {
// //       validateKey({
// //         key: marshall({
// //           id: 1,
// //         }),
// //       });
// //     }).not.toThrow();
// //   });

// //   test("should pass the validation with 2 keys", () => {
// //     expect(() => {
// //       validateKey({
// //         key: marshall({
// //           id: 1,
// //           name: "hello",
// //         }),
// //       });
// //     }).not.toThrow();
// //   });
// // });

// describe("Misc utils assertion", () => {
//   test("should always fail", () => {
//     expect(() => assertNever("incorrect" as never)).toThrow(
//       `Unexpected value: "incorrect"`,
//     );
//   });

//   test("should always fail", () => {
//     expect(() => assertNever(3 as never)).toThrow(`Unexpected value: 3`);
//   });
// });

// describe("Misc utils retryable errors type", () => {
//   const customError = new Error("Custom error") as any;
//   customError.retryable = true;

//   const customError2 = new Error("Provision error") as any;
//   customError2.code = "ProvisionedThroughputExceededException";

//   const customError3 = new Error("Throttling exception") as any;
//   customError3.code = "ThrottlingException";

//   const errors: [string, Error][] = [
//     [TAKING_TOO_LONG_EXCEPTION, new Error(TAKING_TOO_LONG_EXCEPTION)],
//     ["retryable", customError],
//     ["ECONN", new Error("ECONN")],
//     ["NetworkingError", new Error("NetworkingError")],
//     ["InternalServerError", new Error("InternalServerError")],
//     ["ProvisionedThroughputExceededException", customError2],
//     ["ThrottlingException", customError3],
//   ];
//   test.each(errors)("given %1 returns true", (_, error) => {
//     expect(isRetryableError(error)).toBe(true);
//   });
// });
