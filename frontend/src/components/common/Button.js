"use client"
import "../../styles/Button.css"

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${disabled || loading ? "btn-disabled" : ""} ${className}`

  return (
    <button type={type} className={buttonClass} disabled={disabled || loading} onClick={onClick} {...props}>
      {loading ? (
        <span className="btn-loading">
          <span className="btn-spinner"></span>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
