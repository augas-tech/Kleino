class Espacio < ApplicationRecord
  ESTADOS = %w[activo inactivo].freeze

  belongs_to :sede
  has_many :reservas, dependent: :restrict_with_error

  validates :nombre, presence: true
  validates :capacidad, numericality: { greater_than: 0 }
  validates :estado, inclusion: { in: ESTADOS }
end
