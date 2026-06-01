pipeline {
    agent any

    tools {
        // Ensure NodeJS is configured in your Jenkins Global Tool Configuration
        nodejs 'NodeJS' 
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
            }
        }
        
        stage('Syntax Check') {
            steps {
                echo 'Performing syntax check on the bot script...'
                sh 'node --check quack_bot.js'
            }
        }
        
        // Note: Running the bot requires a display (headless: false) and credentials.
        // If you want to run the bot in CI, set headless: true in the script and uncomment below.
        /*
        stage('Run Bot') {
            steps {
                echo 'Running the bot...'
                sh 'node quack_bot.js'
            }
        }
        */
    }
}
