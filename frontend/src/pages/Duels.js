import { useGame } from "../context/GameContext"
import { useAuth } from "../context/AuthContext"
import Card from "../components/common/Card"
import Button from "../components/common/Button"
import LoadingSpinner from "../components/common/LoadingSpinner"
import socket from "../services/socketService"
import { useState, useEffect, useRef } from "react"
import { playSound } from "../utils/duelSounds"
import AvatarPixel from "../components/common/AvatarPixel";
import "../styles/Duels.css"
import "../styles/DuelModal.css"

const Duels = () => {
  // Declaración de todos los estados primero
  const [duelModalOpen, setDuelModalOpen] = useState(false);
  const [duelQuestions, setDuelQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [timer, setTimer] = useState(10);
  const timerRef = useRef();
  const selectedOptionRef = useRef(null);
  const [duelRoomId, setDuelRoomId] = useState(null);
  const [duelOpponent, setDuelOpponent] = useState("");
  const [duelScores, setDuelScores] = useState({});
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [duelResultModal, setDuelResultModal] = useState(null);
  // const waitingAudioRef = useRef(null);
  const { gameData, loading } = useGame();
  const { loadGameData } = useGame();
  const { user } = useAuth();

  // Temporizador para cada pregunta
  useEffect(() => {
    if (!duelModalOpen || !duelQuestions[currentQuestion]) return;
    // Solo reiniciar el timer cuando llega una nueva pregunta o se abre el modal
    if (selectedOptionRef.current === null) {
      setTimer(10);
    }
    let questionAdvanced = false;
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1 && !questionAdvanced) {
          questionAdvanced = true;
          clearInterval(timerRef.current);
          if (!selectedOptionRef.current) {
            // Timeout: enviar respuesta nula para que el backend cuente como incorrecta
            setSelectedOption("timeout");
            try {
              const q = duelQuestions[currentQuestion];
              socket.emit("submit_answer", { duelId: duelRoomId, questionId: q.id, answerId: null });
            } catch {}
            // No avanzamos aquí; esperamos a answer_result para decidir
          } else {
            // Ya respondió: no avanzar aquí; esperar answer_result
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [duelModalOpen, currentQuestion, duelQuestions, duelRoomId]);

  // Mantener en un ref la opción seleccionada localmente para usarla en listeners sin re-render
  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  // Este efecto maneja los listeners de socket (debe declararse antes de cualquier return condicional)

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

  // Gestionar listeners de sockets con cleanup para evitar duplicados
  useEffect(() => {
    const onDuelFound = (data) => {
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
    };

    const onAnswerResult = (data) => {
      setDuelScores(data.scores);
      setAnswerResult(data.correctAnswerId);
      clearInterval(timerRef.current);
      // Sonidos solo en el cliente que respondió esta pregunta
      if (data.answeringPlayerId === socket.id) {
        const mySelection = selectedOptionRef.current;
        const iAnswered = mySelection !== null && mySelection !== "timeout";
        if (iAnswered) {
          if (data.isCorrect) {
            playSound("correct");
          } else {
            playSound("wrong");
          }
        }
      }
      setTimeout(() => {
        setSelectedOption(null);
        setAnswerResult(null);
        if (data.shouldAdvance) {
          setCurrentQuestion((prev) => prev + 1);
          setTimer(10);
        } else {
          // No avanzar aún: el otro jugador todavía puede responder
          setTimer((t) => (t > 2 ? t : 3));
        }
      }, 1200);
    };

    const onDuelEnd = (data) => {
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
      setDuelModalOpen(false);
      setWaitingForOpponent(false);
      setDuelQuestions([]);
      setCurrentQuestion(0);
      setSelectedOption(null);
      setDuelScores({});
      setDuelRoomId(null);
      setDuelOpponent("");
      // Refrescar game data tras finalizar (ligero delay para asegurar persistencia)
      setTimeout(() => {
        loadGameData();
      }, 800);
    };

    socket.off("duel_found", onDuelFound).on("duel_found", onDuelFound);
    socket.off("answer_result", onAnswerResult).on("answer_result", onAnswerResult);
    socket.off("duel_end", onDuelEnd).on("duel_end", onDuelEnd);

    return () => {
      socket.off("duel_found", onDuelFound);
      socket.off("answer_result", onAnswerResult);
      socket.off("duel_end", onDuelEnd);
    };
  }, [duelOpponent, loadGameData]);

  // Early return por loading: debe ir después de todos los hooks
  if (loading) {
    return <LoadingSpinner />
  }

  const { duels } = gameData
  const activeDuels = duels.filter((duel) => duel.status === "active")
  const completedDuels = duels.filter((duel) => duel.status === "completed")

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

  

  // Modal de preguntas
  const renderDuelModal = () => {
    if (waitingForOpponent) {
      const handleCancelQueue = () => {
        socket.emit("leave_queue");
        setWaitingForOpponent(false);
      };
      return (
        <div className="duel-modal">
          <div className="modal-content">
            <h2 style={{ color: '#3b82f6', marginBottom: '1.5rem' }}>Esperando a otro participante...</h2>
            <p style={{ fontSize: '1.1rem', color: '#222' }}>Cuando otro estudiante se una, comenzará el duelo.</p>
            <div style={{ marginTop: '2rem' }}>
              <span className="answer-info">⏳</span>
            </div>
            <button
              style={{marginTop:'2rem', padding:'0.7rem 1.5rem', background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}
              onClick={handleCancelQueue}
            >
              Cancelar búsqueda
            </button>
          </div>
        </div>
      );
    }
    // Validación para evitar error al finalizar duelo
    if (!duelModalOpen || duelQuestions.length === 0 || !duelQuestions[currentQuestion]) return null;
    const q = duelQuestions[currentQuestion];

    return (
      <div className="duel-modal">
        <div className="modal-content">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
            <h2 style={{color:'#3b82f6'}}>Pregunta {currentQuestion + 1} de {duelQuestions.length}</h2>
            <div style={{fontWeight:'bold', fontSize:'1.2rem', color:'#10b981'}}>Puntos: {duelScores && duelScores[socket?.id] ? duelScores[socket.id] : 0}</div>
            <div style={{fontWeight:'bold', fontSize:'1.2rem', color:'#ef4444'}}>⏰ {timer}s</div>
          </div>
          <h3 style={{marginBottom: '1rem', color: '#10b981'}}>VS {duelOpponent}</h3>
          <p className="question-text">{q.text}</p>
          <div className="options-list">
            {q.options.map((opt) => {
              let btnColor = '#f3f4f6';
              if (selectedOption) {
                if (answerResult && opt.id === answerResult) btnColor = '#22c55e'; // verde correcta
                else if (selectedOption === opt.id && opt.id !== answerResult) btnColor = '#ef4444'; // rojo incorrecta
                else if (selectedOption === "timeout") btnColor = '#ef4444'; // tiempo agotado
              }
              return (
                <button
                  key={opt.id}
                  style={{
                    background: btnColor,
                    color: btnColor === '#f3f4f6' ? '#222' : '#fff',
                    border: 'none',
                    cursor: selectedOption ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    transition: 'background 0.3s',
                  }}
                  onClick={() => handleAnswer(opt.id)}
                  disabled={!!selectedOption}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
          {selectedOption && selectedOption !== "timeout" && <p className="answer-info">Esperando al oponente...</p>}
          {selectedOption === "timeout" && <p className="answer-info" style={{color:'#ef4444'}}>¡Tiempo agotado!</p>}
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
                      {/* Avatar basado en iniciales o imagen si llega */}
                      <AvatarPixel
                        name={duel.opponent}
                        src={duel.opponentAvatar}
                        size={50}
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
                      {/* Avatar basado en iniciales o imagen si llega */}
                      <AvatarPixel
                        name={duel.opponent}
                        src={duel.opponentAvatar}
                        size={50}
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
          <Button variant="primary" onClick={() => { setDuelResultModal(null); loadGameData(); }}>
            Aceptar
          </Button>
          {/* Eliminado script inline; refresco explícito al cerrar */}
        </div>
      </div>
    )}
  </div>
  )
}

export default Duels
