pipeline {
  agent any
  options { timestamps(); ansiColor('xterm'); disableConcurrentBuilds() }

  environment {
    SHORT_SHA = "${env.GIT_COMMIT?.take(7)}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git --no-pager log -1 --oneline || true'
      }
    }

    stage('Backend: Test & Build') {
      when { expression { fileExists('backend/build.gradle') || fileExists('build.gradle') } }
      steps {
        sh '''
          set -e
          if [ -d backend ]; then cd backend; fi
          ./gradlew test -x integrationTest
          ./gradlew bootJar
        '''
      }
      post {
        always { junit allowEmptyResults: true, testResults: '**/build/test-results/test/*.xml' }
      }
    }

    stage('Frontend: Test & Build') {
      when { expression { fileExists('frontend/package.json') || fileExists('package.json') } }
      steps {
        sh '''
          set -e
          if [ -f package.json ] && [ ! -d frontend ]; then
            npm ci
            npm test -- --watchAll=false || true
            npm run build
          else
            cd frontend
            npm ci
            npm test -- --watchAll=false || true
            npm run build
          fi
        '''
      }
    }

    stage('Docker Build (local, dind)') {
      when { anyOf { branch 'develop'; branch 'master' } }
      steps {
        sh '''
          set -e
          docker build -t lendy-backend:latest -f backend/Dockerfile .
          docker build -t lendy-frontend:latest -f frontend/Dockerfile .
          docker build -t lendy-gateway:latest -f deploy/gateway/Dockerfile deploy/gateway
        '''
      }
    }

    stage('Deploy with docker compose') {
      when { anyOf { branch 'develop'; branch 'master' } }
      steps {
        sh '''
          set -e
          docker run --rm \
            --network jenkins \
            -e DOCKER_HOST -e DOCKER_CERT_PATH -e DOCKER_TLS_VERIFY \
            -v $DOCKER_CERT_PATH:$DOCKER_CERT_PATH:ro \
            -v "$PWD/deploy":/work:ro -w /work \
            docker/compose:2.27.0 \
              up -d --force-recreate
          docker ps --format "table {{.Names}}\\t{{.Ports}}"
        '''
      }
    }
  }

  post {
    always { cleanWs() }
  }
}
