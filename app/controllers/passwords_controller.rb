class PasswordsController < ApplicationController
  allow_unauthenticated_access
  before_action :set_user_by_token, only: %i[ edit update ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { render json: { error: "Demasiados intentos, intenta más tarde" }, status: :too_many_requests }

  # POST /passwords -> envía el email de recuperación (si el usuario existe)
  def create
    if user = User.find_by(email_address: params[:email_address].to_s.strip.downcase)
      PasswordsMailer.reset(user).deliver_later
    end

    render json: { message: "Si el email existe, enviamos las instrucciones para restablecer la contraseña" }
  end

  # GET /passwords/:token/edit -> valida que el token sea vigente
  def edit
    render json: { valid: true }
  end

  # PATCH/PUT /passwords/:token -> cambia la contraseña
  def update
    params.require(:password)

    if @user.update(params.permit(:password, :password_confirmation))
      @user.sessions.destroy_all
      render json: { message: "Contraseña actualizada" }
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_content
    end
  end

  private
    def set_user_by_token
      @user = User.find_by_password_reset_token!(params[:token])
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      render json: { error: "El enlace es inválido o expiró" }, status: :unprocessable_content
    end
end
