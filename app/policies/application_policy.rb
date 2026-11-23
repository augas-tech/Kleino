# Base de las políticas de autorización (Pundit). Por defecto todo está prohibido:
# cada política concreta habilita explícitamente lo que corresponde.
class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def update?
    false
  end

  def destroy?
    false
  end

  class Scope
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      raise NotImplementedError, "#{self.class} debe implementar #resolve"
    end

    private

    attr_reader :user, :scope
  end
end
