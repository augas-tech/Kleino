class SedesController < ApplicationController
  before_action :set_sede, only: %i[ show update destroy ]
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  def index
    render json: policy_scope(Sede).order(:nombre)
  end

  def show
    authorize @sede
    render json: @sede
  end

  def create
    sede = Sede.new(sede_params)
    sede.propietario = Current.user
    authorize sede

    if sede.save
      render json: sede, status: :created
    else
      render json: { errors: sede.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    authorize @sede

    if @sede.update(sede_params)
      render json: @sede
    else
      render json: { errors: @sede.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    authorize @sede

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
