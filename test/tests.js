var randomTestCount = 100;

QUnit.test("ruleToString() test", function(assert) {
    assert.ok(ELUS.ruleToString("-?c=") == "Always choose figure with same color");
    assert.ok(ELUS.ruleToString("-?c!") == "Always choose figure with different color");
});

QUnit.test("getRandomElement() test", function(assert) {
    assert.ok(function() {
        var pool = [1, 2, 3, 4, 5];
        for (var i = 0; i < randomTestCount; i++) {
            if (pool.indexOf(ELUS.getRandomElement(pool) < 0)) return false;
        }
        return true;
    });
});

QUnit.test("getNRandomElements() test", function(assert) {
    assert.ok(function() {
        var pool = [1, 2, 3, 4, 5];
        for (var i = 0; i < randomTestCount; i++) {
            var elements = ELUS.getNRandomElements(pool, 3);
            if (elements.every(function(element, index, array) {
                return pool.indexOf(element) >= 0;
            }) == false) return false;
        }
        return true;
    });
});

// TODO: rulePartToString
// TODO: generateAllFigures
// TODO: getNextFigureTemplate
// TODO: getMatchingFigures
// TODO: getNonMatchingFigures
// TODO: indexOfFigure
// TODO: getNextChoicesShuffled
// TODO: isMatching
