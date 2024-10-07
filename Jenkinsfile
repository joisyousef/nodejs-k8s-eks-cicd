pipeline {
    agent { label 'jenkins-agent' }

    environment {
        SONARQUBE = 'SonarQube'

        GIT_REPO = 'https://gitlab.com/joisyousef/nodejs.org.git'

        RELEASE = "1.0.0"
        DOCKER_USER = "joisyousef"
        DOCKER_PASS = "docker-hub-credentials" // Jenkins credentials ID for Docker Hub
        APP_NAME = "nodejs-k8s-eks-cicd"
        IMAGE_NAME = "${DOCKER_USER}/${APP_NAME}"
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
        DEV_NAMESPACE = "development"
        PROD_NAMESPACE = "production"

        NEXT_TELEMETRY_DISABLED = '1'
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Test GitLab Connectivity') {
            steps {
                script {
                    def response = sh(script: 'curl -I https://gitlab.com', returnStatus: true)
                    if (response != 0) {
                        error("GitLab connectivity check failed.")
                    }
                }
            }
        }

        stage('Checkout Code') {
            steps {
                echo 'Checking out code from GitLab...'
                git branch: 'main', credentialsId: 'GitlabAPI', url: "${GIT_REPO}"
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Dependencies...'
                // Attempt 'npm ci', fallback to 'npm install' if 'package-lock.json' is missing
                sh 'npm ci || npm install || { echo "Failed to install dependencies"; exit 1; }'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo 'Running Unit Tests...'
                sh 'npx turbo test:unit || { echo "Unit tests failed"; exit 1; }'
            }
        }

        stage('Build Application') {
            steps {
                echo 'Building the Application...'
                sh 'npm run build -- --verbosity 2 || { echo "Build failed"; exit 1; }'
            }
        }

         stage("SonarQube Analysis") {
          steps {
            script {
              withSonarQubeEnv(credentialsId: 'jenkins-token-v2') {
                sh '''
                npx sonar-scanner \
                  -Dsonar.projectKey=nodejs-k8s-eks-cicd \
                  -Dsonar.projectName="nodejs-k8s-eks-cicd" \
                  -Dsonar.projectVersion="1.0.0" \
                  -Dsonar.sources=. \
                  || { echo "SonarQube analysis failed"; exit 1; }
                '''
            }
        }
    }
}

   stage('Dockerize') {
    steps {
        script {
            try {
                echo "Building Docker image..."
                dockerImage = docker.build("${DOCKER_IMAGE}:${env.BUILD_ID}")
                echo "Docker image built successfully: ${dockerImage}"
            } catch (Exception e) {
                echo "Docker build failed: ${e.getMessage()}"
                currentBuild.result = 'FAILURE'
                error("Stopping pipeline due to Docker build failure.")
            }
        }
    }
}

stage('Push to DockerHub') {
    steps {
        script {
            try {
                echo "Pushing Docker image to DockerHub..."
                docker.withRegistry('', DOCKER_PASS) {
                    dockerImage.push("${IMAGE_TAG}")
                    dockerImage.push('latest')
                }
                echo "Docker image pushed successfully."
            } catch (Exception e) {
                echo "Failed to push Docker image: ${e.getMessage()}"
                currentBuild.result = 'FAILURE'
                error("Stopping pipeline due to Docker push failure.")
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


        stage('Create Namespaces') {
            steps {
                script {
                    sh '''
                        kubectl create namespace development || echo "Namespace development already exists"
                        kubectl create namespace production || echo "Namespace production already exists"
                    '''
                }
            }
        }


        stage('Deploy to Development') {
            steps {
                script {
                    sh 'kubectl apply -f k8s/deployment.yaml --namespace=development'
                    sh 'kubectl apply -f k8s/service.yaml --namespace=development'
                }
            }
        }


//        stage('Smoke Test') {
//         steps {
//         echo 'Running Smoke Tests...'
//         sh '''
//             # Define the service health endpoint
//             SERVICE_URL="http://localhost/health"

//             # Perform the smoke test
//             HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL)

//             if [ "$HTTP_STATUS" -ne 200 ]; then
//                 echo "Smoke Test Failed: Received HTTP status $HTTP_STATUS"
//                 exit 1
//             else
//                 echo "Smoke Test Passed: Received HTTP status $HTTP_STATUS"
//                 exit 0
//             fi
//         '''
//     }
// }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh 'kubectl apply -f k8s/deployment.yaml --namespace=production'
                    sh 'kubectl apply -f k8s/service.yaml --namespace=production'
                }
            }
        }


        stage('Cleanup Artifacts') {
            steps {
                script {
                    sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true"
                    sh "docker rmi ${IMAGE_NAME}:latest || true"
                }
            }
        }
    }


    post {
        always {
            echo 'Cleaning up after the build...'
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
