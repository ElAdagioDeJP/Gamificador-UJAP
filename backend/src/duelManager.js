// backend/src/duelManager.js
/**
 * Lógica de duelos en tiempo real usando Socket.IO
 * - Emparejamiento de jugadores
 * - Selección de preguntas de selección múltiple
 * - Manejo de respuestas y puntuación
 */

const db = require('../models');
const PreguntaDuelo = db.PreguntaDuelo;
const RespuestaDuelo = db.RespuestaDuelo;

const waitingPlayers = [];
const activeDuels = new Map();

async function getRandomQuestions(numQuestions = 5) {
  // Leer preguntas desde archivo JSON
  const fs = require('fs');
  const path = require('path');
  const questionsPath = path.join(__dirname, 'questions.json');
  let questions = [];
  try {
    const data = fs.readFileSync(questionsPath, 'utf8');
    questions = JSON.parse(data);
  } catch (err) {
    console.error('Error leyendo questions.json:', err);
  }
  // Selecciona preguntas aleatorias
  const shuffled = questions.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numQuestions);
  console.log('Preguntas seleccionadas:', JSON.stringify(selected, null, 2));
  return selected;
}

function setupDuelSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join_queue', async (userProfile) => {
      const player = { id: socket.id, profile: userProfile, socket };
      if (waitingPlayers.length > 0) {
        const opponent = waitingPlayers.shift();
        const duelId = `${player.id}-${opponent.id}`;
        const questions = await getRandomQuestions();
        const duelRoom = {
          player1: player,
          player2: opponent,
          questions,
          scores: { [player.id]: 0, [opponent.id]: 0 },
          currentQuestionIndex: 0
        };
        activeDuels.set(duelId, duelRoom);
        socket.join(duelId);
        opponent.socket.join(duelId);
        io.to(duelId).emit('duel_found', {
          duelId,
          players: {
            [player.id]: player.profile,
            [opponent.id]: opponent.profile
          },
          questions: questions.map(q => ({ id: q.id, text: q.text, options: q.options.map(o => ({ id: o.id, text: o.text })) }))
        });
      } else {
        waitingPlayers.push(player);
      }
    });

    socket.on('submit_answer', ({ duelId, questionId, answerId }) => {
      const duel = activeDuels.get(duelId);
      if (!duel) return;
      const currentQuestion = duel.questions[duel.currentQuestionIndex];
      const selectedOption = currentQuestion.options.find(o => o.id === answerId);
      const isCorrect = selectedOption && selectedOption.isCorrect;
      if (isCorrect) {
        duel.scores[socket.id]++;
      }
      io.to(duelId).emit('answer_result', {
        questionId,
        correctAnswerId: currentQuestion.options.find(o => o.isCorrect).id,
        correctPlayerId: isCorrect ? socket.id : null,
        scores: duel.scores
      });
      duel.currentQuestionIndex++;
      if (duel.currentQuestionIndex >= duel.questions.length) {
        const winnerId = Object.keys(duel.scores).reduce((a, b) => duel.scores[a] > duel.scores[b] ? a : b);
        io.to(duelId).emit('duel_end', {
          winnerId,
          finalScores: duel.scores
        });
        activeDuels.delete(duelId);
      }
    });

    socket.on('disconnect', () => {
      // Elimina de la cola y limpia duelos activos si corresponde
      for (let i = 0; i < waitingPlayers.length; i++) {
        if (waitingPlayers[i].id === socket.id) {
          waitingPlayers.splice(i, 1);
          break;
        }
      }
      // Opcional: lógica para terminar duelos si un jugador se desconecta
    });
  });
}

module.exports = setupDuelSocket;
