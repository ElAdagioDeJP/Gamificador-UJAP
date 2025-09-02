// backend/src/duelManager.js
/**
 * Lógica de duelos en tiempo real usando Socket.IO (con MySQL)
 * - Emparejamiento de jugadores
 * - Selección de preguntas desde la BD (fallback a JSON si no hay suficientes)
 * - Persistencia en tablas Duelos y Duelo_Participantes
 * - Manejo de respuestas, puntuación y cierre del duelo
 */

const db = require('../models');
const { sequelize } = db;
const PreguntaDuelo = db.PreguntaDuelo;
const RespuestaDuelo = db.RespuestaDuelo;

const waitingPlayers = [];
// activeDuels: Map<duelDbId, { roomName, player1, player2, questions, scores, currentQuestionIndex }>
const activeDuels = new Map();

function chooseRandom(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

async function getQuestionsFromDB(numQuestions = 5, idMateria = null) {
  const where = idMateria ? { id_materia: idMateria } : {};
  const rows = await PreguntaDuelo.findAll({
    where,
    include: [{ model: RespuestaDuelo, as: 'opciones' }],
  });
  if (!rows || rows.length === 0) return [];
  const selected = chooseRandom(rows, Math.min(numQuestions, rows.length));
  return selected.map((q) => ({
    id: q.id_pregunta,
    id_materia: q.id_materia,
    text: q.enunciado,
    options: q.opciones.map((o) => ({ id: o.id_respuesta, text: o.texto_respuesta, isCorrect: !!o.es_correcta })),
  }));
}

async function getRandomQuestions(numQuestions = 5, idMateria = null) {
  // Primero intentamos desde la BD
  try {
    const fromDB = await getQuestionsFromDB(numQuestions, idMateria);
    if (fromDB.length >= Math.min(1, numQuestions)) {
      return fromDB;
    }
  } catch (err) {
    console.error('Error obteniendo preguntas desde BD:', err);
  }
  // Fallback a JSON local
  const fs = require('fs');
  const path = require('path');
  const questionsPath = path.join(__dirname, 'questions.json');
  try {
    const data = fs.readFileSync(questionsPath, 'utf8');
    const json = JSON.parse(data);
    const selected = chooseRandom(json, Math.min(numQuestions, json.length));
    return selected;
  } catch (err) {
    console.error('Error leyendo questions.json:', err);
    return [];
  }
}

function extractUserId(profile) {
  return (
    profile?.id_usuario || profile?.id || profile?.userId || null
  );
}

function setupDuelSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join_queue', async (userProfile = {}) => {
      const userId = extractUserId(userProfile);
      const preferredMateria = userProfile?.preferredMateria || userProfile?.id_materia || null;
      const apuesta = Number(userProfile?.apuesta || 10);
      const player = { id: socket.id, userId, profile: userProfile, socket };

      if (waitingPlayers.length > 0) {
        const opponent = waitingPlayers.shift();
        // Obtener preguntas; si hay preferencia de materia, úsala; si no, cualquiera
        const questions = await getRandomQuestions(5, preferredMateria || opponent.profile?.preferredMateria || null);
        const selectedMateria = questions[0]?.id_materia || preferredMateria || opponent.profile?.preferredMateria || null;

        // Crear duelo en BD
        let duelDbId = null;
        try {
          const [result] = await sequelize.query(
            `INSERT INTO Duelos (tipo_duelo, id_materia, estado, puntos_apostados)
             VALUES ('CLASICO', :id_materia, 'EN_JUEGO', :puntos)`,
            { replacements: { id_materia: selectedMateria, puntos: apuesta } }
          );
          duelDbId = result?.insertId || result; // mysql2 -> insertId
          // Validar que ambos tengan userId válido
          if (player.userId && opponent.userId) {
            await sequelize.query(
              `INSERT INTO Duelo_Participantes (id_duelo, id_usuario, equipo, puntuacion_final)
               VALUES (:id_duelo, :u1, NULL, 0), (:id_duelo, :u2, NULL, 0)`,
              { replacements: { id_duelo: duelDbId, u1: player.userId, u2: opponent.userId } }
            );
          } else {
            console.error('Error: userId inválido para uno de los participantes. No se inserta en BD.');
          }
        } catch (e) {
          console.error('Error creando duelo en BD:', e);
          // Si falla la BD, seguimos el duelo en memoria, pero sin persistir
        }

        const duelId = duelDbId || `${player.id}-${opponent.id}`; // usar id BD si está disponible
        const roomName = `duel:${duelId}`;
        const duelRoom = {
          duelId,
          roomName,
          player1: player,
          player2: opponent,
          questions,
          scores: { [player.id]: 0, [opponent.id]: 0 },
          currentQuestionIndex: 0,
          selectedMateria,
        };
        activeDuels.set(duelId, duelRoom);
        socket.join(roomName);
        opponent.socket.join(roomName);
        io.to(roomName).emit('duel_found', {
          duelId,
          players: {
            [player.id]: player.profile,
            [opponent.id]: opponent.profile,
          },
          questions: questions.map((q) => ({
            id: q.id,
            text: q.text,
            options: (q.options || []).map((o) => ({ id: o.id, text: o.text })), // ocultar isCorrect
          })),
        });
      } else {
        waitingPlayers.push(player);
      }
    });

    socket.on('submit_answer', async ({ duelId, questionId, answerId }) => {
      const duel = activeDuels.get(duelId);
      if (!duel) return;
      const currentQuestion = duel.questions[duel.currentQuestionIndex];
      if (!currentQuestion || currentQuestion.id !== questionId) return;
      const selectedOption = (currentQuestion.options || []).find((o) => o.id === answerId);
      const correctOption = (currentQuestion.options || []).find((o) => o.isCorrect);
      const isCorrect = !!(selectedOption && selectedOption.isCorrect);
      if (isCorrect) {
        duel.scores[socket.id] = (duel.scores[socket.id] || 0) + 1;
      }
      io.to(duel.roomName).emit('answer_result', {
        questionId,
        correctAnswerId: correctOption ? correctOption.id : null,
        correctPlayerId: isCorrect ? socket.id : null,
        scores: duel.scores,
      });
      duel.currentQuestionIndex++;
      if (duel.currentQuestionIndex >= duel.questions.length) {
  const ids = Object.keys(duel.scores);
  const winnerSocketId = ids.reduce((a, b) => (duel.scores[a] > duel.scores[b] ? a : b));
  const finalScores = duel.scores;
  // Construir playerNames usando los perfiles
  const playerNames = {};
  playerNames[duel.player1.id] = duel.player1.profile?.nombre_usuario || duel.player1.profile?.nombre || duel.player1.profile?.name || 'Jugador 1';
  playerNames[duel.player2.id] = duel.player2.profile?.nombre_usuario || duel.player2.profile?.nombre || duel.player2.profile?.name || 'Jugador 2';
  io.to(duel.roomName).emit('duel_end', { winnerId: winnerSocketId, finalScores, playerNames });

        // Persistir resultados si el duelo existe en BD (cuando duelId es numérico)
        if (!isNaN(Number(duel.duelId))) {
          try {
            const p1UserId = duel.player1.userId || 0;
            const p2UserId = duel.player2.userId || 0;
            const winnerUserId = winnerSocketId === duel.player1.id ? p1UserId : p2UserId;
            await sequelize.query(
              `UPDATE Duelos SET estado = 'FINALIZADO', id_ganador = :winner WHERE id_duelo = :id`,
              { replacements: { winner: winnerUserId, id: duel.duelId } }
            );
            // Actualizar puntuaciones finales
            await sequelize.query(
              `UPDATE Duelo_Participantes SET puntuacion_final = :score WHERE id_duelo = :id AND id_usuario = :u1`,
              { replacements: { score: finalScores[duel.player1.id] || 0, id: duel.duelId, u1: p1UserId } }
            );
            await sequelize.query(
              `UPDATE Duelo_Participantes SET puntuacion_final = :score WHERE id_duelo = :id AND id_usuario = :u2`,
              { replacements: { score: finalScores[duel.player2.id] || 0, id: duel.duelId, u2: p2UserId } }
            );
          } catch (e) {
            console.error('Error actualizando resultados de duelo en BD:', e);
          }
        }

        activeDuels.delete(duel.duelId);
      }
    });

    socket.on('disconnect', async () => {
      // Sacar de la cola si estaba esperando
      for (let i = 0; i < waitingPlayers.length; i++) {
        if (waitingPlayers[i].id === socket.id) {
          waitingPlayers.splice(i, 1);
          break;
        }
      }
      // Si estaba en un duelo activo, cancelarlo (soft)
      for (const [duelId, duel] of activeDuels.entries()) {
        if (duel.player1.id === socket.id || duel.player2.id === socket.id) {
          io.to(duel.roomName).emit('duel_end', { winnerId: null, finalScores: duel.scores, reason: 'disconnect' });
          if (!isNaN(Number(duelId))) {
            try {
              await sequelize.query(
                `UPDATE Duelos SET estado = 'CANCELADO' WHERE id_duelo = :id AND estado <> 'FINALIZADO'`,
                { replacements: { id: duelId } }
              );
            } catch (e) {
              console.error('Error cancelando duelo en BD tras disconnect:', e);
            }
          }
          activeDuels.delete(duelId);
          break;
        }
      }
    });
  });
}

module.exports = setupDuelSocket;
