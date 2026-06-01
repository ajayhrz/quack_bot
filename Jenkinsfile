pipeline {
    agent any

    tools {
        // Ensure NodeJS is configured in your Jenkins Global Tool Configuration with this name
        nodejs 'NodeJS' 
    }

    environment {
        // Setting this ensures Playwright runs without a visible UI in Jenkins
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing Node dependencies...'
                sh 'npm install'
                
                echo 'Installing Playwright browsers...'
                sh 'npx playwright install chromium'
                // Install OS dependencies required for headless Chromium
                sh 'npx playwright install-deps chromium' 
            }
        }
        
        stage('Run Quack Bot') {
            steps {
                echo 'Running the bot in headless mode...'
                sh 'node quack_bot.js'
            }
        }
    }
}
