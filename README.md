#  ProjectMatch

> **Plateforme Collaborative de Gestion de Projets — Architecture Microservices**

---

## Sommaire

- [Présentation](#-présentation)
- [Utilisateurs du système](#-utilisateurs-du-système)
- [Architecture](#️-architecture)
- [Technologies](#-technologies)
- [Structure du projet](#-structure-du-projet)
- [Microservices](#-microservices)
- [Docker](#-docker)
- [Kubernetes](#️-kubernetes)
- [Déploiement](#-déploiement)
- [Sécurité](#-sécurité)
- [Auteurs](#-auteurs)

---

## Présentation

ProjectMatch est une plateforme sociale et collaborative qui permet aux jeunes et aux étudiants de partager leurs idées, former des équipes et collaborer sur des projets. La plateforme offre un espace interactif pour publier des projets, trouver des partenaires et travailler ensemble afin de transformer les idées en réalisations concrètes. Elle permet également aux mentors de proposer des formations et d'accompagner les utilisateurs dans le développement de leurs compétences.

---

## Utilisateurs du système

### 2.1 Utilisateur principal : Jeune / Étudiant

C'est l'acteur principal de la plateforme. Il utilise le système pour partager ses idées et collaborer avec d'autres utilisateurs afin de réaliser des projets.

**Il peut :**

- Créer un compte et se connecter à la plateforme
- Créer et modifier son profil
- Publier une idée de projet
- Rechercher des projets et rejoindre une équipe
- Communiquer avec d'autres utilisateurs
- Suivre des formations proposées par les mentors

---

### 2.2 Mentor / Formateur

Le mentor est une personne expérimentée qui accompagne les jeunes dans leurs projets et leur apprentissage.

**Il peut :**

- Proposer des formations gratuites ou payantes
- Partager des ressources pédagogiques
- Donner des conseils techniques ou professionnels
- Guider les équipes dans la réalisation de leurs projets

---

## Architecture

```
                        +----------------------+
                        |    Frontend React    |
                        +----------+-----------+
                                   |
                                   ▼
                        +----------------------+
                        |     API Gateway      |
                        |   NodePort :30080    |
                        +----------+-----------+
                                   |
          ┌────────────┬───────────┼───────────┬────────────┐
          ▼            ▼           ▼           ▼            ▼
   +-----------+ +----------+ +----------+ +----------+ +----------+
   |   Auth    | | Profile  | | Project  | | Training | |Messaging |
   | :8084     | | :8082    | | :8085    | | :8086    | | :8087    |
   +-----------+ +----------+ +----------+ +----------+ +----------+
          |            |           |           |            |
          ▼            ▼           ▼           ▼            ▼
       Auth DB    Profile DB  Project DB  Training DB  Messaging DB
                                                    (MySQL external)

                    +-----------------------------+
                    | Discovery Service — Eureka  |
                    |   NodePort :30761           |
                    +-----------------------------+

     Tous les microservices s'enregistrent automatiquement dans Eureka.
```

---

## Technologies

### Frontend

- **React** : interface utilisateur moderne, dynamique et réactive
- **Axios** : communication HTTP entre le frontend et les API REST des services backend
- **STOMP.js & SockJS** : communication en temps réel et messagerie instantanée via WebSocket
- **CSS3** : styles personnalisés pour une interface moderne et responsive (design inspiré de LinkedIn/WhatsApp)

### Backend

- **Spring Boot** : développement des microservices, logique métier et API REST
- **Spring Security** : sécurisation de l'application et authentification JWT
- **Spring Data JPA / Hibernate** : gestion et persistance des données
- **Spring Cloud Gateway** : point d'entrée unique et routage des requêtes
- **Spring Cloud Netflix Eureka** : découverte et enregistrement des services
- **JJWT** : génération et validation des tokens JWT
- **WebSocket** : communication temps réel (messagerie)
- **Maven** : gestion des dépendances et build

### Base de données

- **MySQL** : stockage des informations des utilisateurs, projets, équipes, messages et formations

### DevOps

- **Docker** (Multi-Stage Build) : conteneurisation et isolation des services
- **Kubernetes** : orchestration et déploiement des conteneurs

### Outils

- **Git / GitHub** · **Postman**

> Ces technologies forment une architecture **client-serveur moderne** : React assure une interface dynamique, Spring Boot expose des API REST sécurisées, et MySQL garantit la persistance des données. La communication temps réel via WebSocket (STOMP + SockJS) enrichit l'expérience collaborative de la plateforme.

---

## Structure du projet

```
development-platform-ikrambahbah_hibarezguani/
│
├── .github/
│
├── backend/
│   ├── api-gateway/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── api-gateway.Dockerfile
│   │
│   ├── auth-service/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── auth-service.Dockerfile
│   │
│   ├── profile-service/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── profile-service.Dockerfile
│   │
│   ├── project-service/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── project-service.Dockerfile
│   │
│   ├── training-service/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── training-service.Dockerfile
│   │
│   ├── messaging-service/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── messaging-service.Dockerfile
│   │
│   ├── discovery-service/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── discovery-service.Dockerfile
│   │
│   ├── k8s/
│   │   ├── api-gateway.yaml
│   │   ├── auth-service.yaml
│   │   ├── discovery.yaml
│   │   ├── frontend.yaml
│   │   ├── messaging-service.yaml
│   │   ├── mysql.yaml
│   │   ├── profile-service.yaml
│   │   ├── project-service.yaml
│   │   └── training-service.yaml
│   │
│   └── pom.xml
│
├── docs/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── Dockerfile.Dockerfile
│
├── .gitignore
└── README.md
```

---

## Microservices

| Service | Port | Rôle |
|---------|------|------|
| **Discovery Service** | 8761 | Registre Eureka — enregistrement et localisation des services |
| **API Gateway** | 8080 | Point d'entrée unique, routage vers les microservices |
| **Auth Service** | 8084 | Inscription, connexion, JWT, réinitialisation mot de passe |
| **Profile Service** | 8082 | Profils utilisateurs, compétences, biographies |
| **Project Service** | 8085 | Création de projets, membres, demandes de participation |
| **Training Service** | 8086 | Formations, inscriptions, évaluations |
| **Messaging Service** | 8087 | Conversations privées, messages temps réel (WebSocket), pièces jointes |

---

## Docker

Chaque microservice dispose de son propre Dockerfile utilisant le pattern **Multi-Stage Build** pour produire des images légères et optimisées.

### Stratégie Multi-Stage Build — Services Backend

```dockerfile
# ── Étape 1 : Build ──────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copier le pom parent + poms de tous les modules
COPY pom.xml ./pom.xml
COPY auth-service/pom.xml       ./auth-service/pom.xml
COPY project-service/pom.xml    ./project-service/pom.xml
COPY profile-service/pom.xml    ./profile-service/pom.xml
COPY messaging-service/pom.xml  ./messaging-service/pom.xml
COPY training-service/pom.xml   ./training-service/pom.xml
COPY discovery-service/pom.xml  ./discovery-service/pom.xml
COPY api-gateway/pom.xml        ./api-gateway/pom.xml

# Pré-télécharger les dépendances (cache Docker optimisé)
RUN mvn dependency:go-offline -pl auth-service -am -q

# Compiler uniquement le service cible
COPY . .
RUN mvn clean package -pl auth-service -am -DskipTests

# ── Étape 2 : Runtime ────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/auth-service/target/*.jar app.jar

EXPOSE 8084
USER appuser

ENTRYPOINT ["java", "-jar", "app.jar"]
```

> Le même pattern est appliqué pour **profile-service**, **project-service**, **training-service**, **messaging-service**, **discovery-service** et **api-gateway** — seuls le module cible (`-pl`), le JAR copié et le port `EXPOSE` changent.

### Dockerfile Frontend (React + Nginx)

```dockerfile
# ── Étape 1 : Build React ─────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ── Étape 2 : Serveur Nginx ───────────────────────────────────
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Construction des images Docker

```bash
# Depuis la racine du projet
docker build -f backend/auth-service/auth-service.Dockerfile         -t auth-service:test ./backend
docker build -f backend/profile-service/profile-service.Dockerfile   -t profile-service:test ./backend
docker build -f backend/project-service/project-service.Dockerfile   -t project-service:test ./backend
docker build -f backend/training-service/training-service.Dockerfile -t training-service:test ./backend
docker build -f backend/messaging-service/messaging-service.Dockerfile -t messaging-service:test ./backend
docker build -f backend/discovery-service/discovery-service.Dockerfile -t discovery-service:test ./backend
docker build -f backend/api-gateway/api-gateway.Dockerfile           -t api-gateway:test ./backend

# Depuis le dossier frontend/
docker build -f Dockerfile.Dockerfile -t frontend:test .
```

---

## Kubernetes

Après la construction des images Docker, Kubernetes orchestre l'ensemble des conteneurs via les manifests du dossier `k8s/`.

### Vue d'ensemble des manifests

| Fichier | Ressources créées | Type de Service |
|---------|-------------------|-----------------|
| `discovery.yaml` | Deployment + Service | `NodePort` → **:30761** |
| `api-gateway.yaml` | Deployment + Service | `NodePort` → **:30080** |
| `auth-service.yaml` | Deployment + Service | `ClusterIP` → :8084 |
| `profile-service.yaml` | Deployment + Service | `ClusterIP` → :8082 |
| `project-service.yaml` | Deployment + Service | `ClusterIP` → :8085 |
| `training-service.yaml` | Deployment + Service | `ClusterIP` → :8086 |
| `messaging-service.yaml` | Deployment + Service | `ClusterIP` → :8087 |
| `frontend.yaml` | Deployment + Service | `NodePort` → **:30090** |
| `mysql.yaml` | Service + Endpoints | MySQL externe → :3306 |

### Détail — Services Backend (exemple : Auth Service)

```yaml
# Deployment : lance et maintient le Pod en vie
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
        - name: auth-service
          image: auth-service:test
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8084
          env:
            - name: EUREKA_CLIENT_SERVICEURL_DEFAULTZONE
              value: "http://discovery-service:8761/eureka/"
---
# Service ClusterIP : adresse réseau stable en interne
apiVersion: v1
kind: Service
metadata:
  name: auth-service
spec:
  selector:
    app: auth-service
  ports:
    - protocol: TCP
      port: 8084
      targetPort: 8084
```

> Le même schéma (Deployment + Service ClusterIP) est utilisé pour **profile-service**, **project-service**, **training-service** et **messaging-service**.

### Détail — API Gateway & Discovery (exposés en NodePort)

```yaml
# api-gateway.yaml — accessible depuis l'extérieur sur le port 30080
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  type: NodePort
  selector:
    app: api-gateway
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
      nodePort: 30080

---

# discovery.yaml — dashboard Eureka accessible sur le port 30761
apiVersion: v1
kind: Service
metadata:
  name: discovery-service
spec:
  type: NodePort
  selector:
    app: discovery-service
  ports:
    - protocol: TCP
      port: 8761
      targetPort: 8761
      nodePort: 30761
```

### Détail — Frontend React

```yaml
# frontend.yaml — interface utilisateur accessible sur le port 30090
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: frontend:test
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30090
```

### Détail — MySQL (base de données externe)

La base de données MySQL tourne en dehors du cluster Kubernetes (instance locale ou distante). Un **Service + Endpoints** Kubernetes est utilisé pour l'exposer sous un nom DNS stable à l'intérieur du cluster.

```yaml
# mysql.yaml — pont vers la base MySQL externe
apiVersion: v1
kind: Service
metadata:
  name: mysql-external
spec:
  ports:
    - protocol: TCP
      port: 3306
      targetPort: 3306
---
apiVersion: v1
kind: Endpoints
metadata:
  name: mysql-external
subsets:
  - addresses:
      - ip: 172.20.10.2   # ← adresse IP de la machine hébergeant MySQL
    ports:
      - port: 3306
```

> ⚠️ Adapter l'adresse IP `172.20.10.2` selon l'environnement de déploiement.

---

## Déploiement

### Prérequis

- Docker installé et en cours d'exécution
- Kubernetes (Minikube, Docker Desktop Kubernetes, ou cluster cloud)
- MySQL démarré et accessible depuis le cluster

### Étapes

```bash
# 1. Construire toutes les images Docker (depuis la racine du projet)
docker build -f backend/auth-service/auth-service.Dockerfile         -t auth-service:test ./backend
docker build -f backend/profile-service/profile-service.Dockerfile   -t profile-service:test ./backend
docker build -f backend/project-service/project-service.Dockerfile   -t project-service:test ./backend
docker build -f backend/training-service/training-service.Dockerfile -t training-service:test ./backend
docker build -f backend/messaging-service/messaging-service.Dockerfile -t messaging-service:test ./backend
docker build -f backend/discovery-service/discovery-service.Dockerfile -t discovery-service:test ./backend
docker build -f backend/api-gateway/api-gateway.Dockerfile           -t api-gateway:test ./backend

# (depuis frontend/)
docker build -f Dockerfile.Dockerfile -t frontend:test .

# 2. (Minikube uniquement) Charger les images dans Minikube
minikube image load auth-service:test
minikube image load profile-service:test
minikube image load project-service:test
minikube image load training-service:test
minikube image load messaging-service:test
minikube image load discovery-service:test
minikube image load api-gateway:test
minikube image load frontend:test

# 3. Déployer tous les manifests Kubernetes
kubectl apply -f backend/k8s/

# 4. Vérifier l'état des pods et services
kubectl get pods
kubectl get services
```

### Accès à l'application

| Composant | URL |
|-----------|-----|
| **Frontend** | `http://<NODE_IP>:30090` |
| **API Gateway** | `http://<NODE_IP>:30080` |
| **Eureka Dashboard** | `http://<NODE_IP>:30761` |

> Avec Minikube : remplacer `<NODE_IP>` par la sortie de `minikube ip`.

---

##  Sécurité

- **Spring Security** sur tous les services backend
- **JWT** : authentification stateless, token généré par Auth Service et validé par l'API Gateway
- **Utilisateur non-root** dans tous les conteneurs Docker (`adduser -S appuser`)
- **Gestion des rôles** et contrôle d'accès aux endpoints
- Communication inter-services uniquement via le réseau interne Kubernetes (ClusterIP)

---
