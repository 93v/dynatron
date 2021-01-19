// import { parseAttributePath } from "../../src/utils/attribute-path-parser";

// describe("Attribute Path Parser", () => {
//   test("empty string", () => {
//     expect(parseAttributePath("")).toEqual([]);
//   });

//   test("id", () => {
//     expect(parseAttributePath("id")).toEqual([
//       { name: "id", type: "AttributeName" },
//     ]);
//   });

//   test("value[0]", () => {
//     expect(parseAttributePath("value[0]")).toEqual([
//       { name: "value", type: "AttributeName" },
//       { index: 0, type: "ListIndex" },
//     ]);
//   });

//   test("value[name]", () => {
//     expect(() => {
//       parseAttributePath("value[name]");
//     }).toThrow();
//   });

//   test("value[[0]", () => {
//     expect(() => {
//       parseAttributePath("value[[0]");
//     }).toThrow();
//   });

//   test("value.length", () => {
//     expect(parseAttributePath("value.length")).toEqual([
//       { name: "value", type: "AttributeName" },
//       { name: "length", type: "AttributeName" },
//     ]);
//   });

//   test("value\\.length", () => {
//     expect(parseAttributePath("value\\.length")).toEqual([
//       { name: "value.length", type: "AttributeName" },
//     ]);
//   });
// });
