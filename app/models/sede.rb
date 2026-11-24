class Sede < ApplicationRecord
  # Administrador dueño de la sede (y, por lo tanto, de los espacios que hay dentro).
  belongs_to :propietario, class_name: "User", optional: true
  has_many :espacios, dependent: :restrict_with_error

  validates :nombre, presence: true
  validates :propietario, presence: true, on: :create
end
