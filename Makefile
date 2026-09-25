install:
	npm ci

link:
	npm link

lint:
	npx eslint .

.PHONY: install link lint
