FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml ./pom.xml

COPY auth-service/pom.xml ./auth-service/pom.xml
COPY project-service/pom.xml ./project-service/pom.xml
COPY profile-service/pom.xml ./profile-service/pom.xml
COPY messaging-service/pom.xml ./messaging-service/pom.xml
COPY training-service/pom.xml ./training-service/pom.xml
COPY discovery-service/pom.xml ./discovery-service/pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml

RUN mvn dependency:go-offline -pl discovery-service -am -q

COPY . .

RUN mvn clean package -pl discovery-service -am -DskipTests


FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/discovery-service/target/*.jar app.jar

EXPOSE 8761

USER appuser

ENTRYPOINT ["java", "-jar", "app.jar"]