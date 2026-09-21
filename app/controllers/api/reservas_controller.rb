module Api
  class ReservasController < ApplicationController
    before_action :set_reserva, only: [:show, :update, :destroy]

    def index
      render json: Reserva.all
    end

    def show
      render json: @reserva
    end

    def create
      reserva = Reserva.new(reserva_params)
      reserva.user = Current.user
      if reserva.save
        render json: reserva, status: :created
      else
        render json: { errors: reserva.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @reserva.update(reserva_params)
        render json: @reserva
      else
        render json: { errors: @reserva.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @reserva.destroy
      head :no_content
    end

    private

    def set_reserva
      @reserva = Reserva.find(params[:id])
    end

    def reserva_params
      params.require(:reserva).permit(:espacio_id, :fecha, :hora_inicio, :hora_fin, :estado)
    end
  end
end