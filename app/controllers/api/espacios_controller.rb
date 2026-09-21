module Api
  class EspaciosController < ApplicationController
    before_action :set_espacio, only: [:show, :update, :destroy]

    def index
      render json: Espacio.all
    end

    def show
      render json: @espacio
    end

    def create
      espacio = Espacio.new(espacio_params)
      if espacio.save
        render json: espacio, status: :created
      else
        render json: { errors: espacio.errors }, status: :unprocessable_entity
      end
    end

    def update
      if @espacio.update(espacio_params)
        render json: @espacio
      else
        render json: { errors: @espacio.errors }, status: :unprocessable_entity
      end
    end

    def destroy
      @espacio.destroy
      head :no_content
    end

    private

    def set_espacio
      @espacio = Espacio.find(params[:id])
    end

    def espacio_params
      params.require(:espacio).permit(:nombre, :tipo, :capacidad, :ubicacion, :descripcion, :estado, :sede_id)
    end
  end
end
