# FloraMatch

FloraMatch is a cloud-based web application designed to help users build and manage their personal digital plant collections while discovering plants that best match their environment and preferences.

The project combines modern cloud technologies, serverless architecture, authentication, database services, and AI-powered recommendation mechanisms into a single scalable application.

---

## ✨ Features

### 🌱 Personal Digital Garden

Users can create and manage their own virtual plant collection.

The application allows users to:

* add plants to their personal garden,
* assign custom nicknames,
* store location and purchase information,
* write personal notes,
* edit or remove saved plants,
* browse plants in a clean dashboard interface.

Each user's garden is securely separated and stored in the cloud database.

---

### 🤖 AI-Powered Plant Matching

FloraMatch includes an intelligent recommendation system that helps users discover plants that fit their needs and living conditions.

Users can:

* answer a short questionnaire,
* describe preferences in natural language,
* receive personalized plant recommendations,
* explore different suggestions through randomized matching,
* interact with an AI-based matching assistant.

The recommendation engine transforms user input into structured queries processed by the backend recommendation system.

---

## ☁️ Cloud Architecture

The application was designed as a cloud-native solution using Google Cloud Platform services.

Main technologies used in the project:

* Google Cloud Functions (Gen2)
* Firebase Authentication
* Firestore Database
* Cloud Run
* Vertex AI integration
* Redis Cache
* React + Vite frontend

---

## 🔐 Authentication

The application uses Firebase Authentication for secure user registration and login.

Authenticated users receive isolated access to their own personal garden data stored in Firestore.

---

## 📦 Infrastructure

Infrastructure provisioning and deployment are managed using Terraform.

The project includes:

* serverless backend deployment,
* Firestore integration,
* Redis instance configuration,
* service accounts and permissions,

---

## 🎨 Frontend

The frontend was built using React and Vite with a minimalist nature-inspired design focused on simplicity and usability.

The UI includes:

* authentication pages,
* interactive dashboard,
* digital garden management,
* plant recommendation section,
* responsive layout.

---

## 🚀 Purpose of the Project

This project was created as part of a Cloud Computing course to demonstrate:

* cloud application architecture,
* serverless computing,
* authentication and authorization,
* Infrastructure as Code,
* integration between frontend, backend, and cloud services,
* scalable cloud-native application design.

---

## 👩‍💻 Authors

FloraMatch was developed as an educational cloud computing project.
