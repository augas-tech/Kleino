class ApplicationController < ActionController::API
  # En modo API Rails no incluye el manejo de cookies: se agrega para la sesión
  include ActionController::Cookies
  include Authentication
  wrap_parameters false

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActionController::ParameterMissing, with: :render_bad_request

  private

  def render_not_found
    render json: { error: "Recurso no encontrado" }, status: :not_found
  end

  def render_bad_request(e)
    render json: { error: "Falta el parámetro: #{e.param}" }, status: :bad_request
  end
end