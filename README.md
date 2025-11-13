

```markdown
# 🚀 CarDealershipApp - Angular 20 Web Application

A comprehensive web application built with Angular 20 for managing a car dealership, featuring CRUD operations, user authentication, and data visualization.

Streamline your car dealership operations with our modern and feature-rich application.

##

![License](https://img.shields.io/github/license/FedericoMeniy/PrograIV-TPFinal-Front)
![GitHub stars](https://img.shields.io/github/stars/FedericoMeniy/PrograIV-TPFinal-Front?style=social)
![GitHub forks](https://img.shields.io/github/forks/FedericoMeniy/PrograIV-TPFinal-Front?style=social)
![GitHub issues](https://img.shields.io/github/issues/FedericoMeniy/PrograIV-TPFinal-Front)
![GitHub pull requests](https://img.shields.io/github/issues-pr/FedericoMeniy/PrograIV-TPFinal-Front)
![GitHub last commit](https://img.shields.io/github/last-commit/FedericoMeniy/PrograIV-TPFinal-Front)

<br>

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)

<br>

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Testing](#testing)
- [Deployment](#deployment)
- [FAQ](#faq)
- [License](#license)
- [Support](#support)
- [Acknowledgments](#acknowledgments)

<br>

## About

This Angular 20 web application is designed to efficiently manage car dealership operations. It provides a user-friendly interface for performing CRUD (Create, Read, Update, Delete) operations on vehicles and clients. The application incorporates a robust login system with role-based access control, ensuring that only authorized users can access specific functionalities. Route protection is implemented to secure different parts of the application based on user roles. Data visualization is achieved through the integration of Chart.js, enabling insightful graphical representations of dealership data. The application leverages json-server for simulating data, making it easy to set up and test.

The primary goal of this project is to offer a streamlined and intuitive solution for car dealership management. It caters to dealership owners, managers, and employees who require an efficient tool for managing vehicles, clients, and sales data. The application is built using Angular 20, TypeScript, and leverages various modern web development technologies to ensure performance, security, and scalability.

Key technologies used include Angular 20 for the front-end framework, TypeScript for enhanced code maintainability, Chart.js for data visualization, and json-server for data simulation. The application follows a component-based architecture, promoting reusability and maintainability. It also incorporates best practices for security, such as route protection and role-based access control.

<br>

## ✨ Features

- 🎯 **Vehicle Management**: Comprehensive CRUD operations for managing vehicle inventory, including adding new vehicles, updating existing ones, and deleting vehicles.
- 👥 **Client Management**: Efficiently manage client information with CRUD operations, allowing for easy addition, modification, and removal of client data.
- 🔑 **User Authentication**: Secure login system with role-based access control to ensure that only authorized users can access specific functionalities.
- 🛡️ **Route Protection**: Implementation of route protection to secure different parts of the application based on user roles, preventing unauthorized access.
- 📊 **Data Visualization**: Integration of Chart.js to provide insightful graphical representations of dealership data, such as sales trends and inventory levels.
- 🧪 **Data Simulation**: Utilizes json-server for simulating data, making it easy to set up and test the application without relying on a live database.
- 🎨 **UI/UX**: Modern and intuitive user interface design for a seamless user experience.
- 📱 **Responsive**: Cross-platform compatibility, ensuring the application works well on various devices and screen sizes.
- 🛠️ **Extensible**: Modular design allows for easy customization and extension with new features and functionalities.

<br>

## 🎬 Demo

🔗 **Live Demo**: [https://your-demo-url.com](https://your-demo-url.com)

### Screenshots
![Vehicle List](screenshots/vehicle-list.png)
*Vehicle list interface showing vehicle details and management options.*

![Client Management](screenshots/client-management.png)
*Client management interface for adding, editing, and deleting client information.*

![Dashboard](screenshots/dashboard.png)
*User dashboard with key metrics and data visualizations.*

<br>

## 🚀 Quick Start

Clone and run in 3 steps:

```bash
git clone https://github.com/FedericoMeniy/PrograIV-TPFinal-Front.git
cd PrograIV-TPFinal-Front
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200) to view it in your browser.

<br>

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Angular CLI (install globally: `npm install -g @angular/cli`)
- Git

### Steps

```bash
# Clone repository
git clone https://github.com/FedericoMeniy/PrograIV-TPFinal-Front.git
cd PrograIV-TPFinal-Front

# Install dependencies
npm install

# Start development server
ng serve
```

### Using Docker (Optional)

1.  **Build the Docker image:**

    ```bash
    docker build -t cardealership-app .
    ```

2.  **Run the Docker container:**

    ```bash
    docker run -p 4200:4200 cardealership-app
    ```

<br>

## 💻 Usage

### Basic Usage

After installation, navigate to the project directory and start the Angular development server:

```bash
cd PrograIV-TPFinal-Front
ng serve
```

This will compile the application and serve it at `http://localhost:4200`.  The application will automatically reload if you change any of the source files.

### Login

Use the provided credentials to log in and access the application's features.  Roles will determine access to specific functionalities.

### Vehicle and Client Management

Navigate to the respective sections to perform CRUD operations on vehicles and clients.

### Data Visualization

Access the dashboard to view graphical representations of dealership data.

<br>

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory to configure environment-specific settings. Example:

```env
API_BASE_URL=http://localhost:3000/api
AUTH_ENABLED=true
```

### Angular Configuration

Modify the `angular.json` file for project-specific configurations, such as build options, styles, and scripts.

<br>

## API Reference

The application interacts with a backend API (simulated by `json-server` in this example).  Here are some example endpoints:

### Vehicles

-   `GET /vehicles`: Retrieves a list of all vehicles.
-   `GET /vehicles/{id}`: Retrieves a specific vehicle by ID.
-   `POST /vehicles`: Creates a new vehicle.
-   `PUT /vehicles/{id}`: Updates an existing vehicle.
-   `DELETE /vehicles/{id}`: Deletes a vehicle.

### Clients

-   `GET /clients`: Retrieves a list of all clients.
-   `GET /clients/{id}`: Retrieves a specific client by ID.
-   `POST /clients`: Creates a new client.
-   `PUT /clients/{id}`: Updates an existing client.
-   `DELETE /clients/{id}`: Deletes a client.

### Authentication

-   `POST /login`: Authenticates a user and returns a token.

<br>

## 📁 Project Structure

```
PrograIV-TPFinal-Front/
├── 📁 src/
│   ├── 📁 app/                # Main application module
│   │   ├── 📁 components/      # Reusable UI components
│   │   │   ├── 📁 vehicle-list/
│   │   │   │   ├── 📄 vehicle-list.component.ts
│   │   │   │   ├── 📄 vehicle-list.component.html
│   │   │   │   └── 📄 vehicle-list.component.scss
│   │   │   ├── 📁 client-list/
│   │   │   │   ├── 📄 client-list.component.ts
│   │   │   │   ├── 📄 client-list.component.html
│   │   │   │   └── 📄 client-list.component.scss
│   │   │   └── 📁 ...
│   │   ├── 📁 services/       # API services
│   │   │   ├── 📄 vehicle.service.ts
│   │   │   ├── 📄 client.service.ts
│   │   │   └── 📄 auth.service.ts
│   │   ├── 📁 models/         # Data models
│   │   │   ├── 📄 vehicle.model.ts
│   │   │   ├── 📄 client.model.ts
│   │   │   └── 📄 user.model.ts
│   │   ├── 📁 guards/         # Route guards
│   │   │   └── 📄 auth.guard.ts
│   │   ├── 📄 app.component.ts
│   │   ├── 📄 app.component.html
│   │   ├── 📄 app.module.ts
│   │   └── 📄 app-routing.module.ts
│   ├── 📁 assets/             # Static assets
│   ├── 📁 environments/       # Environment-specific configurations
│   └── 📄 index.html
├── 📄 angular.json          # Angular CLI configuration
├── 📄 package.json          # Project dependencies
├── 📄 README.md             # Project documentation
└── 📄 tsconfig.json         # TypeScript configuration
```

<br>

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1.  🍴 Fork the repository
2.  🌟 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  ✅ Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  📤 Push to the branch (`git push origin feature/AmazingFeature`)
5.  🔃 Open a Pull Request

### Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/yourusername/PrograIV-TPFinal-Front.git

# Install dependencies
npm install

# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes and test
ng test

# Commit and push
git commit -m "Description of changes"
git push origin feature/your-feature-name
```

### Code Style

-   Follow existing code conventions
-   Run `ng lint` before committing
-   Add tests for new features
-   Update documentation as needed

<br>

## Testing

Run unit tests using the Angular CLI:

```bash
ng test
```

Run end-to-end tests using:

```bash
ng e2e
```

<br>

## Deployment

### Deploying to Vercel

1.  Create a Vercel account and install the Vercel CLI.
2.  Run `vercel` in your project directory.
3.  Follow the prompts to deploy your application.

### Deploying to Netlify

1.  Create a Netlify account and install the Netlify CLI.
2.  Run `netlify deploy` in your project directory.
3.  Follow the prompts to deploy your application.

### Deploying with Docker

1.  Build the Docker image: `docker build -t cardealership-app .`
2.  Push the image to a container registry (e.g., Docker Hub).
3.  Deploy the container to a platform like Kubernetes or Docker Swarm.

<br>

## FAQ

**Q: How do I customize the application's theme?**

A: Modify the SCSS files in the `src/app/styles/` directory.

**Q: How do I add new features?**

A: Create new components, services, and models as needed, and integrate them into the application.

**Q: How do I configure the API endpoint?**

A: Set the `API_BASE_URL` environment variable in the `.env` file.

<br>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### License Summary

-   ✅ Commercial use
-   ✅ Modification
-   ✅ Distribution
-   ✅ Private use
-   ❌ Liability
-   ❌ Warranty

<br>

## 💬 Support

-   📧 **Email**: your.email@example.com
-   💬 **Discord**: [Join our community](https://discord.gg/your-invite)
-   🐛 **Issues**: [GitHub Issues](https://github.com/FedericoMeniy/PrograIV-TPFinal-Front/issues)
-   📖 **Documentation**: [Full Documentation](https://docs.your-site.com)
-   💰 **Sponsor**: [Support the project](https://github.com/sponsors/FedericoMeniy)

<br>

## 🙏 Acknowledgments

-   🎨 **Design inspiration**: [Dribbble](https://dribbble.com/)
-   📚 **Libraries used**:
    -   [Angular](https://angular.io/) - Front-end framework
    -   [Chart.js](https://www.chartjs.org/) - Data visualization
    -   [json-server](https://github.com/typicode/json-server) - Mock API server
-   👥 **Contributors**: Thanks to all [contributors](https://github.com/FedericoMeniy/PrograIV-TPFinal-Front/contributors)
-   🌟 **Special thanks**: To the Angular community for their support and resources.
```
