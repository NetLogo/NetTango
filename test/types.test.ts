// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { rangeAttributeInputSchema } from "../src/types/types-5"

test("Version3 - range param with string default", () => {
  const result = rangeAttributeInputSchema.parse({
    name: "steps",
    unit: "",
    type: "range",
    default: "1",
    min: 0,
    max: 3,
    step: 0.1,
    id: 0,
    def: "1"
  })

  const expected = {
    name: "steps",
    unit: "",
    type: "range",
    default: 1,
    min: 0,
    max: 3,
    random: false,
    step: 0.1,
    id: 0,
    def: "1"
  }

  expect(result).toStrictEqual(expected)
})
