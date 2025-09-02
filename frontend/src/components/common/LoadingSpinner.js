import "../../styles/LoadingSpinner.css"

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p>Cargando...</p>
    </div>
  )
}

export default LoadingSpinner
