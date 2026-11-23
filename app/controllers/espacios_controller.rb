class EspaciosController < ApplicationController
  before_action :set_espacio, only: %i[ show update destroy ]
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  def index
    render json: policy_scope(Espacio).order(:nombre)
  end

  def show
    authorize @espacio
    render json: @espacio
  end

  def create
    espacio = Espacio.new(espacio_params)
    authorize espacio

    if espacio.save
      render json: espacio, status: :created
    else
      render json: { errors: espacio.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    authorize @espacio
    @espacio.assign_attributes(espacio_params)
    # Si lo cambian de sede, la sede nueva también tiene que ser del administrador.
    authorize @espacio, :create? if @espacio.sede_id_changed?

    if @espacio.save
      render json: @espacio
    else
      render json: { errors: @espacio.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    authorize @espacio

    if @espacio.destroy
      head :no_content
    else
      render json: { errors: @espacio.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  # Solo busca entre los espacios que el usuario puede ver (un espacio inactivo ajeno da 404).
  def set_espacio
    @espacio = policy_scope(Espacio).find(params[:id])
  end

  def espacio_params
    params.permit(:nombre, :tipo, :capacidad, :ubicacion, :descripcion, :estado, :sede_id, :hora_apertura, :hora_cierre)
  end
end
