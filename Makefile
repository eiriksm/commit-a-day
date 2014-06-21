test:
	./node_modules/mocha/bin/mocha -R spec

test-cov:
	./node_modules/istanbul/lib/cli.js cover -- ./node_modules/mocha/bin/_mocha -R spec

.PHONY: test test-cov
