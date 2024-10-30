build:
	docker build -t ms-channels-gateway .
run:
	docker run -d --env-file .env -p 8080:5060 --name ms-channels-gateway ms-channels-gateway
run-aws:
	docker run -d --env-file .env -p 8080:80 --name ms-channels-gateway 096033599605.dkr.ecr.us-east-1.amazonaws.com/ms-channels-gateway:d159f230