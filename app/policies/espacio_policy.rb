class EspacioPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  # También se usa para validar que un espacio se pueda poner en una sede dada.
  def create?
    user.administrador? && (record.sede.nil? || record.sede.propietario_id == user.id)
  end

  def update?
    propietario?
  end

  def destroy?
    propietario?
  end

  class Scope < ApplicationPolicy::Scope
    # Usuario: solo espacios activos.
    # Administrador: los activos + todos los de sus propias sedes (incluidos los inactivos).
    def resolve
      if user.administrador?
        scope.joins(:sede).where("espacios.estado = ? OR sedes.propietario_id = ?", "activo", user.id)
      else
        scope.where(estado: "activo")
      end
    end
  end

  private

  def propietario?
    user.administrador? && record.sede.present? && record.sede.propietario_id == user.id
  end
end
