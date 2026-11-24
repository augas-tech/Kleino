class ApplicationController < ActionController::API
  # En modo API Rails no incluye el manejo de cookies: se agrega para la sesión.
  include ActionController::Cookies
  include Authentication
  include Pundit::Authorization
  wrap_parameters false
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "Recurso no encontrado" }, status: :not_found
  end

  rescue_from ActionController::ParameterMissing do |e|
    render json: { error: "Falta el parámetro: #{e.param}" }, status: :bad_request
  end

  # Sin sesión -> 401 (lo resuelve Authentication). Con sesión pero sin permiso -> 403.
  rescue_from Pundit::NotAuthorizedError do
    render json: { error: "No tienes permiso para realizar esta acción" }, status: :forbidden
  end

  private

  # Pundit evalúa los permisos contra el usuario de la sesión actual.
  def pundit_user
    Current.user
  end
end
