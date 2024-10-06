pipeline {
    agent { label 'jenkins-agent' }

    environment {
        SONARQUBE = 'SonarQube-Server-Name' // Replace with your SonarQube server name
        GIT_REPO = 'https://gitlab.com/joisyousef/nodejs.org.git'
        RELEASE = "1.0.0"
        DOCKER_USER = "joisyousef"
        DOCKER_PASS = "docker-hub-credentials"
        APP_NAME = "your-app-name" // Define your application name
        IMAGE_NAME = "${DOCKER_USER}/${APP_NAME}"
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
        DEV_NAMESPACE = "development"
        PROD_NAMESPACE = "production"
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Test GitLab Connectivity') { // Temporary stage for troubleshooting
            steps {
                sh 'curl -I https://gitlab.com'
            }
        }

        stage('Checkout Code') {
            steps {
                echo 'Checking out code from GitLab...'
                git branch: 'main', credentialsId: 'GitLab-Token', url: "${GIT_REPO}"
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Dependencies...'
                sh 'npm ci'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo 'Running Unit Tests...'
                sh 'npm test'
            }
        }

        stage('Build Application') {
            steps {
                echo 'Building the Application...'
                sh 'npm run build || { echo "Build failed"; exit 1; }'
            }
        }

        stage('Code Analysis with SonarQube') {
            steps {
                echo 'Running SonarQube Analysis...'
                withSonarQubeEnv("${SONARQUBE}") {
                    sh 'sonar-scanner'
                }
            }
        }

        stage("Build & Push Docker Image") {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_PASS) {
                        def dockerImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage("Trivy Scan") {
            steps {
                script {
                    sh """
                        docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${IMAGE_NAME}:${IMAGE_TAG} --no-progress --scanners vuln --exit-code 0 --severity HIGH,CRITICAL --format table
                    """
                }
            }
        }

        stage('Cleanup Artifacts') {
            steps {
                script {
                    sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker rmi ${IMAGE_NAME}:latest"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}
