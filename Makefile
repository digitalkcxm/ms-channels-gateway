build:
	- docker build -f ./Dockerfile-prod -t ms-workflow-container:latest .
run:
	- docker run -d -p 8080:5060 --name ms-channels-gateway ms-channels-gateway
run-aws:
	- docker run -d --env-file .env -p 8080:80 --name ms-channels-gateway 096033599605.dkr.ecr.us-east-1.amazonaws.com/ms-channels-gateway:d159f230
start:
	- docker run -p 8080:5060 --name ms-workflow-container -d ms-workflow-container:latest
exec:
	- docker exec -it ms-workflow-container /bin/sh
logs:
	- docker logs -f --tail 50 --timestamps ms-workflow-container%