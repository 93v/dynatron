import { Requester } from "../src/requesters/0-requester";
import { Reader } from "../src/requesters/1-reader";
import { BUILD } from "../src/utils/constants";

describe("Reader", () => {
  test("should be an instance of Requester", () => {
    const instance = new Reader();
    expect(instance).toBeInstanceOf(Requester);
  });

  test("should be an instance of Reader", () => {
    const instance = new Reader();
    expect(instance).toBeInstanceOf(Reader);
  });

  test("method call should return itself", () => {
    const instance = new Reader();
    expect(instance.consistentRead()).toBe(instance);
    expect(instance.select("")).toBe(instance);
  });

  test("should build with ConsistentRead", () => {
    const instance = new Reader();
    instance.consistentRead();

    expect(instance[BUILD]()).toMatchObject({
      ConsistentRead: true,
    });

    instance.consistentRead(true);

    expect(instance[BUILD]()).toMatchObject({
      ConsistentRead: true,
    });
  });

  test("should build without ConsistentRead", () => {
    const instance = new Reader();
    instance.consistentRead(false);

    expect(instance[BUILD]()).toMatchObject({});
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Reader();
    instance.select();

    expect(instance[BUILD]()).toMatchObject({});
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Reader();
    instance.select("id");

    expect(instance[BUILD]()).toMatchObject({ _ProjectionExpressions: ["id"] });
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Reader();
    instance.select("id");
    instance.select("name");

    expect(instance[BUILD]()).toMatchObject({
      _ProjectionExpressions: ["id", "name"],
    });
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Reader();
    instance.select(["id", "name"]);

    expect(instance[BUILD]()).toMatchObject({
      _ProjectionExpressions: ["id", "name"],
    });
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Reader();
    // eslint-disable-next-line unicorn/no-null
    instance.select("id", "name", undefined, null, "age");

    expect(instance[BUILD]()).toMatchObject({
      _ProjectionExpressions: ["id", "name", "age"],
    });
  });
});
