module Api
  class SedesController < ApplicationController
    before_action :set_sede, only: [:show, :update, :destroy]

    def index
      render json: Sede.all
    end

    def show
      render json: @sede
    end

    def create
      sede = Sede.new(sede_params)
      if sede.save
        render json: sede, status: :created
      else
        render json: { errors: sede.errors }, status: :unprocessable_entity
      end
    end

    def update
      if @sede.update(sede_params)
        render json: @sede
      else
        render json: { errors: @sede.errors }, status: :unprocessable_entity
      end
    end

    def destroy
      @sede.destroy
      head :no_content
    end

    private

    def set_sede
      @sede = Sede.find(params[:id])
    end

    def sede_params
      params.require(:sede).permit(:nombre, :direccion)
    end
  end
end
