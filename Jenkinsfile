pipeline {
    agent { label 'jenkins-agent' }

    environment {
        // DockerHub Credentials ID stored in Jenkins
        DOCKERHUB_CREDENTIALS = credentials('docker-hub-credentials')

        // SonarQube Server configuration name as defined in Jenkins
        SONARQUBE = 'jenkins-sonar-token'

        // GitLab Repository URL
        GIT_REPO = 'https://gitlab.com/joisyousef/nodejs.org.git'

        // Docker Image Name
        DOCKER_IMAGE = "joisyousef/nodejs-app"

        // Kubernetes Namespace
        DEV_NAMESPACE = "development"
        PROD_NAMESPACE = "production"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out code from GitLab...'
                git branch: 'main', url: "${GIT_REPO}"
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

        stage('Dockerize Application') {
            steps {
                echo 'Building Docker Image...'
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE}:${env.BUILD_ID}")
                }
            }
        }

        stage('Push Docker Image to DockerHub') {
            steps {
                echo 'Pushing Docker Image to DockerHub...'
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docke-rhub-credentials') {
                        dockerImage.push()
                        dockerImage.push('latest') // Tag as latest
                    }
                }
            }
        }

         stage('Deploy to Production Namespace') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to Production Namespace...'
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                    script {
                        // Update deployment.yaml with the new image tag and namespace
                        sh """
                            sed -i 's|joisyousef/nodejs-app:latest|${DOCKER_IMAGE}:${env.BUILD_ID}|g' k8s/deployment.yaml
                            sed -i 's|namespace: development|namespace: production|g' k8s/deployment.yaml
                            sed -i 's|namespace: development|namespace: production|g' k8s/service.yaml
                            kubectl apply -f k8s/deployment.yaml --namespace=${PROD_NAMESPACE}
                            kubectl apply -f k8s/service.yaml --namespace=${PROD_NAMESPACE}
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}
