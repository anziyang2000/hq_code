FROM nginx:stable-alpine 
ARG PROJECT_NAME=$CI_PROJECT_NAME
##declare variable in dockerfile
ENV PROJECT_NAME=$PROJECT_NAME
RUN  mkdir -p /app/
ADD  $PROJECT_NAME.tar.gz /app/
RUN  mv /app/dist/*  /usr/share/nginx/html/
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80
