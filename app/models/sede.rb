class Sede < ApplicationRecord
  has_many :espacios, dependent: :restrict_with_error

  validates :nombre, presence: true
end
