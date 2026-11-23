class SedePolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def create?
    user.administrador?
  end

  def update?
    propietario?
  end

  def destroy?
    propietario?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end

  private

  def propietario?
    user.administrador? && record.propietario_id == user.id
  end
end
