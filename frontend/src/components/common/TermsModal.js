import React from 'react';
import './TermsModal.css';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="terms-modal-overlay" onClick={onClose}>
      <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="terms-modal-header">
          <h2 className="terms-modal-title">📋 Términos y Condiciones</h2>
          <button className="terms-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="terms-modal-body">
          <div className="terms-section">
            <h3>1. Aceptación de los Términos</h3>
            <p>
              Al utilizar StudyBooster, usted acepta estos términos y condiciones en su totalidad. 
              Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestra plataforma.
            </p>
          </div>

          <div className="terms-section">
            <h3>2. Descripción del Servicio</h3>
            <p>
              StudyBooster es una plataforma educativa gamificada que permite a estudiantes y profesores:
            </p>
            <ul>
              <li>Participar en duelos académicos con otros estudiantes</li>
              <li>Completar misiones diarias y tareas asignadas por profesores</li>
              <li>Ganar puntos, experiencia y subir de nivel</li>
              <li>Canjear recompensas académicas y físicas</li>
              <li>Escanear códigos QR en eventos universitarios</li>
              <li>Gestionar tareas personales con integración a Google Calendar</li>
              <li>Acceder a tablas de clasificación y logros</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>3. Registro y Cuentas de Usuario</h3>
            <p>
              Para usar StudyBooster, debe registrarse con un email institucional válido. 
              Al registrarse, usted se compromete a:
            </p>
            <ul>
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener la confidencialidad de su cuenta</li>
              <li>Notificar inmediatamente cualquier uso no autorizado</li>
              <li>Ser responsable de todas las actividades en su cuenta</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>4. Datos Personales y Privacidad</h3>
            <p>
              Recopilamos y procesamos los siguientes datos personales:
            </p>
            <ul>
              <li><strong>Datos de identificación:</strong> Nombre completo, email institucional, nombre de usuario</li>
              <li><strong>Datos académicos:</strong> Materias inscritas, calificaciones, progreso académico</li>
              <li><strong>Datos de gamificación:</strong> Puntos, nivel, experiencia, rachas, logros</li>
              <li><strong>Datos de actividad:</strong> Fecha de última actividad, historial de duelos, misiones completadas</li>
              <li><strong>Datos opcionales:</strong> Sexo, avatar, universidad, carrera</li>
              <li><strong>Datos de integración:</strong> ID de eventos de Google Calendar (si se autoriza)</li>
            </ul>
            <p>
              Sus datos se utilizan para proporcionar el servicio, mejorar la experiencia educativa 
              y generar estadísticas anónimas. No compartimos datos personales con terceros sin su consentimiento.
            </p>
          </div>

          <div className="terms-section">
            <h3>5. Sistema de Gamificación</h3>
            <p>
              StudyBooster utiliza elementos de gamificación para motivar el aprendizaje:
            </p>
            <ul>
              <li><strong>Puntos:</strong> Se otorgan por completar misiones y ganar duelos</li>
              <li><strong>Experiencia:</strong> Acumulable para subir de nivel</li>
              <li><strong>Rachas:</strong> Días consecutivos de actividad</li>
              <li><strong>Insignias:</strong> Logros especiales por hitos académicos</li>
              <li><strong>Recompensas:</strong> Canjeables por puntos (físicas y académicas)</li>
            </ul>
            <p>
              Los puntos y recompensas son virtuales y no tienen valor monetario real. 
              Las recompensas académicas requieren aprobación del profesor correspondiente.
            </p>
          </div>

          <div className="terms-section">
            <h3>6. Duelos y Competencias</h3>
            <p>
              Los duelos son competencias académicas entre estudiantes:
            </p>
            <ul>
              <li>Pueden ser individuales (Clásicos) o por equipos (Cooperativos)</li>
              <li>Se basan en preguntas de materias específicas</li>
              <li>Los puntos apostados se transfieren al ganador</li>
              <li>Debe mantener un comportamiento respetuoso durante las competencias</li>
              <li>Está prohibido el uso de ayudas externas o trampas</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>7. Misiones y Tareas Académicas</h3>
            <p>
              Las misiones pueden ser:
            </p>
            <ul>
              <li><strong>Diarias:</strong> Actividades opcionales que otorgan puntos y experiencia</li>
              <li><strong>Tareas:</strong> Asignadas por profesores con peso en calificaciones</li>
            </ul>
            <p>
              Las tareas asignadas por profesores tienen peso real en su calificación académica. 
              El incumplimiento puede afectar su rendimiento académico.
            </p>
          </div>

          <div className="terms-section">
            <h3>8. Códigos QR y Eventos</h3>
            <p>
              Los códigos QR en eventos universitarios:
            </p>
            <ul>
              <li>Otorgan puntos y experiencia al ser escaneados</li>
              <li>Solo pueden ser escaneados una vez por usuario</li>
              <li>Tienen fechas de expiración y límites de uso</li>
              <li>Deben ser escaneados en el evento correspondiente</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>9. Integración con Google Calendar</h3>
            <p>
              Si autoriza la integración con Google Calendar:
            </p>
            <ul>
              <li>Sus tareas personales se sincronizarán con su calendario</li>
              <li>No accedemos a otros eventos de su calendario</li>
              <li>Puede revocar el acceso en cualquier momento</li>
              <li>Los datos se procesan según la política de privacidad de Google</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>10. Conducta del Usuario</h3>
            <p>
              Está prohibido:
            </p>
            <ul>
              <li>Usar lenguaje ofensivo, discriminatorio o inapropiado</li>
              <li>Intentar hackear, manipular o explotar la plataforma</li>
              <li>Compartir cuentas o credenciales de acceso</li>
              <li>Usar bots, scripts o herramientas automatizadas</li>
              <li>Interferir con el funcionamiento normal de la plataforma</li>
              <li>Violar derechos de propiedad intelectual</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>11. Suspensión y Terminación</h3>
            <p>
              Podemos suspender o terminar su cuenta si:
            </p>
            <ul>
              <li>Viola estos términos y condiciones</li>
              <li>Participa en conducta inapropiada</li>
              <li>Usa la plataforma de manera fraudulenta</li>
              <li>No cumple con las políticas académicas de su institución</li>
            </ul>
            <p>
              En caso de suspensión, sus datos se conservarán según las políticas de retención.
            </p>
          </div>

          <div className="terms-section">
            <h3>12. Propiedad Intelectual</h3>
            <p>
              StudyBooster y todo su contenido son propiedad de la Universidad. 
              Los usuarios conservan los derechos sobre sus contribuciones académicas, 
              pero otorgan licencia para su uso educativo en la plataforma.
            </p>
          </div>

          <div className="terms-section">
            <h3>13. Limitación de Responsabilidad</h3>
            <p>
              StudyBooster se proporciona "tal como está". No garantizamos:
            </p>
            <ul>
              <li>Disponibilidad continua del servicio</li>
              <li>Ausencia de errores o interrupciones</li>
              <li>Resultados académicos específicos</li>
              <li>Compatibilidad con todos los dispositivos</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>14. Modificaciones</h3>
            <p>
              Podemos modificar estos términos en cualquier momento. 
              Los cambios se notificarán a través de la plataforma y entrarán en vigor 
              inmediatamente. Su uso continuado constituye aceptación de los nuevos términos.
            </p>
          </div>

          <div className="terms-section">
            <h3>15. Ley Aplicable</h3>
            <p>
              Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. 
              Cualquier disputa se resolverá en los tribunales competentes de Venezuela.
            </p>
          </div>

          <div className="terms-section">
            <h3>16. Contacto</h3>
            <p>
              Para preguntas sobre estos términos, contacte a:
            </p>
            <ul>
              <li><strong>Email:</strong> legal@studybooster.edu.ve</li>
              <li><strong>Teléfono:</strong> +58 212-555-0123</li>
              <li><strong>Dirección:</strong> Universidad José Antonio Páez, Av. Principal, Valencia, Venezuela</li>
            </ul>
          </div>

          <div className="terms-footer">
            <p className="terms-last-updated">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-VE')}
            </p>
            <p className="terms-version">
              <strong>Versión:</strong> 1.0
            </p>
          </div>
        </div>
        
        <div className="terms-modal-footer">
          <button className="terms-btn terms-btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="terms-btn terms-btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
