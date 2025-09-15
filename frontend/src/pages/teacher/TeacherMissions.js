import { useEffect, useState, useCallback } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { teacherService } from '../../services/teacherService';

const emptyQuestion = () => ({ text: '', options: [ { text: '', correct: true }, { text: '', correct: false } ] });

export default function TeacherMissions() {
  const [type, setType] = useState('NORMAL'); // NORMAL | DIARIA
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', points: 50, difficulty: 'medium' });
  const [questions, setQuestions] = useState([emptyQuestion(), emptyQuestion(), emptyQuestion(), emptyQuestion()]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teacherService.listMissions(type === 'DIARIA' ? 'DIARIA' : 'NORMAL');
      setMissions(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [type]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
      const init = async () => {
        try {
          const studentData = await teacherService.getStudents();
          setStudents(studentData);
        } catch (e) {
          console.error('No se pudieron cargar estudiantes', e);
        }
      };
      init();
  }, []);

  function updateQuestion(idx, patch) {
    setQuestions(qs => qs.map((q,i)=> i===idx ? { ...q, ...patch } : q));
  }
  function updateOption(qIdx, oIdx, patch) {
    setQuestions(qs => qs.map((q,i)=> i===qIdx ? { ...q, options: q.options.map((o,j)=> j===oIdx ? { ...o, ...patch } : o) } : q));
  }
  function addOption(qIdx) {
    setQuestions(qs => qs.map((q,i)=> i===qIdx ? { ...q, options: [...q.options, { text: '', correct: false }] } : q));
  }
  function setCorrectOption(qIdx, oIdx) {
    setQuestions(qs => qs.map((q,i)=> i===qIdx ? { ...q, options: q.options.map((o,j)=> ({ ...o, correct: j===oIdx })) } : q));
  }

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, type, points: Number(form.points) };
    if (type === 'DIARIA') {
      payload.questions = questions.filter(q=>q.text.trim()).map(q => ({
        text: q.text,
        options: q.options.filter(o=>o.text.trim())
      }));
    }
    if (type !== 'DIARIA' && selectedStudents.length) payload.assignedStudentIds = selectedStudents;
    try {
      await teacherService.createMission(payload);
      setForm({ title: '', description: '', points: 50, difficulty: 'medium' });
      setSelectedStudents([]);
      if (type === 'DIARIA') setQuestions([emptyQuestion(), emptyQuestion(), emptyQuestion(), emptyQuestion()]);
      load();
      alert('Misión creada');
    } catch (err) {
      alert(err.message || 'Error creando misión');
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Misiones del Profesor</h1>
      <div style={{ marginBottom: '1rem' }}>
        <Button onClick={()=> setType('NORMAL')} className={type==='NORMAL' ? 'btn-primary' : ''}>Misiones Normales</Button>{' '}
        <Button onClick={()=> setType('DIARIA')} className={type==='DIARIA' ? 'btn-primary' : ''}>Misiones Diarias</Button>
      </div>
      <form onSubmit={submit} style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', borderRadius: 8 }}>
        <h3>Nueva Misión {type === 'DIARIA' ? 'Diaria' : 'Normal'}</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input placeholder='Título' value={form.title} onChange={e=> setForm(f=> ({ ...f, title: e.target.value }))} required />
          <input placeholder='Puntos' type='number' value={form.points} onChange={e=> setForm(f=> ({ ...f, points: e.target.value }))} required />
          <select value={form.difficulty} onChange={e=> setForm(f=> ({ ...f, difficulty: e.target.value }))}>
            <option value='easy'>Fácil</option>
            <option value='medium'>Medio</option>
            <option value='hard'>Difícil</option>
          </select>
        </div>
        <textarea placeholder='Descripción' value={form.description} onChange={e=> setForm(f=> ({ ...f, description: e.target.value }))} style={{ width: '100%', marginTop: '0.5rem' }} rows={3} />
        {type !== 'DIARIA' && (
          <div style={{ marginTop: 8 }}>
            <h4>Asignar a estudiantes (opcional)</h4>
            <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid #e6e6e6', padding: 8 }}>
              {students.map(s => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <input type='checkbox' checked={selectedStudents.includes(s.id)} onChange={(e) => {
                    if (e.target.checked) setSelectedStudents(prev => [...prev, s.id]);
                    else setSelectedStudents(prev => prev.filter(x => x !== s.id));
                  }} />
                  <span>{s.name} <small style={{ color: '#666' }}>{s.email}</small></span>
                </label>
              ))}
            </div>
          </div>
        )}
        {type === 'DIARIA' && (
          <div style={{ marginTop: '1rem' }}>
            <h4>Preguntas (4-5)</h4>
            {questions.map((q, qi) => (
              <Card key={qi} style={{ padding: '0.5rem', marginBottom: '0.75rem' }}>
                <input placeholder={`Pregunta ${qi+1}`} value={q.text} onChange={e=> updateQuestion(qi, { text: e.target.value })} style={{ width: '100%', marginBottom: '0.5rem' }} />
                {q.options.map((o, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
                    <input placeholder={`Opción ${oi+1}`} value={o.text} onChange={e=> updateOption(qi, oi, { text: e.target.value })} style={{ flex: 1 }} />
                    <input type='radio' name={`correct-${qi}`} checked={o.correct} onChange={()=> setCorrectOption(qi, oi)} /> Correcta
                  </div>
                ))}
                <Button type='button' onClick={()=> addOption(qi)} size='small'>Añadir opción</Button>
              </Card>
            ))}
          </div>
        )}
        <Button type='submit' variant='primary'>Crear Misión</Button>
      </form>
      <h3>Misiones Creadas</h3>
      {loading && <LoadingSpinner />}
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px,1fr))' }}>
        {missions.map(m => (
          <Card key={m.id} style={{ padding: '0.75rem' }}>
            <h4 style={{ margin: 0 }}>{m.title}</h4>
            <p style={{ fontSize: 12 }}>{m.description}</p>
            <div style={{ fontSize: 12 }}>Puntos: {m.points} | Dificultad: {m.difficulty}</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>{m.type}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
