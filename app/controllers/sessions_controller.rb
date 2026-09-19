class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[ create ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { render json: { error: "Demasiados intentos, intenta más tarde" }, status: :too_many_requests }

  # GET /session -> usuario de la sesión actual (React lo usa al cargar la app).
  def show
    render json: { user: Current.user.as_public_json }
  end

  # POST /session -> login
  def create
    user = User.authenticate_by(email_address: params[:email_address].to_s, password: params[:password].to_s)

    if user
      start_new_session_for user
      render json: { user: user.as_public_json }, status: :created
    else
      render json: { error: "Email o contraseña incorrectos" }, status: :unauthorized
    end
  end

  # DELETE /session -> logout
  def destroy
    terminate_session
    head :no_content
  end
end
