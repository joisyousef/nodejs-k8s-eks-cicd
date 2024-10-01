pipeline {
    agent  { label 'local' } 
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
