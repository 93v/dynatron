// import { Condition } from "../../types/conditions";

// export const isConditionEmptyDeep = (
//   conditions: (Condition | Condition[] | undefined | null)[],
// ): boolean => {
//   return conditions.every((condition) => {
//     if (condition == undefined) {
//       return true;
//     }

//     if (Array.isArray(condition)) {
//       return isConditionEmptyDeep(condition);
//     }

//     if (condition.kind === "OR" || condition.kind === "AND") {
//       return isConditionEmptyDeep(condition.conditions);
//     }

//     return false;
//   });
// };
