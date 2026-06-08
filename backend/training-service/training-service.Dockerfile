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

RUN mvn dependency:go-offline -pl training-service -am -q

COPY . .

RUN mvn clean package -pl training-service -am -DskipTests

# Copier uniquement le jar exécutable Spring Boot
RUN mkdir -p /app/output && \
    find /app/training-service/target -name "*.jar" ! -name "original-*.jar" -exec cp {} /app/output/app.jar \;

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/output/app.jar app.jar

EXPOSE 8087

USER appuser

ENTRYPOINT ["java", "-jar", "app.jar"]