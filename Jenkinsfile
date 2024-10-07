pipeline {
    agent { label 'jenkins-agent' }

    environment {
        SONARQUBE = 'jenkins-token-v2'
        GIT_REPO = 'https://gitlab.com/joisyousef/nodejs.org.git'
        RELEASE = "1.0.0"
        DOCKER_USER = "joisyousef"
        DOCKER_PASS = "docker-hub-credentials"
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
                // Run the sonar-scanner with necessary properties
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


        // stage("Build & Push Docker Image") {
        //     steps {
        //         script {
        //             docker.withRegistry('',DOCKER_PASS) {
        //                 docker_image = docker.build "${IMAGE_NAME}"
        //             }

        //             docker.withRegistry('',DOCKER_PASS) {
        //                 docker_image.push("${IMAGE_TAG}")
        //                 docker_image.push('latest')
        //             }
        //         }
        //     }

        // }

         stage("Trivy Scan") {
            steps {
                script {
                    sh """
                        docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${IMAGE_NAME}:${IMAGE_TAG} --no-progress --scanners vuln --exit-code 0 --severity HIGH,CRITICAL --format table
                    """
                }
            }
        }

        stage('Create NS') {

            steps {
                script {
                    sh 'kubectl create namespace development'
                    sh 'kubectl create namespace production'
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

        //  stage('Smoke Test') {
        //     steps {
        //         // Implement your smoke test commands here
        //         sh 'curl -f http://<development-service-ip>'
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
    }


        stage('Cleanup Artifacts') {
            steps {
                script {
                    sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker rmi ${IMAGE_NAME}:latest"
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
            // Add success notification steps here (e.g., email, Slack)
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
            // Add failure notification steps here (e.g., email, Slack)
        }
    }

}
