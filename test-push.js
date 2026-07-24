import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import path from 'path';

async function testPush() {
    try {
        const serviceAccount = JSON.parse(
            await readFile(path.join(process.cwd(), 'service-account.json'), 'utf8')
        );

        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        console.log('⏳ Buscando un usuario con Push Token en la base de datos...');
        const usersSnap = await admin.firestore().collection('users').limit(5).get();

        let targetToken = null;
        let targetName = '';

        usersSnap.forEach(doc => {
            const data = doc.data();
            if (data.pushToken) {
                targetToken = data.pushToken;
                targetName = data.name;
            }
        });

        if (!targetToken) {
            console.log('❌ Error: No encontré ningún usuario con "pushToken" registrado en Firestore.');
            console.log('💡 Tip: Debes abrir la App en un celular real para que registre su token.');
            return;
        }

        console.log(`🚀 Enviando Push de prueba a: ${targetName}...`);

        const message = {
            notification: {
                title: '🦾 Mantech Pro: Prueba de Sistema',
                body: 'Si recibes esto, tu celular está vinculado correctamente al Nodo Maestro.'
            },
            token: targetToken
        };

        const response = await admin.messaging().send(message);
        console.log('✅ ÉXITO: Notificación enviada correctamente.');
        console.log('ID del mensaje:', response);

    } catch (error) {
        console.error('💥 Error en la prueba:', error.message);
    }
}

testPush();
