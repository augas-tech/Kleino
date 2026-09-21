class ApplicationController < ActionController::API
  # En modo API Rails no incluye el manejo de cookies: se agrega para la sesión.
  include ActionController::Cookies
  include Authentication
  wrap_parameters false
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "Recurso no encontrado" }, status: :not_found
  end

  rescue_from ActionController::ParameterMissing do |e|
    render json: { error: "Falta el parámetro: #{e.param}" }, status: :bad_request
  end
end
