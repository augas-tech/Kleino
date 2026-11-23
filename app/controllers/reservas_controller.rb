class ReservasController < ApplicationController
  before_action :set_reserva, only: %i[ show update destroy cancelar ]
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  def index
    render json: policy_scope(Reserva).order(fecha: :desc)
  end

  def show
    authorize @reserva
    render json: @reserva
  end

  def create
    reserva = Current.user.reservas.new(reserva_params)
    authorize reserva

    if reserva.save
      render json: reserva, status: :created
    else
      render json: { errors: reserva.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    authorize @reserva

    if @reserva.update(reserva_params)
      render json: @reserva
    else
      render json: { errors: @reserva.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    authorize @reserva

    if @reserva.destroy
      head :no_content
    else
      render json: { errors: @reserva.errors.full_messages }, status: :unprocessable_content
    end
  end

  # PATCH /reservas/:id/cancelar
  def cancelar
    authorize @reserva

    if @reserva.update(estado: "cancelada")
      render json: @reserva
    else
      render json: { errors: @reserva.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  # Solo busca entre las reservas que el usuario puede ver (las ajenas dan 404).
  def set_reserva
    @reserva = policy_scope(Reserva).find(params[:id])
  end

  def reserva_params
    params.permit(:espacio_id, :fecha, :hora_inicio, :hora_fin)
  end
end
