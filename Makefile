build:
	docker build -t ms-channels-gateway .
run:
	docker run -d -p 8080:5060 --name ms-channels-gateway ms-channels-gateway 