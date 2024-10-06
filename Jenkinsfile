pipeline {
    agent { label 'jenkins-agent' }

    environment {

        SONARQUBE = 'jenkins-sonar-token'

        GIT_REPO = 'https://gitlab.com/joisyousef/nodejs.org.git'

        RELEASE = "1.0.0"
        DOCKER_USER = "joisyousef"
        DOCKER_PASS = "docker-hub-credentials"
        IMAGE_NAME = "${DOCKER_USER}/${APP_NAME}"
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"

        DEV_NAMESPACE = "development"
        PROD_NAMESPACE = "production"

    }

    }
    stages {

        stage('Cleanup Workspace') {
                    steps {
                        cleanWs()
                    }
                }


        stage('Checkout Code') {
            steps {
                echo 'Checking out code from GitLab...'

                git branch: 'main', credentialsId: 'Github-Token'       ,url: "${GIT_REPO}"
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
                withSonarQubeEnv("${SONA    RQUBE}") {
                    sh 'sonar-scanner'
                }
            }
        }

        stage("Build & Push Docker Image") {
            steps {
                script {
                    docker.withRegistry('',DOCKER_PASS) {
                        docker_image = docker.build "${IMAGE_NAME}"
                    }

                    docker.withRegistry('',DOCKER_PASS) {
                        docker_image.push("${IMAGE_TAG}")
                        docker_image.push('latest')
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


        stage ('Cleanup Artifacts') {
            steps {
                script {
                    sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker rmi ${IMAGE_NAME}:latest"
                }
            }
        }


    }

