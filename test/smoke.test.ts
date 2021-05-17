// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { VersionManager } from "../src/versions/version-manager"

test("check check, ba-boom!", () => {
  expect([1, 3, 5].includes(3)).toBe(true)
})

test("VersionManager", () => {
  expect(VersionManager.VERSION).toBe(6)
})
