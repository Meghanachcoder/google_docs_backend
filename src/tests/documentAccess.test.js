const assert = require("node:assert/strict");
const test = require("node:test");
const { canEditDocument } = require("../utils/documentAccess");

test("document owner can edit a document", () => {
  const document = {
    owner: "owner-user",
    sharedWith: [],
  };

  assert.equal(canEditDocument(document, "owner-user"), true);
});

test("shared user can edit a document", () => {
  const document = {
    owner: "owner-user",
    sharedWith: ["shared-user"],
  };

  assert.equal(canEditDocument(document, "shared-user"), true);
});

test("unshared user cannot edit a document", () => {
  const document = {
    owner: "owner-user",
    sharedWith: ["shared-user"],
  };

  assert.equal(canEditDocument(document, "other-user"), false);
});
