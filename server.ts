import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = 8080;

app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Lógica de "Smart Fallback" para un diagnóstico profesional 100% local
const getSmartFallback = (asset: string, problem: string) => {
  const p = problem.toLowerCase();
  const a = asset.toLowerCase();

  // PRIORIDAD 1: SEGURIDAD (Humo, Fuego, Chispas) - Universal
  if (p.includes('fuego') || p.includes('humo') || p.includes('chispas') || p.includes('quemado') || p.includes('olor a quemado')) {
    return {
      possibleCauses: ['Cortocircuito en bobinado primario', 'Fallo crítico de aislamiento', 'Sobrecalentamiento por obstrucción'],
      urgency: 'Crítica',
      urgencyReason: 'Riesgo inminente de incendio o descarga eléctrica fatal. El síntoma indica degradación severa de componentes.',
      troubleshootingSteps: ['Paso 1: Corte la electricidad desde el breaker principal.', 'Paso 2: Use extintor tipo C si hay llamas.', 'Paso 3: No intente encenderlo hasta inspección experta.'],
      estimatedCostRange: '$80 - $250+',
      specialistType: a.includes('aire') ? 'tecnico_ac' : 'electricista'
    };
  }

  // CATEGORÍA: AIRE ACONDICIONADO
  if (a.includes('aire') || a.includes('split') || a.includes('ac')) {
    if (p.includes('agua') || p.includes('gotea') || p.includes('mojado')) {
      return {
        possibleCauses: ['Obstrucción en línea de drenaje', 'Congelamiento de serpentín por filtros sucios', 'Bandeja de condensado fisurada'],
        urgency: 'Alta',
        urgencyReason: 'El agua puede causar daños estructurales en paredes y cortocircuitos en la unidad interior.',
        troubleshootingSteps: ['Paso 1: Apague la unidad inmediatamente.', 'Paso 2: Limpie los filtros de malla frontales.', 'Paso 3: Verifique si la manguera exterior está obstruida.'],
        estimatedCostRange: '$35 - $65',
        specialistType: 'tecnico_ac'
      };
    }
    if (p.includes('enfría') || p.includes('calor') || p.includes('poco aire')) {
      return {
        possibleCauses: ['Fuga de gas refrigerante R410A/R22', 'Capacitor de arranque defectuoso', 'Compresor sobrecalentado'],
        urgency: 'Media',
        urgencyReason: 'Pérdida de eficiencia operativa. Forzar el equipo puede quemar el compresor.',
        troubleshootingSteps: ['Paso 1: Verifique que el modo esté en "Cool" (Copo de nieve).', 'Paso 2: Revise si el ventilador exterior gira.', 'Paso 3: Evite usarlo hasta que sea revisado.'],
        estimatedCostRange: '$45 - $120',
        specialistType: 'tecnico_ac'
      };
    }
  }

  // CATEGORÍA: VEHÍCULOS (CARRO/MOTO)
  if (a.includes('carro') || a.includes('auto') || a.includes('toyota') || a.includes('geely') || a.includes('moto')) {
    if (p.includes('freno') || p.includes('chillido') || p.includes('tiembla')) {
      return {
        possibleCauses: ['Pastillas de freno desgastadas', 'Discos de freno cristalizados o deformados', 'Bajo nivel de líquido de frenos'],
        urgency: 'Alta',
        urgencyReason: 'Seguridad vial comprometida. La distancia de frenado aumenta peligrosamente.',
        troubleshootingSteps: ['Paso 1: Revise el nivel del depósito de líquido de frenos.', 'Paso 2: Evite frenadas bruscas.', 'Paso 3: Lleve el vehículo a inspección inmediata.'],
        estimatedCostRange: '$65 - $150',
        specialistType: 'mecanico'
      };
    }
    if (p.includes('arranca') || p.includes('batería') || p.includes('prend') || p.includes('luces')) {
      return {
        possibleCauses: ['Batería con vida útil agotada (Sulfatación)', 'Alternador no carga correctamente', 'Bornes flojos o sucios'],
        urgency: 'Media',
        urgencyReason: 'Riesgo de quedar varado. El sistema eléctrico no mantiene la carga mínima.',
        troubleshootingSteps: ['Paso 1: Verifique si los bornes tienen polvo blanco/celeste.', 'Paso 2: Intente un arranque con cables auxiliares.', 'Paso 3: Mida el voltaje en un centro de baterías.'],
        estimatedCostRange: '$75 - $130',
        specialistType: 'mecanico'
      };
    }
  }

  // CATEGORÍA: TI / SERVIDORES / COMPUTACIÓN
  if (a.includes('servidor') || a.includes('pc') || a.includes('computadora') || a.includes('red')) {
    if (p.includes('lento') || p.includes('internet') || p.includes('caído') || p.includes('wifi')) {
      return {
        possibleCauses: ['Saturación de memoria RAM / Cache', 'Fallo en switch o ruteador de borde', 'Fragmentación de disco o virus'],
        urgency: 'Media',
        urgencyReason: 'Afecta la productividad. Si es un servidor, puede haber degradación de servicios críticos.',
        troubleshootingSteps: ['Paso 1: Reinicie el equipo y el ruteador.', 'Paso 2: Ejecute un test de velocidad.', 'Paso 3: Verifique cables de red (Ethernet).'],
        estimatedCostRange: '$40 - $120',
        specialistType: 'informatico'
      };
    }
    if (p.includes('disco') || p.includes('azul') || p.includes('volumen') || p.includes('raid')) {
      return {
        possibleCauses: ['Fallo físico de sector de disco duro', 'Corrupción de sistema de archivos', 'Fallo en controladora RAID'],
        urgency: 'Crítica',
        urgencyReason: 'Riesgo inminente de pérdida de datos permanente.',
        troubleshootingSteps: ['Paso 1: Apague el equipo para evitar más daños físicos.', 'Paso 2: No intente formatear.', 'Paso 3: Contacte soporte de datos urgente.'],
        estimatedCostRange: '$100 - $350',
        specialistType: 'informatico'
      };
    }
  }

  // CATEGORÍA: ENERGÍA (SOLAR / GENERADORES)
  if (a.includes('solar') || a.includes('panel') || a.includes('planta') || a.includes('generador')) {
    return {
      possibleCauses: ['Inversor en modo error', 'Baterías con carga profunda insuficiente', 'Transferencia automática pegada'],
      urgency: 'Alta',
      urgencyReason: 'Pérdida de respaldo energético. Puede afectar equipos sensibles conectados.',
      troubleshootingSteps: ['Paso 1: Verifique códigos de error en el display.', 'Paso 2: Revise niveles de combustible/aceite (si es planta).', 'Paso 3: Limpie los paneles (si es solar).'],
      estimatedCostRange: '$60 - $200',
      specialistType: a.includes('solar') ? 'especialista_solar' : 'electricista'
    };
  }

  // FALLBACK GENÉRICO PROFESIONAL
  return {
    possibleCauses: ['Necesidad de mantenimiento preventivo', 'Desgaste natural de piezas internas', 'Fallo en sensor de control'],
    urgency: 'Media',
    urgencyReason: 'El síntoma reportado sugiere una pérdida de eficiencia. Se recomienda inspección para evitar reparaciones costosas.',
    troubleshootingSteps: ['Paso 1: Reinicie el equipo.', 'Paso 2: Revise conexiones externas.', 'Paso 3: Solicite una cotización preventiva.'],
    estimatedCostRange: '$45 - $95',
    specialistType: 'mecanico'
  };
};

app.post('/api/diagnose', (req, res) => {
  const { assetName, problemDescription } = req.body;
<<<<<<< HEAD
  res.json(getSmartFallback(assetName, problemDescription));
=======

  // Diagnóstico 100% Local y Privado (Sin dependencia de APIs externas/IA)
  console.log(`🔍 Procesando diagnóstico local para: ${assetName}`);

  const diagnostic = getSmartFallback(assetName || 'Equipo', problemDescription || 'Sin descripción');
  res.json(diagnostic);
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, assetName, title, dueDate, smtpConfig } = req.body;

  try {
    // Si no hay configuración SMTP, usamos un simulador de Etheral para pruebas
    let transporter;
    let isDemo = false;

    if (smtpConfig && smtpConfig.user && smtpConfig.pass) {
      transporter = nodemailer.createTransport({
        host: smtpConfig.host || 'smtp.gmail.com',
        port: parseInt(smtpConfig.port) || 587,
        secure: smtpConfig.secure || false,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      });
    } else {
      // Fallback a cuenta de prueba de Ethereal
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isDemo = true;
    }

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">MantechPro: Alerta de Mantenimiento</h2>
        <p>Hola,</p>
        <p>Tu activo <strong>${assetName}</strong> requiere atención pronto.</p>
        <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ Tarea: ${title}</p>
          <p style="margin: 5px 0 0 0; color: #b45309;">Fecha límite sugerida: ${dueDate}</p>
        </div>
        <p>Por favor, ingresa a la aplicación para cotizar con un técnico especializado.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">MantechPro Panamá - Sistema de Gestión Inteligente</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: smtpConfig?.from || '"MantechPro Alertas" <alertas@mantechpro.com>',
      to,
      subject,
      html: htmlContent,
    });

    console.log('✅ Correo enviado:', info.messageId);

    if (isDemo) {
      return res.json({
        success: true,
        isDemo: true,
        previewUrl: nodemailer.getTestMessageUrl(info)
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
});

app.post('/api/send-report', async (req, res) => {
  const { to, reportData } = req.body;

  console.log(`📊 Generando reporte para: ${to}`);

  try {
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    let transporter;
    let isDemo = false;

    // Lógica de transporte inteligente
    if (smtpConfig.auth.user && smtpConfig.auth.pass) {
      console.log("📨 Usando configuración SMTP real...");
      transporter = nodemailer.createTransport({
        host: smtpConfig.host || 'smtp.gmail.com',
        port: smtpConfig.port,
        secure: smtpConfig.port === 465,
        auth: smtpConfig.auth
      });
    } else {
      console.log("🧪 Configuración SMTP no detectada. Intentando simulador Ethereal...");
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        isDemo = true;
      } catch (etherealErr) {
        console.warn("⚠️ No se pudo conectar con Ethereal (¿Sin internet?). Entrando en MODO LOCAL.");
        return res.json({
          success: true,
          message: "Reporte generado localmente. No se pudo enviar email por falta de conexión al servidor SMTP.",
          localMode: true
        });
      }
    }

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d0e12; padding: 40px; color: white;">
        <div style="max-width: 600px; margin: auto; background: #121317; border: 1px solid #2a2b2f; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          <div style="background: linear-gradient(to right, #5d3cfe, #c7bfff); padding: 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; color: white;">Cierre de Mes</h1>
            <p style="margin: 10px 0 0; font-weight: bold; opacity: 0.9; text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: white;">Nodo Central MantechPro</p>
          </div>
          <div style="padding: 40px;">
            <p style="font-size: 16px; color: #c8c4d9;">Hola, <strong>Administrador Master</strong>,</p>
            <p style="color: #c8c4d9;">Se ha generado con éxito la certificación financiera del periodo:</p>
            <h2 style="color: #52ffac; font-size: 24px; margin: 20px 0;">${reportData.month.toUpperCase()} ${reportData.year}</h2>

            <div style="background: #0d0e12; border: 1px solid #2a2b2f; border-radius: 16px; padding: 25px; margin: 30px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #474556; font-size: 10px; font-weight: 900; text-transform: uppercase;">Comisiones</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 900; color: white;">$${reportData.totalCommissions.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #474556; font-size: 10px; font-weight: 900; text-transform: uppercase;">Membresías</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 900; color: white;">$${reportData.totalSubscriptions.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                </tr>
                <tr style="border-top: 1px solid #2a2b2f;">
                  <td style="padding: 20px 0 0; font-weight: 900; color: #52ffac; font-size: 14px;">UTILIDAD NETA</td>
                  <td style="padding: 20px 0 0; text-align: right; font-weight: 900; color: #52ffac; font-size: 20px;">$${reportData.netUtility.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 12px; color: #474556; line-height: 1.6; text-align: center; font-style: italic;">
              "Este reporte ha sido verificado digitalmente y es confidencial."
            </p>
          </div>
          <div style="background: #1c1d21; padding: 20px; text-align: center; font-size: 10px; color: #474556; text-transform: uppercase; letter-spacing: 1px;">
            MantechPro Industries Inc. • Ciudad de Panamá • ${new Date().getFullYear()}
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"MantechPro Finanzas" <finanzas@mantechpro.com>',
      to,
      subject: `📜 REPORTE MASTER: Cierre de Mes ${reportData.month} ${reportData.year}`,
      html: htmlContent,
    });

    if (isDemo) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('🔗 URL de vista previa del reporte:', previewUrl);
      return res.json({ success: true, previewUrl });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error crítico en el endpoint de reporte:', error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al procesar el email.",
      details: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MantechPro: Diagnóstico Pseudo-Inteligente Activo en puerto ${PORT}`);
});
