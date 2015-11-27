QUnit.test("ruleToString() test", function(assert) {
  assert.ok(ELUS.ruleToString("-?c=") == "Always choose same color");
  assert.ok(ELUS.ruleToString("-?c!") == "Always choose differ1ent color");
});
