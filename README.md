# URL Shortener

A simple and efficient URL shortener application built with Django and PostgreSQL, designed to create short links and manage their expiration seamlessly.

## Features

- **Generate Unique Short URLs**: Users enter a long URL and receive a randomly generated short URL.
- **Expiration Settings**: By default, shortened URLs do not expire, but users can set a custom expiration time.
- **URL Redirection**: Users can access the shortened URL to be redirected to the original long URL; expired URLs return an error message.
- **Automatic Purging of Expired URLs**: The system automatically deletes expired URLs after their expiration time has passed.
- **Custom Shortlink**: Users can specify custom aliases for their shortened URLs, in addition to the randomly generated ones.


## Technologies Used

- **Backend**: Django
- **Database**: PostgreSQL
- **Caching**: Redis
- **Containerization**: Docker, Docker Compose
- **API Framework**: Django REST Framework
- **Timezone Handling**: `pytz`

## Prerequisites

- Python 3.8 or higher
- PostgreSQL
- Docker and Docker Compose 
- pip 
- Git

## Application preview
![Screen Recording](/application-preview/demo.gif)
## Getting Started

Follow these instructions to set up and run the URL Shortener application on your local machine.

### 1. Clone the Repository

First, clone the repository to your local machine using Git:

```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
````

### 2. Build and Run with Docker Compose

```bash
docker-compose up --build
````

### 3. Accessing the application

```bash
 http://localhost:3000
````
 

## Acknowledgments

- [Django Documentation](https://docs.djangoproject.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [pytz Documentation](https://pythonhosted.org/pytz/)
```


# url_shortener