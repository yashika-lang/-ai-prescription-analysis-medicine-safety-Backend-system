# AI-Powered Prescription Analysis and Medicine Safety System

A Spring Boot-based healthcare application designed to analyze prescriptions, extract medicine information using OCR, and improve medication safety through allergy-risk detection and medicine management.

## Features

- OCR-based prescription analysis
- Medicine information extraction
- Allergy risk detection
- Medicine database management
- RESTful APIs
- MySQL database integration
- User profile management
- Automated medicine information processing

## Tech Stack

- Java
- Spring Boot
- MySQL
- Maven
- REST APIs
- OCR Integration

## Project Architecture

The application follows a layered architecture:

- Controller Layer
- Service Layer
- Repository Layer
- Database Layer

## Key Modules

### Prescription Analysis
Extracts medicine details from prescriptions using OCR techniques.

### Medicine Safety
Checks medicines against known allergy information and helps identify potential risks.

### Medicine Management
Stores and manages medicine-related information through REST APIs.

### User Management
Handles user data and medicine-related records.

## API Functionality

- Medicine Management APIs
- User Management APIs
- Prescription Analysis APIs
- Allergy Detection Services

## Setup Instructions

1. Clone the repository

```bash
git clone <repository-url>
```

2. Configure MySQL database credentials in `application.properties`

3. Install dependencies

```bash
mvn clean install
```

4. Run the application

```bash
mvn spring-boot:run
```

## Future Enhancements

- Advanced OCR accuracy improvements
- Multi-language medicine information support
- Enhanced allergy detection
- JWT-based authentication and authorization
- Cloud deployment support

## Author

**Yashika Sinha**

B.Tech Computer Science Engineering  
Cummins College of Engineering for Women
