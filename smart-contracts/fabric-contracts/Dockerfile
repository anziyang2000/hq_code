FROM  golang:1.17
ARG PROJECT_NAME
RUN mkdir /app/
WORKDIR /app/
RUN echo $PROJECT_NAME
ADD  $PROJECT_NAME config.yaml /app/

##CMD ["./$PROJECT_NAME"]  不知道为什么这行无法引用变量$PROJECT_NAME
CMD ["./contracts"]
EXPOSE 8080
