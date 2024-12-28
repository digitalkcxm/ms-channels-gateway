build:
	- docker build -f ./Dockerfile-prod -t ms-channels-gateway-container:latest .
start:
	- docker run --name ms-channels-gateway-container -p 5025:80 -d ms-channels-gateway-container:latest
exec:
	- docker exec -it ms-channels-gateway-container /bin/sh
logs:
	- docker logs -f --tail 50 --timestamps ms-channels-gateway-container
run-aws:
	- docker run -d --env-file .env -p 8080:80 --name ms-channels-gateway 096033599605.dkr.ecr.us-east-1.amazonaws.com/ms-channels-gateway:d159f230