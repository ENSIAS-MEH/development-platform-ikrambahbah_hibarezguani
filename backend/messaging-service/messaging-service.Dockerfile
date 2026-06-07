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

RUN mvn dependency:go-offline -pl messaging-service -am -q

COPY . .

RUN mvn clean package -pl messaging-service -am -DskipTests

RUN mkdir -p /app/output && \
    cp $(find /app/messaging-service/target -name "*.jar" ! -name "original-*.jar" | head -n 1) /app/output/app.jar

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads

COPY --from=build /app/output/app.jar app.jar

EXPOSE 8086

USER appuser

ENTRYPOINT ["java", "-jar", "app.jar"]
