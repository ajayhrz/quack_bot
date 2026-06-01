pipeline {
    agent any

    environment {
        // Setting this ensures Playwright runs without a visible UI in Jenkins
        CI = 'true'
        // Ensures Jenkins can find Node on your Mac
        PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
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
