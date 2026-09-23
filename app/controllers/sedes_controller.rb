class SedesController < ApplicationController
  before_action :set_sede, only: %i[ show update destroy ]

  def index
    render json: Sede.order(:nombre)
  end

  def show
    render json: @sede
  end

  def create
    sede = Sede.new(sede_params)
    if sede.save
      render json: sede, status: :created
    else
      render json: { errors: sede.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @sede.update(sede_params)
      render json: @sede
    else
      render json: { errors: @sede.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    if @sede.destroy
      head :no_content
    else
      render json: { errors: @sede.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_sede
    @sede = Sede.find(params[:id])
  end

  def sede_params
    params.permit(:nombre, :direccion)
  end
end
