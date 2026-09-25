setup: install link

install:
	npm ci

link:
	npm link

lint:
	npx eslint .

.PHONY: setup install link lint
