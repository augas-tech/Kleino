class RegistrationsController < ApplicationController
  allow_unauthenticated_access only: %i[ create ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { render json: { error: "Demasiados intentos, intenta más tarde" }, status: :too_many_requests }

  # POST /registration -> crea el usuario e inicia sesión
  def create
    user = User.new(params.permit(:email_address, :password, :password_confirmation))

    if user.save
      start_new_session_for user
      render json: { user: user.as_public_json }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_content
    end
  end
end
