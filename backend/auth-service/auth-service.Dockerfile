# =========================
# Étape 1 : Build avec Maven
# =========================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copier le pom parent
COPY pom.xml ./pom.xml

# Copier les pom.xml de tous les modules déclarés dans le pom parent
COPY auth-service/pom.xml ./auth-service/pom.xml
COPY project-service/pom.xml ./project-service/pom.xml
COPY profile-service/pom.xml ./profile-service/pom.xml
COPY messaging-service/pom.xml ./messaging-service/pom.xml
COPY training-service/pom.xml ./training-service/pom.xml
COPY discovery-service/pom.xml ./discovery-service/pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml

# Télécharger les dépendances
RUN mvn dependency:go-offline -pl auth-service -am -q

# Copier tout le projet
COPY . .

# Compiler auth-service
RUN mvn clean package -pl auth-service -am -DskipTests


# =========================
# Étape 2 : Exécution
# =========================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier le jar généré
COPY --from=build /app/auth-service/target/*.jar app.jar

EXPOSE 8084

USER appuser

ENTRYPOINT ["java", "-jar", "app.jar"]