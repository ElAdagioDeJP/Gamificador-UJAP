// testSocket.js
const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Conectado:', socket.id);
  socket.emit('join_queue', { name: 'TestUser', id: 123 });
});

socket.on('duel_found', (data) => {
  console.log('Duelo encontrado:', data);
  // Simula responder la primera pregunta
  if (data.questions && data.questions.length > 0) {
    const firstQuestion = data.questions[0];
    const firstOption = firstQuestion.options[0];
    setTimeout(() => {
      socket.emit('submit_answer', {
        duelId: data.duelId,
        questionId: firstQuestion.id,
        answerId: firstOption.id
      });
    }, 1000);
  }
});

socket.on('answer_result', (data) => {
  console.log('Resultado de la respuesta:', data);
});

socket.on('duel_end', (data) => {
  console.log('Duelo terminado:', data);
  socket.disconnect();
});
