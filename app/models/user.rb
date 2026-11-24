class User < ApplicationRecord
  ROLES = %w[usuario administrador].freeze

  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :reservas, dependent: :destroy
  has_many :sedes, foreign_key: :propietario_id, inverse_of: :propietario, dependent: :restrict_with_error

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :email_address, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, allow_nil: true
  validates :rol, inclusion: { in: ROLES }

  def administrador?
    rol == "administrador"
  end

  def usuario?
    rol == "usuario"
  end

  # Datos que se pueden exponer por la API (nunca password_digest).
  def as_public_json
    { id: id, email_address: email_address, rol: rol }
  end
end
