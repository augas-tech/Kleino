class Espacio < ApplicationRecord
  ESTADOS = %w[activo inactivo].freeze

  belongs_to :sede
  has_many :reservas, dependent: :restrict_with_error

  validates :nombre, presence: true
  validates :capacidad, numericality: { greater_than: 0 }
  validates :estado, inclusion: { in: ESTADOS }
  validate :horario_coherente

  def activo?
    estado == "activo"
  end

  def horario_definido?
    hora_apertura.present? && hora_cierre.present?
  end

  # true si el rango [inicio, fin] cabe dentro del horario del espacio
  # (si el espacio no tiene horario, está disponible todo el día).
  def abierto_entre?(inicio, fin)
    return true unless horario_definido?

    inicio.seconds_since_midnight >= hora_apertura.seconds_since_midnight &&
      fin.seconds_since_midnight <= hora_cierre.seconds_since_midnight
  end

  def horario_texto
    "#{hora_apertura.strftime('%H:%M')} y #{hora_cierre.strftime('%H:%M')}"
  end

  private

  def horario_coherente
    if hora_apertura.blank? != hora_cierre.blank?
      errors.add(:base, "el horario requiere hora_apertura y hora_cierre")
    elsif horario_definido? && hora_cierre <= hora_apertura
      errors.add(:hora_cierre, "debe ser posterior a hora_apertura")
    end
  end
end
