import hudson.model.Result

def cancelPreviousBuilds() {
  def jobName = env.JOB_NAME
  def buildNumber = env.BUILD_NUMBER.toInteger()
  def currentJob = Jenkins.instance.getItemByFullName(jobName)

  for (def build : currentJob.builds) {
    def exec = build.getExecutor()

    if (build.isBuilding() && build.number.toInteger() != buildNumber && exec != null) {
      exec.interrupt(Result.ABORTED)

      println("Aborted previously running build #${build.number}")
    }
  }
}

pipeline {
  agent any

  options {
    parallelsAlwaysFailFast()
  }

  environment {
    DOCKER_REPOSITORY='eu.gcr.io/campings-exploitation-prd'

    PROJECT_NAME=env.JOB_NAME.tokenize('/')[0].toLowerCase().replaceAll('-', '/')
    PR_NAME=env.JOB_NAME.tokenize('/')[1].toLowerCase()
    PROJECT = "${PROJECT_NAME}-${PR_NAME}-${env.BUILD_ID}"

    // CHANGE_BRANCH when building on PR
    // BRANCH_NAME when building on branch
    BRANCH_NAME = (env.CHANGE_BRANCH == null ? env.BRANCH_NAME : env.CHANGE_BRANCH).tokenize('/').last()
    ORIGINAL_COMMIT = sh (
      script: 'git log -n 1 --first-parent --no-merges --pretty=format:\'%H\'',
      returnStdout: true
    )
  }

  stages {
    stage('Init') {
      steps {
        script {
          cancelPreviousBuilds()
        }
      }
    }

    stage('Build') {
      environment {
        COMMIT = sh (
          script: 'git log -n 1 --pretty=format:\'%H\'',
          returnStdout: true
        )
        DOCKER_APP_IMAGE_TAG="${GCP_DOCKER_REPOSITORY}/${PROJECT_NAME}:${BRANCH_NAME}-${COMMIT}"
        DOCKER_APP_IMAGE_TAG_LATEST="${GCP_DOCKER_REPOSITORY}/${PROJECT_NAME}:${BRANCH_NAME}-latest"
      }

      steps {
        sh 'docker build --pull -t $DOCKER_APP_IMAGE_TAG -t $DOCKER_APP_IMAGE_TAG_LATEST .'
        sh 'docker push $DOCKER_APP_IMAGE_TAG'
        sh 'docker push $DOCKER_APP_IMAGE_TAG_LATEST'
        sh 'docker rmi $DOCKER_APP_IMAGE_TAG'
        sh 'docker rmi $DOCKER_APP_IMAGE_TAG_LATEST'
      }

      post {
        failure {
          archiveArtifacts artifacts: 'var/log/*.log', fingerprint: true
        }
      }
    }
  }

  post {
    failure {
      deleteDir()
    }
  }
}
