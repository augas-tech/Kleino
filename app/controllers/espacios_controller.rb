class EspaciosController < ApplicationController
  before_action :set_espacio, only: %i[ show update destroy ]

  def index
    render json: Espacio.order(:nombre)
  end

  def show
    render json: @espacio
  end

  def create
    espacio = Espacio.new(espacio_params)
    if espacio.save
      render json: espacio, status: :created
    else
      render json: { errors: espacio.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @espacio.update(espacio_params)
      render json: @espacio
    else
      render json: { errors: @espacio.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    if @espacio.destroy
      head :no_content
    else
      render json: { errors: @espacio.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_espacio
    @espacio = Espacio.find(params[:id])
  end

  def espacio_params
    params.permit(:nombre, :tipo, :capacidad, :ubicacion, :descripcion, :estado, :sede_id)
  end
end
