pipeline {
    agent { label 'master' }
    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing Node.js dependencies...'
                    sh 'npm install'
                }
            }
        }
    }
}
