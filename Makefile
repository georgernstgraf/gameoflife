all: css/bootstrap.css

css/bootstrap.css: node_modules/bootstrap/dist/css/bootstrap.min.css
	npx sass --no-source-map scss:css