# ProjectMatch – Spécification des besoins

## 1. Présentation du projet

ProjectMatch est une plateforme sociale et collaborative qui permet aux jeunes et aux étudiants de partager leurs idées, former des équipes et collaborer sur des projets. La plateforme offre un espace interactif pour publier des projets, trouver des partenaires et travailler ensemble afin de transformer les idées en réalisations concrètes. Elle permet également aux mentors de proposer des formations et d’accompagner les utilisateurs dans le développement de leurs compétences.

---

## 2. Les utilisateurs du système

### 2.1 Utilisateur principal : Jeune / Étudiant

C’est l’acteur principal de la plateforme. Il utilise le système pour partager ses idées et collaborer avec d’autres utilisateurs afin de réaliser des projets.

**Il peut :**

- créer un compte  
- se connecter à la plateforme  
- créer et modifier son profil  
- publier une idée de projet  
- rechercher des projets  
- rejoindre une équipe ou un projet  
- communiquer avec d’autres utilisateurs  
- suivre des formations proposées par les mentors  

---

### 2.2 Mentor / Formateur (Utilisateur secondaire)

Le mentor est une personne expérimentée qui accompagne les jeunes dans leurs projets et leur apprentissage.

**Il peut :**

- proposer des formations gratuites ou payantes  
- partager des ressources pédagogiques  
- donner des conseils techniques ou professionnels  
- guider les équipes dans la réalisation de leurs projets  

---

### 2.3 Administrateur (Utilisateur secondaire)

L’administrateur est responsable de la gestion et du bon fonctionnement de la plateforme.

**Il peut :**

- gérer les utilisateurs  
- supprimer les contenus inappropriés  
- gérer les projets publiés  
- contrôler la sécurité de la plateforme  

---

## 3. Description des technologies utilisées

Pour développer ProjectMatch, les technologies suivantes sont utilisées:

### 🖥️ Frontend
 
- **React** : utilisé pour développer une interface utilisateur moderne, dynamique et réactive.

- **Axios** : Bibliothèque HTTP pour la communication entre le frontend et les API REST des services backend.

- **STOMP.js et SockJS** : Bibliothèques JavaScript utilisées pour la communication en temps réel et le système de messagerie instantanée via WebSocket.

- **CSS3** : Styles personnalisés pour une interface moderne et responsive (design inspiré de LinkedIn/WhatsApp).

### ⚙️ Backend

- **Spring Boot** : utilisé pour développer les microservices backend, gérer la logique métier et créer les API REST.

- **Spring Security** : utilisé pour sécuriser l’application et gérer l’authentification avec JWT.

- **Hibernate / JPA** : utilisé pour la gestion et la persistance des données.

- **JJWT** : utilisé pour la génération et la validation des tokens JWT.

### 🗄️ Base de données
**MySQL**: utilisé pour stocker les informations des utilisateurs, projets, équipes, messages et formations.

Ces technologies forment une architecture **client-serveur moderne** : React assure une interface dynamique, Spring Boot expose des API REST sécurisées, et MySQL garantit la persistance des données. La communication temps réel via WebSocket (STOMP + SockJS) enrichit l'expérience collaborative de la plateforme.
