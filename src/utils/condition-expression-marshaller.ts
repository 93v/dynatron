import { Condition } from "../../types/conditions";
import {
  and,
  serializeConditionExpression,
} from "./condition-expression-utils";

export const marshallConditionExpression = (
  conditions: Condition[],
  prefix = "",
) => serializeConditionExpression(and(conditions), prefix);
