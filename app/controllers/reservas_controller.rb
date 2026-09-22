class ReservasController < ApplicationController
  before_action :set_reserva, only: %i[ show update destroy ]

  def index
    render json: Current.user.reservas.order(fecha: :desc)
  end

  def show
    render json: @reserva
  end

  def create
    reserva = Current.user.reservas.new(reserva_params)
    if reserva.save
      render json: reserva, status: :created
    else
      render json: { errors: reserva.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @reserva.update(reserva_params)
      render json: @reserva
    else
      render json: { errors: @reserva.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    if @reserva.destroy
      head :no_content
    else
      render json: { errors: @reserva.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_reserva
    @reserva = Current.user.reservas.find(params[:id])
  end

  def reserva_params
    params.permit(:espacio_id, :fecha, :hora_inicio, :hora_fin)
  end
end
