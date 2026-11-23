// TEMPORAL. Esta rama solo existe para borrar los archivos de root que quedaron
// en el workspace de main y que impiden el checkout ("Operation not permitted").
// Se elimina la rama apenas termine el build.
pipeline {
    agent any

    stages {
        stage('Wipe kleino_main') {
            steps {
                sh '''
                    CT=$(docker ps --format '{{.Names}}' | grep -i jenkins | head -1)
                    echo "Jenkins: $CT"
                    # Si jenkins_home es volumen nombrado, --volumes-from lo monta.
                    docker run --rm --volumes-from "$CT" alpine \
                      sh -c 'rm -rf /var/jenkins_home/workspace/kleino_main; echo "--- workspace ---"; ls -la /var/jenkins_home/workspace 2>/dev/null || true' || true
                    # Si jenkins_home es bind mount, la ruta del host es la misma.
                    docker run --rm -v /var/jenkins_home:/jh alpine \
                      sh -c 'rm -rf /jh/workspace/kleino_main; echo "--- workspace (bind) ---"; ls -la /jh/workspace 2>/dev/null || true' || true
                    echo "wipe terminado"
                '''
            }
        }
    }
}
