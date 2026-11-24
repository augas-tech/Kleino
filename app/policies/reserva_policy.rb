class ReservaPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  # Solo los usuarios reservan; el administrador gestiona espacios, no reserva.
  def create?
    user.usuario?
  end

  def update?
    propia?
  end

  def destroy?
    propia?
  end

  # El usuario cancela las suyas; el administrador cancela las de sus espacios
  # (así "saca" a quien esté usando la sala).
  def cancelar?
    propia? || de_un_espacio_propio?
  end

  class Scope < ApplicationPolicy::Scope
    # Administrador: reservas de sus espacios. Usuario: solo las propias.
    def resolve
      if user.administrador?
        scope.joins(espacio: :sede).where(sedes: { propietario_id: user.id })
      else
        scope.where(user_id: user.id)
      end
    end
  end

  private

  def propia?
    user.usuario? && record.user_id == user.id
  end

  def de_un_espacio_propio?
    user.administrador? && record.espacio&.sede&.propietario_id == user.id
  end
end
