var randomTestCount = 100;

QUnit.test('ELUS.Rule test', function(assert) {
    var rule1 = new ELUS.Rule('-?c=');
    assert.ok(rule1.condition == '-');
    assert.ok(rule1.trueTemplate == 'c=');
    assert.notOk(rule1.falseTemplate);
    assert.ok(rule1.toString() == 'Always choose figure with same color');

    var rule2 = new ELUS.Rule('-?c!');
    assert.ok(rule2.toString() == 'Always choose figure with different color');
    
    var rule3 = new ELUS.Rule('sB?hC:cY');
    assert.ok(rule3.condition == 'sB');
    assert.ok(rule3.trueTemplate == 'hC');
    assert.ok(rule3.falseTemplate == 'cY');
    assert.ok(rule3.toString() == 'If the last figure is Big, then choose figure with Circle shape, otherwise choose figure with Yellow color');
});

QUnit.test('ELUS.getRandomElement() test', function(assert) {
    assert.ok(function() {
        var pool = [1, 2, 3, 4, 5];
        for (var i = 0; i < randomTestCount; i++) {
            if (pool.indexOf(ELUS.getRandomElement(pool) < 0)) return false;
        }
        return true;
    });
});

QUnit.test('ELUS.getNRandomElements() test', function(assert) {
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
