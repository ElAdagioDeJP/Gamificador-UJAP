import { useGame } from "../context/GameContext"
import { useAuth } from "../context/AuthContext"
import Card from "../components/common/Card"
import Button from "../components/common/Button"
import LoadingSpinner from "../components/common/LoadingSpinner"
import socket from "../services/socketService"
import { useState, useEffect, useRef } from "react"
import { playSound } from "../utils/duelSounds"
import "../styles/Duels.css"
import "../styles/DuelModal.css"

const Duels = () => {
  const { gameData, loading } = useGame();
  const { loadGameData } = useGame();
  const { user } = useAuth();
  const [duelModalOpen, setDuelModalOpen] = useState(false)
  const [duelQuestions, setDuelQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [duelRoomId, setDuelRoomId] = useState(null)
  const [duelOpponent, setDuelOpponent] = useState("")
  const [duelScores, setDuelScores] = useState({})
  const [waitingForOpponent, setWaitingForOpponent] = useState(false)
  const [duelResultModal, setDuelResultModal] = useState(null)
  // const waitingAudioRef = useRef(null)

  if (loading) {
    return <LoadingSpinner />
  }

  const { duels } = gameData
  const activeDuels = duels.filter((duel) => duel.status === "active")
  const completedDuels = duels.filter((duel) => duel.status === "completed")

  const getStatusColor = (status, result) => {
    if (status === "active") return "#3b82f6"
    if (result === "won") return "#10b981"
    if (result === "lost") return "#ef4444"
    return "#6b7280"
  }

  const getStatusLabel = (status, result) => {
    if (status === "active") return "🔄 En Progreso"
    if (result === "won") return "🏆 Ganado"
    if (result === "lost") return "❌ Perdido"
    return "⏸️ Finalizado"
  }

  // Emparejamiento y lógica de duelo
  const handleStartDuel = () => {
    socket.connect();
    // Enviar perfil completo: id_usuario y nombre_usuario (para backend)
    socket.emit("join_queue", {
      id_usuario: user?.id,
      nombre_usuario: user?.name,
      nombre: user?.name,
      username: user?.name || "Estudiante"
    });
    setWaitingForOpponent(true);
  }

  // Escuchar emparejamiento y preguntas
    socket.off("duel_found").on("duel_found", (data) => {
  // Ya no se reproduce ni se detiene música de espera
      setDuelRoomId(data.duelId);
      // Determinar el nombre del oponente (excluyendo el propio socket.id)
      const mySocketId = socket.id;
      let opponentName = "Oponente";
      if (data.players) {
        const opponentEntry = Object.entries(data.players).find(([id]) => id !== mySocketId);
        if (opponentEntry && opponentEntry[1]) {
          const profile = opponentEntry[1].profile || opponentEntry[1];
          opponentName = profile.nombre_usuario || profile.nombre || profile.name || "Oponente";
        }
      }
      setDuelOpponent(opponentName);
      setDuelQuestions(data.questions);
      setCurrentQuestion(0);
      setDuelScores(data.scores);
      setWaitingForOpponent(false);
      setDuelModalOpen(true);
    })

  // Enviar respuesta
  const handleAnswer = (optionId) => {
    setSelectedOption(optionId)
    // Efecto visual: animación de selección
    const btn = document.querySelector(`button[key='${optionId}']`)
    if (btn) {
      btn.classList.add("pulse")
      setTimeout(() => btn.classList.remove("pulse"), 600)
    }
    socket.emit("submit_answer", {
      duelId: duelRoomId,
      questionId: duelQuestions[currentQuestion].id,
      answerId: optionId,
    })
  }

  // Recibir resultado de respuesta y avanzar pregunta
  socket.off("answer_result").on("answer_result", (data) => {
    setDuelScores(data.scores)
    // Sonido según respuesta
    if (data.correctPlayerId === socket.id) {
      playSound("correct")
    } else if (data.correctPlayerId) {
      playSound("wrong")
    }
    setTimeout(() => {
      setSelectedOption(null)
      setCurrentQuestion((prev) => prev + 1)
    }, 1200)
  })

  // Recibir fin de duelo
  socket.off("duel_end").on("duel_end", (data) => {
    const playerNames = data.playerNames || {};
    let scoresArr = [];
    if (data.finalScores && playerNames) {
      scoresArr = Object.entries(data.finalScores)
        .map(([id, score]) => ({ name: playerNames[id] || playerNames[id]?.nombre_usuario || playerNames[id]?.nombre || id, score }));
    } else {
      scoresArr = Object.entries(data.finalScores || {}).map(([id, score]) => ({ name: id, score }));
    }
    let empate = false;
    if (scoresArr.length === 2 && scoresArr[0].score === scoresArr[1].score) {
      empate = true;
    }
    if (empate) {
      playSound("lose");
    } else if (data.winnerId === socket.id) {
      playSound("win");
    } else {
      playSound("lose");
    }
    const winnerName = empate ? 'Empate' : (playerNames[data.winnerId] || duelOpponent || 'Desconocido');
    setDuelResultModal({ winnerName, scoresArr });
    setDuelModalOpen(false)
    setWaitingForOpponent(false)
    setDuelQuestions([])
    setCurrentQuestion(0)
    setSelectedOption(null)
    setDuelScores({})
    setDuelRoomId(null)
    setDuelOpponent("")
    // Esperar 1 segundo antes de actualizar los datos para asegurar persistencia en BD
    setTimeout(() => {
      loadGameData();
    }, 1000);
  })

  // Modal de preguntas
  const renderDuelModal = () => {
    if (waitingForOpponent) {
      return (
        <div className="duel-modal">
          <div className="modal-content">
            <h2 style={{ color: '#3b82f6', marginBottom: '1.5rem' }}>Esperando a otro participante...</h2>
            <p style={{ fontSize: '1.1rem', color: '#222' }}>Cuando otro estudiante se una, comenzará el duelo.</p>
            <div style={{ marginTop: '2rem' }}>
              <span className="answer-info">⏳</span>
            </div>
          </div>
        </div>
      )
    }
    if (!duelModalOpen || duelQuestions.length === 0) return null
    const q = duelQuestions[currentQuestion]
    return (
      <div className="duel-modal">
        <div className="modal-content">
          <h2 style={{marginBottom: '1.2rem', color: '#3b82f6'}}>Pregunta {currentQuestion + 1} de {duelQuestions.length}</h2>
          <h3 style={{marginBottom: '1rem', color: '#10b981'}}>VS {duelOpponent}</h3>
          <p className="question-text">{q.text}</p>
          <div className="options-list">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                className={selectedOption === opt.id ? "selected" : ""}
                style={{
                  background: selectedOption === opt.id ? '#3b82f6' : '#f3f4f6',
                  color: selectedOption === opt.id ? '#fff' : '#222',
                  border: 'none',
                  cursor: selectedOption ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                }}
                onClick={() => handleAnswer(opt.id)}
                disabled={!!selectedOption}
              >
                {opt.text}
              </button>
            ))}
          </div>
          {selectedOption && <p className="answer-info">Esperando al oponente...</p>}
          <div style={{marginTop: '1rem', fontWeight: 'bold', color: '#10b981'}}>
            Puntaje actual: {duelScores && duelScores[socket?.id] ? duelScores[socket.id] : 0}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="duels">
      <div className="duels-header">
        <h1>⚔️ Duelos Académicos</h1>
        <p>Compite con otros estudiantes y demuestra tus conocimientos</p>
      </div>

      <div className="duels-stats">
        <Card className="duels-stat-card">
          <div className="stat-content">
            <h3>{activeDuels.length}</h3>
            <p>Duelos Activos</p>
          </div>
        </Card>
        <Card className="duels-stat-card">
          <div className="stat-content">
            <h3>{completedDuels.filter((d) => d.result === "won").length}</h3>
            <p>Victorias</p>
          </div>
        </Card>
        <Card className="duels-stat-card">
          <div className="stat-content">
            <h3>
              {completedDuels.length > 0
                ? Math.round((completedDuels.filter((d) => d.result === "won").length / completedDuels.length) * 100)
                : 0}
              %
            </h3>
            <p>Tasa de Victoria</p>
          </div>
        </Card>
      </div>

      <div className="duels-content">
        <div className="duels-section">
          <div className="section-header">
            <h2>🔄 Duelos Activos</h2>
            <Button variant="primary" size="small" onClick={handleStartDuel}>
              Nuevo Duelo
            </Button>
          </div>

          {activeDuels.length > 0 ? (
            <div className="duels-grid">
              {activeDuels.map((duel) => (
                <Card key={duel.id} className="duel-card active">
                  <div className="duel-header">
                    <div className="duel-opponent">
                      <img
                        src={`/placeholder.svg?height=50&width=50&query=${duel.opponent.replace(" ", "+")}`}
                        alt={duel.opponent}
                        className="opponent-avatar"
                      />
                      <div className="opponent-info">
                        <h3>vs {duel.opponent}</h3>
                        <p>{duel.subject}</p>
                      </div>
                    </div>
                    <span className="duel-status" style={{ backgroundColor: getStatusColor(duel.status, duel.result) }}>
                      {getStatusLabel(duel.status, duel.result)}
                    </span>
                  </div>

                  <div className="duel-scores">
                    <div className="score-item my-score">
                      <span className="score-label">Tu puntuación</span>
                      <span className="score-value">{duel.myScore}</span>
                    </div>
                    <div className="score-vs">VS</div>
                    <div className="score-item opponent-score">
                      <span className="score-label">Oponente</span>
                      <span className="score-value">{duel.opponentScore}</span>
                    </div>
                  </div>

                  <div className="duel-deadline">
                    <span className="deadline-icon">⏰</span>
                    <span>Finaliza: {new Date(duel.deadline).toLocaleDateString()}</span>
                  </div>

                  <div className="duel-actions">
                    <Button variant="primary" size="small">
                      Continuar Duelo
                    </Button>
                    <Button variant="secondary" size="small">
                      Ver Detalles
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="no-duels">
              <div className="no-duels-content">
                <span className="no-duels-icon">⚔️</span>
                <h3>No tienes duelos activos</h3>
                <p>¡Desafía a otros estudiantes y demuestra tus conocimientos!</p>
                <Button variant="primary">Buscar Oponente</Button>
              </div>
            </Card>
          )}
        </div>

        {completedDuels.length > 0 && (
          <div className="duels-section">
            <h2>📊 Historial de Duelos</h2>
            <div className="duels-grid">
              {completedDuels.map((duel) => (
                <Card key={duel.id} className={`duel-card completed ${duel.result}`}>
                  <div className="duel-header">
                    <div className="duel-opponent">
                      <img
                        src={`/placeholder.svg?height=50&width=50&query=${duel.opponent.replace(" ", "+")}`}
                        alt={duel.opponent}
                        className="opponent-avatar"
                      />
                      <div className="opponent-info">
                        <h3>vs {duel.opponent}</h3>
                        <p>{duel.subject}</p>
                      </div>
                    </div>
                    <span className="duel-status" style={{ backgroundColor: getStatusColor(duel.status, duel.result) }}>
                      {getStatusLabel(duel.status, duel.result)}
                    </span>
                  </div>

                  <div className="duel-scores">
                    <div className="score-item my-score">
                      <span className="score-label">Tu puntuación</span>
                      <span className="score-value">{duel.myScore}</span>
                    </div>
                    <div className="score-vs">VS</div>
                    <div className="score-item opponent-score">
                      <span className="score-label">Oponente</span>
                      <span className="score-value">{duel.opponentScore}</span>
                    </div>
                  </div>

                  <div className="duel-result">
                    {duel.result === "won" ? (
                      <span className="result-text won">🎉 ¡Victoria! +150 puntos</span>
                    ) : (
                      <span className="result-text lost">😔 Derrota. </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
  {renderDuelModal()}
  {duelResultModal && (
      <div className="duel-modal">
        <div className="modal-content">
          {/* <h2 style={{ color: '#3b82f6', marginBottom: '1rem' }}>Gamificador UJAP</h2> */}
          <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>¡Duelo finalizado!</h3>
          <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Ganador: {duelResultModal.winnerName}</p>
          <div style={{ marginBottom: '1.2rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Puntajes:</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {duelResultModal.scoresArr.map((p, idx) => (
                <li key={idx} style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{p.name === gameData?.user?.nombre ? `${p.name} (Tú)` : p.name}:</span> {p.score}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="primary" onClick={() => setDuelResultModal(null)}>
            Aceptar
          </Button>
          {/* Actualizar datos al cerrar el modal de resultados */}
          <script>
            {setDuelResultModal === null && loadGameData()}
          </script>
        </div>
      </div>
    )}
  </div>
  )
}

export default Duels
