pipeline {
    agent { label 'local' }  // Specify the agent to run on (with the 'local' label)

    stages {
        // Install dependencies using npm ci
        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing Dependencies...'
                    sh 'npm ci'  // Installs dependencies using package-lock.json
                }
            }
        }

        // Run unit tests (npm test)
        stage('Run Unit Tests') {
            steps {
                script {
                    echo 'Running Unit Tests...'
                    sh 'npm test'  // Executes the npm test command to run unit tests
                }
            }
        }

        // Build the application (if necessary)
        stage('Build Application') {
            steps {
                script {
                    echo 'Building the Application...'
                    sh 'npm run build'  // Runs the npm build command, if your app requires it
                }
            }
        }

        // Start the application in development mode using npx turbo dev
        stage('Start Application') {
            steps {
                script {
                    echo 'Starting Application in Development Mode...'
                    sh 'npx turbo dev'  // Runs the application in development mode
                }
            }
        }
    }         
}
